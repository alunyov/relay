/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::Diagnostic;
use common::DiagnosticsResult;
use common::DirectiveName;
use common::Location;
use common::NamedItem;
use docblock_shared::RELAY_RESOLVER_DIRECTIVE_NAME;
use errors::validate;
use graphql_ir::Condition;
use graphql_ir::Directive;
use graphql_ir::Field;
use graphql_ir::FragmentDefinition;
use graphql_ir::FragmentSpread;
use graphql_ir::InlineFragment;
use graphql_ir::LinkedField;
use graphql_ir::OperationDefinition;
use graphql_ir::Program;
use graphql_ir::ScalarField;
use graphql_ir::Selection;
use graphql_ir::Validator;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use lazy_static::lazy_static;
use schema::Schema;
use thiserror::Error;

lazy_static! {
    pub static ref WRITABLE_DIRECTIVE: DirectiveName = DirectiveName("writable".intern());
    static ref ALLOW_LISTED_DIRECTIVES: Vec<DirectiveName> = vec![
        *WRITABLE_DIRECTIVE,
        DirectiveName("fb_owner".intern()),
        DirectiveName("argumentDefinitions".intern()),
    ];
}

#[derive(Debug, Error, serde::Serialize)]
#[serde(tag = "type")]
pub enum ValidationMessage {
    #[error(
        "The @{disallowed_directive_name} directive is not allowed in @writable fragments."
    )]
    WritableDisallowOtherDirectives {
        disallowed_directive_name: StringKey,
    },

    #[error("Fragment spreads are not allowed within @writable fragments.")]
    WritableNoFragmentSpreads,

    #[error("The directives @include and @skip are not allowed within @writable fragments.")]
    WritableNoConditions,

    #[error("Fields defined using Relay Resolvers are not allowed within @writable fragments.")]
    WritableDisallowRelayResolvers,

    #[error(
        "Within @writable fragments, if a linked field contains an inline fragment spread, it must contain only inline fragment spreads."
    )]
    WritableOnlyInlineFragments,

    #[error(
        "Within @writable fragments, inline fragments are only allowed on interfaces or unions, not on concrete types."
    )]
    WritableInlineFragmentsOnlyOnInterfacesOrUnions,

    #[error(
        "Within @writable fragments, each inline fragment spread must have a type condition. An inline fragment without a type condition was among the selections of {parent_field_type}."
    )]
    WritableInlineFragmentsRequireTypeConditions {
        parent_field_type: StringKey,
    },

    #[error(
        "Within @writable fragments, each inline fragment spread must have a type condition narrowing the type to a unique concrete type. `{type_condition}` is not a concrete type."
    )]
    WritableInlineFragmentsTypeConditionsMustBeConcrete {
        type_condition: StringKey,
    },

    #[error(
        "Within @writable fragments, inline fragments must include an unaliased __typename field. The inline fragment on {parent_field_alias_or_name} is missing __typename."
    )]
    WritableInlineFragmentsMustHaveTypenameFields {
        parent_field_alias_or_name: StringKey,
    },

    #[error("Nested inline fragments are not allowed within @writable fragments.")]
    WritableNoNestedInlineFragments {
        fragment_name: StringKey,
    },

    #[error("The @writable directive can only be applied to fragments, not queries or mutations.")]
    WritableOnlyOnFragments,

    #[error(
        "Within @writable fragments, all inline fragments must refine to the same concrete type. Found inline fragments refining to `{first_type}` and `{second_type}`."
    )]
    WritableInlineFragmentsMustRefineToSameType {
        first_type: StringKey,
        second_type: StringKey,
    },
}

pub fn validate_writable_directive(program: &Program) -> DiagnosticsResult<()> {
    WritableDirective::new(program).validate_program(program)
}

#[derive(Copy, Clone)]
struct FragmentInfo {
    name: StringKey,
    location: Location,
}

struct WritableDirective<'a> {
    fragment_info: Option<FragmentInfo>,
    program: &'a Program,
    /// Tracks the first concrete type encountered in inline fragments across the entire fragment
    first_inline_fragment_type: Option<(StringKey, Location)>,
}

impl<'a> WritableDirective<'a> {
    fn new(program: &'a Program) -> Self {
        Self {
            program,
            fragment_info: None,
            first_inline_fragment_type: None,
        }
    }

    fn validate_inline_fragments_with_parent(
        &mut self,
        parent_field: &LinkedField,
        inline_fragments: Vec<&InlineFragment>,
    ) -> DiagnosticsResult<()> {
        // If we have no inline fragments, return early
        if inline_fragments.is_empty() {
            return Ok(());
        }

        let mut errors = vec![];

        // If a linked field contains inline fragments, it must *only* contain inline fragments.
        if parent_field.selections.len() != inline_fragments.len() {
            errors.push(Diagnostic::error(
                ValidationMessage::WritableOnlyInlineFragments,
                parent_field.definition.location,
            ));
        }

        // Inline fragments are only allowed if the parent type is an interface or union
        let parent_field_id = parent_field.definition.item;
        let parent_named_type = self.program.schema.field(parent_field_id).type_.inner();
        if !parent_named_type.is_abstract_type() {
            errors.push(Diagnostic::error(
                ValidationMessage::WritableInlineFragmentsOnlyOnInterfacesOrUnions,
                parent_field.definition.location,
            ));
        }

        for inline_fragment in inline_fragments.into_iter() {
            // Validate type condition
            match inline_fragment.type_condition {
                None => errors.push(Diagnostic::error(
                    ValidationMessage::WritableInlineFragmentsRequireTypeConditions {
                        parent_field_type: self.program.schema.get_type_name(parent_named_type),
                    },
                    parent_field.definition.location,
                )),
                Some(type_condition) => {
                    let type_condition_name = self.program.schema.get_type_name(type_condition);
                    if type_condition.is_abstract_type() {
                        errors.push(Diagnostic::error(
                            ValidationMessage::WritableInlineFragmentsTypeConditionsMustBeConcrete {
                                type_condition: type_condition_name,
                            },
                            parent_field.definition.location,
                        ))
                    }

                    // Check if all inline fragments refine to the same type across the entire fragment
                    match self.first_inline_fragment_type {
                        None => {
                            // First inline fragment we've seen - remember its type
                            self.first_inline_fragment_type = Some((type_condition_name, parent_field.definition.location));
                        }
                        Some((first_type, first_location)) => {
                            if first_type != type_condition_name {
                                // Found a different type - this is an error
                                errors.push(
                                    Diagnostic::error(
                                        ValidationMessage::WritableInlineFragmentsMustRefineToSameType {
                                            first_type,
                                            second_type: type_condition_name,
                                        },
                                        parent_field.definition.location,
                                    )
                                    .annotate("First inline fragment type was encountered here:", first_location)
                                );
                            }
                        }
                    }
                }
            }

            // Check for __typename field with no alias
            if !inline_fragment.selections.iter().any(|selection| {
                if let Selection::ScalarField(scalar_field) = selection {
                    scalar_field.definition.item == self.program.schema.typename_field()
                        && scalar_field.alias.is_none()
                } else {
                    false
                }
            }) {
                errors.push(Diagnostic::error(
                    ValidationMessage::WritableInlineFragmentsMustHaveTypenameFields {
                        parent_field_alias_or_name: parent_field
                            .alias_or_name(&self.program.schema),
                    },
                    parent_field.definition.location,
                ))
            }
        }

        if errors.is_empty() {
            Ok(())
        } else {
            Err(errors)
        }
    }
}

impl Validator for WritableDirective<'_> {
    const NAME: &'static str = "WritableDirective";
    const VALIDATE_ARGUMENTS: bool = false;
    const VALIDATE_DIRECTIVES: bool = true;

    fn validate_operation(&mut self, operation: &OperationDefinition) -> DiagnosticsResult<()> {
        if operation.directives.named(*WRITABLE_DIRECTIVE).is_some() {
            Err(vec![Diagnostic::error(
                ValidationMessage::WritableOnlyOnFragments,
                operation.name.location,
            )])
        } else {
            Ok(())
        }
    }

    fn validate_fragment(&mut self, fragment: &FragmentDefinition) -> DiagnosticsResult<()> {
        if fragment.directives.named(*WRITABLE_DIRECTIVE).is_some() {
            self.fragment_info = Some(FragmentInfo {
                name: fragment.name.item.0,
                location: fragment.name.location,
            });
            // Reset the inline fragment type tracker for this new fragment
            self.first_inline_fragment_type = None;
            self.default_validate_fragment(fragment)
        } else {
            Ok(())
        }
    }

    fn validate_directive(&mut self, directive: &Directive) -> DiagnosticsResult<()> {
        if !ALLOW_LISTED_DIRECTIVES.contains(&directive.name.item) {
            Err(vec![Diagnostic::error(
                ValidationMessage::WritableDisallowOtherDirectives {
                    disallowed_directive_name: directive.name.item.0,
                },
                directive.location,
            )])
        } else {
            Ok(())
        }
    }

    fn validate_scalar_field(&mut self, field: &ScalarField) -> DiagnosticsResult<()> {
        let field_def = self.program.schema.field(field.definition.item);
        if field_def
            .directives
            .named(*RELAY_RESOLVER_DIRECTIVE_NAME)
            .is_some()
        {
            return Err(vec![
                Diagnostic::error(
                    ValidationMessage::WritableDisallowRelayResolvers,
                    field.definition.location,
                )
                .annotate("The field is defined here:", field_def.name.location),
            ]);
        }
        self.default_validate_scalar_field(field)
    }

    fn validate_linked_field(&mut self, linked_field: &LinkedField) -> DiagnosticsResult<()> {
        let field_def = self.program.schema.field(linked_field.definition.item);
        if field_def
            .directives
            .named(*RELAY_RESOLVER_DIRECTIVE_NAME)
            .is_some()
        {
            return Err(vec![
                Diagnostic::error(
                    ValidationMessage::WritableDisallowRelayResolvers,
                    linked_field.definition.location,
                )
                .annotate("The field is defined here:", field_def.name.location),
            ]);
        }

        // Collect inline fragments
        let inline_fragments: Vec<&InlineFragment> = linked_field
            .selections
            .iter()
            .filter_map(|selection| {
                if let Selection::InlineFragment(inline_fragment) = selection {
                    Some(inline_fragment.as_ref())
                } else {
                    None
                }
            })
            .collect();

        validate!(
            self.validate_inline_fragments_with_parent(linked_field, inline_fragments),
            self.validate_selections(&linked_field.selections),
            self.validate_directives(&linked_field.directives)
        )
    }

    fn validate_fragment_spread(
        &mut self,
        fragment_spread: &FragmentSpread,
    ) -> DiagnosticsResult<()> {
        // Fragment spreads are not allowed in writable fragments
        Err(vec![Diagnostic::error(
            ValidationMessage::WritableNoFragmentSpreads,
            fragment_spread.fragment.location,
        )])
    }

    fn validate_inline_fragment(
        &mut self,
        inline_fragment: &InlineFragment,
    ) -> DiagnosticsResult<()> {
        let mut errors = vec![];

        // Track the type condition for root-level inline fragments
        if let Some(type_condition) = inline_fragment.type_condition {
            if type_condition.is_object() {
                // Concrete type - check if it matches previous inline fragments
                let type_condition_name = self.program.schema.get_type_name(type_condition);
                match self.first_inline_fragment_type {
                    None => {
                        // First inline fragment - remember its type
                        self.first_inline_fragment_type = Some((type_condition_name, inline_fragment.spread_location));
                    }
                    Some((first_type, first_location)) => {
                        if first_type != type_condition_name {
                            // Different type - error!
                            errors.push(
                                Diagnostic::error(
                                    ValidationMessage::WritableInlineFragmentsMustRefineToSameType {
                                        first_type,
                                        second_type: type_condition_name,
                                    },
                                    inline_fragment.spread_location,
                                )
                                .annotate("First inline fragment type was encountered here:", first_location)
                            );
                        }
                    }
                }
            }
        }

        // Check for nested inline fragments
        for selection in &inline_fragment.selections {
            if matches!(selection, Selection::InlineFragment(_)) {
                errors.push(Diagnostic::error(
                    ValidationMessage::WritableNoNestedInlineFragments {
                        fragment_name: self.fragment_info.unwrap().name,
                    },
                    self.fragment_info.unwrap().location,
                ));
            }
        }

        if errors.is_empty() {
            validate!(
                self.validate_selections(&inline_fragment.selections),
                self.validate_directives(&inline_fragment.directives)
            )
        } else {
            validate!(
                Err::<(), Vec<Diagnostic>>(errors),
                self.validate_selections(&inline_fragment.selections),
                self.validate_directives(&inline_fragment.directives)
            )
        }
    }

    fn validate_condition(&mut self, condition: &Condition) -> DiagnosticsResult<()> {
        Err(vec![Diagnostic::error(
            ValidationMessage::WritableNoConditions,
            condition.location,
        )])
    }
}
