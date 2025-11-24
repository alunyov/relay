/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

import type {
  MissingFieldHandler,
  RecordProxy,
  RecordSourceProxy,
} from '../store/RelayStoreTypes';
import type {
  ReaderLinkedField,
  ReaderScalarField,
  ReaderSelection,
} from '../util/ReaderNode';
import type {Variables} from '../util/RelayRuntimeTypes';

const {getArgumentValues, getStableStorageKey} = require('../store/RelayStoreUtils');

const nonUpdatableKeys = ['id', '__id', '__typename', 'js'];

function createWritableProxy<TData: {...}>(
  writableProxyRootRecord: RecordProxy,
  variables: Variables,
  selections: $ReadOnlyArray<ReaderSelection>,
  recordSourceProxy: RecordSourceProxy,
  missingFieldHandlers: $ReadOnlyArray<MissingFieldHandler>,
): TData {
  const mutableWritableProxy = {};
  updateProxyFromSelections(
    mutableWritableProxy,
    writableProxyRootRecord,
    variables,
    selections,
    recordSourceProxy,
    missingFieldHandlers,
  );
  // Don't freeze for writable proxies - they need to be mutable
  // $FlowFixMe[unclear-type]
  return mutableWritableProxy as any as TData;
}

function updateProxyFromSelections<TData>(
  mutableWritableProxy: TData,
  writableProxyRootRecord: RecordProxy,
  variables: Variables,
  selections: $ReadOnlyArray<ReaderSelection>,
  recordSourceProxy: RecordSourceProxy,
  missingFieldHandlers: $ReadOnlyArray<MissingFieldHandler>,
): void {
  for (let i = 0; i < selections.length; i++) {
    const selection = selections[i];
    switch (selection.kind) {
      case 'LinkedField':
        if (selection.plural) {
          Object.defineProperty(
            mutableWritableProxy,
            selection.alias ?? selection.name,
            {
              get: createGetterForPluralLinkedField(
                selection,
                variables,
                writableProxyRootRecord,
                recordSourceProxy,
                missingFieldHandlers,
              ),
              set: createSetterForPluralLinkedField(
                selection,
                variables,
                writableProxyRootRecord,
                recordSourceProxy,
              ),
            },
          );
        } else {
          Object.defineProperty(
            mutableWritableProxy,
            selection.alias ?? selection.name,
            {
              get: createGetterForSingularLinkedField(
                selection,
                variables,
                writableProxyRootRecord,
                recordSourceProxy,
                missingFieldHandlers,
              ),
              set: createSetterForSingularLinkedField(
                selection,
                variables,
                writableProxyRootRecord,
                recordSourceProxy,
              ),
            },
          );
        }
        break;
      case 'ScalarField':
        const scalarFieldName = selection.alias ?? selection.name;
        Object.defineProperty(mutableWritableProxy, scalarFieldName, {
          get() {
            const newVariables = getArgumentValues(
              selection.args ?? [],
              variables,
            );
            // $FlowFixMe[unclear-type] Typed by the generated writable fragment flow type
            let value: any = writableProxyRootRecord.getValue(
              selection.name,
              newVariables,
            );
            if (value == null) {
              value = getScalarUsingMissingFieldHandlers(
                selection,
                newVariables,
                writableProxyRootRecord,
                recordSourceProxy,
                missingFieldHandlers,
              );
            }
            return value;
          },
          set: nonUpdatableKeys.includes(selection.name)
            ? undefined
            : // $FlowFixMe[unclear-type] Typed by the generated writable fragment flow type
              function (newValue: ?any) {
                const newVariables = getArgumentValues(
                  selection.args ?? [],
                  variables,
                );
                // $FlowFixMe[prop-missing] setValue__UNSAFE exists on the implementation
                writableProxyRootRecord.setValue__UNSAFE(
                  newValue,
                  selection.name,
                  newVariables,
                );
              },
        });
        break;
      case 'InlineFragment':
        if (writableProxyRootRecord.getType() === selection.type) {
          updateProxyFromSelections(
            mutableWritableProxy,
            writableProxyRootRecord,
            variables,
            selection.selections,
            recordSourceProxy,
            missingFieldHandlers,
          );
        }
        break;
      case 'ClientExtension':
        updateProxyFromSelections(
          mutableWritableProxy,
          writableProxyRootRecord,
          variables,
          selection.selections,
          recordSourceProxy,
          missingFieldHandlers,
        );
        break;
      case 'FragmentSpread':
        // Explicitly ignore
        break;
      case 'Condition':
      case 'ActorChange':
      case 'InlineDataFragmentSpread':
      case 'AliasedInlineFragmentSpread':
      case 'ClientEdgeToClientObject':
      case 'ClientEdgeToServerObject':
      case 'Defer':
      case 'ModuleImport':
      case 'RequiredField':
      case 'CatchField':
      case 'Stream':
      case 'RelayResolver':
      case 'RelayLiveResolver':
        // These types of reader nodes are not currently handled.
        throw new Error(
          'Encountered an unexpected ReaderSelection variant in RelayRecordSourceProxy. This indicates a bug in Relay.',
        );
      default:
        selection.kind as empty;
        throw new Error(
          'Encountered an unexpected ReaderSelection variant in RelayRecordSourceProxy. This indicates a bug in Relay.',
        );
    }
  }
}

function createSetterForPluralLinkedField(
  selection: ReaderLinkedField,
  variables: Variables,
  writableProxyRootRecord: RecordProxy,
  recordSourceProxy: RecordSourceProxy,
) {
  return function set(newValue: $ReadOnlyArray<{__id?: string, ...}>) {
    const newVariables = getArgumentValues(selection.args ?? [], variables);
    if (newValue == null) {
      throw new Error(
        'Do not assign null to plural linked fields; assign an empty array instead.',
      );
    } else {
      const recordProxies = newValue.map((item): ?RecordProxy => {
        if (item == null) {
          throw new Error(
            'When assigning an array of items, none of the items should be null or undefined.',
          );
        }
        const {__id, __typename, ...fields} = item;

        if (__id != null) {
          // Strong type: Link to existing record by ID
          const newValueRecord = recordSourceProxy.get(__id);
          if (newValueRecord == null) {
            throw new Error(
              `Did not find item with data id ${__id} in the store.`,
            );
          }
          return newValueRecord;
        } else {
          // Weak type: Create new record inline with provided fields
          const {generateClientID} = require('../store/ClientID');
          const typeName = __typename ?? selection.concreteType;

          if (typeName == null) {
            throw new Error(
              'Unable to create a new linked record without a type name. ' +
              'Either provide __typename in each object or ensure the field has a concrete type.',
            );
          }

          // Generate a new client ID for the record
          const newRecordID = generateClientID();
          const newRecord = recordSourceProxy.create(newRecordID, typeName);

          // Set all provided fields on the new record
          for (const fieldName in fields) {
            if (fields.hasOwnProperty(fieldName)) {
              const fieldValue = fields[fieldName];
              // $FlowFixMe[incompatible-call]
              newRecord.setValue(fieldValue, fieldName);
            }
          }

          return newRecord;
        }
      });
      writableProxyRootRecord.setLinkedRecords(
        recordProxies,
        selection.name,
        newVariables,
      );
    }
  };
}

function createSetterForSingularLinkedField(
  selection: ReaderLinkedField,
  variables: Variables,
  writableProxyRootRecord: RecordProxy,
  recordSourceProxy: RecordSourceProxy,
) {
  return function set(newValue: ?{__id?: string, ...}) {
    const newVariables = getArgumentValues(selection.args ?? [], variables);
    if (newValue == null) {
      writableProxyRootRecord.setValue(newValue, selection.name, newVariables);
    } else {
      const {__id, __typename, ...fields} = newValue;

      if (__id != null) {
        // Strong type: Link to existing record by ID
        const newValueRecord = recordSourceProxy.get(__id);
        if (newValueRecord == null) {
          throw new Error(`Did not find item with data id ${__id} in the store.`);
        }
        writableProxyRootRecord.setLinkedRecord(
          newValueRecord,
          selection.name,
          newVariables,
        );
      } else {
        // Weak type: Create new record inline with provided fields
        const {generateClientID} = require('../store/ClientID');
        const typeName = __typename ?? selection.concreteType;

        if (typeName == null) {
          throw new Error(
            'Unable to create a new linked record without a type name. ' +
            'Either provide __typename in the object or ensure the field has a concrete type.',
          );
        }

        // Generate a new client ID for the record
        const newRecordID = generateClientID();
        const newRecord = recordSourceProxy.create(newRecordID, typeName);

        // Set all provided fields on the new record
        for (const fieldName in fields) {
          if (fields.hasOwnProperty(fieldName)) {
            const fieldValue = fields[fieldName];
            // $FlowFixMe[incompatible-call]
            newRecord.setValue(fieldValue, fieldName);
          }
        }

        // Link the new record to the parent
        writableProxyRootRecord.setLinkedRecord(
          newRecord,
          selection.name,
          newVariables,
        );
      }
    }
  };
}

function createGetterForPluralLinkedField(
  selection: ReaderLinkedField,
  variables: Variables,
  writableProxyRootRecord: RecordProxy,
  recordSourceProxy: RecordSourceProxy,
  missingFieldHandlers: $ReadOnlyArray<MissingFieldHandler>,
): () => $FlowFixMe {
  return function () {
    const newVariables = getArgumentValues(selection.args ?? [], variables);
    let linkedRecords = writableProxyRootRecord.getLinkedRecords(
      selection.name,
      newVariables,
    );

    if (linkedRecords === undefined) {
      linkedRecords = getPluralLinkedRecordUsingMissingFieldHandlers(
        selection,
        newVariables,
        writableProxyRootRecord,
        recordSourceProxy,
        missingFieldHandlers,
      );
    }

    if (linkedRecords != null) {
      return linkedRecords.map(linkedRecord => {
        if (linkedRecord != null) {
          const writableProxy = {};
          updateProxyFromSelections(
            writableProxy,
            linkedRecord,
            variables,
            selection.selections,
            recordSourceProxy,
            missingFieldHandlers,
          );
          // Don't freeze - writable proxies need to be mutable
          // $FlowFixMe[unclear-type] Typed by the generated writable fragment flow type
          return (writableProxy: any);
        } else {
          return linkedRecord;
        }
        // $FlowFixMe[unclear-type] Typed by the generated writable fragment flow type
      }) as any;
    } else {
      return linkedRecords;
    }
  };
}

function createGetterForSingularLinkedField(
  selection: ReaderLinkedField,
  variables: Variables,
  writableProxyRootRecord: RecordProxy,
  recordSourceProxy: RecordSourceProxy,
  missingFieldHandlers: $ReadOnlyArray<MissingFieldHandler>,
): () => ?$FlowFixMe {
  return function () {
    const newVariables = getArgumentValues(selection.args ?? [], variables);
    let linkedRecord = writableProxyRootRecord.getLinkedRecord(
      selection.name,
      newVariables,
    );
    if (linkedRecord === undefined) {
      linkedRecord = getLinkedRecordUsingMissingFieldHandlers(
        selection,
        newVariables,
        writableProxyRootRecord,
        recordSourceProxy,
        missingFieldHandlers,
      );
    }

    if (linkedRecord != null) {
      const writableProxy = {};
      updateProxyFromSelections(
        writableProxy,
        linkedRecord,
        variables,
        selection.selections,
        recordSourceProxy,
        missingFieldHandlers,
      );
      // Don't freeze - writable proxies need to be mutable
      // $FlowFixMe[unclear-type] Typed by the generated writable fragment flow type
      return writableProxy as any;
    } else {
      // If linkedRecord is null/undefined, return a lazy-create proxy
      // This allows setting fields on a linked record that doesn't exist yet
      return createLazyLinkedRecordProxy(
        selection,
        variables,
        writableProxyRootRecord,
        recordSourceProxy,
        missingFieldHandlers,
      );
    }
  };
}

function getLinkedRecordUsingMissingFieldHandlers(
  selection: ReaderLinkedField,
  newVariables: Variables,
  writableProxyRootRecord: RecordProxy,
  recordSourceProxy: RecordSourceProxy,
  missingFieldHandlers: $ReadOnlyArray<MissingFieldHandler>,
): ?RecordProxy {
  for (let i = 0; i < missingFieldHandlers.length; i++) {
    const handler = missingFieldHandlers[i];
    if (handler.kind === 'linked') {
      const newId = handler.handle(
        selection,
        writableProxyRootRecord,
        newVariables,
        recordSourceProxy,
      );
      if (newId != null) {
        return recordSourceProxy.get(newId);
      }
    }
  }
}

function getPluralLinkedRecordUsingMissingFieldHandlers(
  selection: ReaderLinkedField,
  newVariables: Variables,
  writableProxyRootRecord: RecordProxy,
  recordSourceProxy: RecordSourceProxy,
  missingFieldHandlers: $ReadOnlyArray<MissingFieldHandler>,
): ?Array<?RecordProxy> {
  for (let i = 0; i < missingFieldHandlers.length; i++) {
    const handler = missingFieldHandlers[i];
    if (handler.kind === 'pluralLinked') {
      const newIds = handler.handle(
        selection,
        writableProxyRootRecord,
        newVariables,
        recordSourceProxy,
      );
      if (newIds != null) {
        return newIds.map(newId => {
          if (newId != null) {
            return recordSourceProxy.get(newId);
          }
        });
      }
    }
  }
}

function getScalarUsingMissingFieldHandlers(
  selection: ReaderScalarField,
  newVariables: Variables,
  writableProxyRootRecord: RecordProxy,
  recordSourceProxy: RecordSourceProxy,
  missingFieldHandlers: $ReadOnlyArray<MissingFieldHandler>,
): mixed {
  for (let i = 0; i < missingFieldHandlers.length; i++) {
    const handler = missingFieldHandlers[i];
    if (handler.kind === 'scalar') {
      const value = handler.handle(
        selection,
        writableProxyRootRecord,
        newVariables,
        recordSourceProxy,
      );
      if (value !== undefined) {
        return value;
      }
    }
  }
}

/**
 * Creates a lazy proxy for a linked record that doesn't exist yet.
 * When any field is set on this proxy, it will automatically:
 * 1. Create the linked record in the store
 * 2. Link it to the parent record
 * 3. Set the field value
 */
function createLazyLinkedRecordProxy(
  selection: ReaderLinkedField,
  variables: Variables,
  writableProxyRootRecord: RecordProxy,
  recordSourceProxy: RecordSourceProxy,
  missingFieldHandlers: $ReadOnlyArray<MissingFieldHandler>,
): $FlowFixMe {
  const newVariables = getArgumentValues(selection.args ?? [], variables);
  let createdRecord: ?RecordProxy = null;

  // Helper to ensure the record is created
  const ensureRecordCreated = () => {
    if (createdRecord == null) {
      // Generate a client ID for the new record
      const {generateClientID} = require('../store/ClientID');
      const storageKey = getStableStorageKey(selection.name, newVariables);
      const newRecordID = generateClientID(
        writableProxyRootRecord.getDataID(),
        storageKey,
      );

      // Get the type from the selection's concreteType
      const typeName = selection.concreteType;
      if (typeName == null) {
        throw new Error(
          `Cannot auto-create linked record for field "${selection.name}" because the type is not concrete. ` +
          'This indicates an abstract type, which requires explicit record creation.'
        );
      }

      // Create the record
      createdRecord = recordSourceProxy.create(newRecordID, typeName);

      // Link it to the parent
      writableProxyRootRecord.setLinkedRecord(
        createdRecord,
        selection.name,
        newVariables,
      );
    }
    return createdRecord;
  };

  // Create a proxy that intercepts all property accesses
  const lazyProxy = {};

  // Add all the fields from the selection as getters/setters
  updateProxyFromSelectionsLazy(
    lazyProxy,
    ensureRecordCreated,
    variables,
    selection.selections,
    recordSourceProxy,
    missingFieldHandlers,
  );

  // $FlowFixMe[unclear-type]
  return lazyProxy as any;
}

/**
 * Similar to updateProxyFromSelections, but uses a lazy record getter
 * that creates the record on first access
 */
function updateProxyFromSelectionsLazy(
  writableProxy: {...},
  getRecord: () => ?RecordProxy,
  variables: Variables,
  selections: $ReadOnlyArray<ReaderSelection>,
  recordSourceProxy: RecordSourceProxy,
  missingFieldHandlers: $ReadOnlyArray<MissingFieldHandler>,
): void {
  selections.forEach(selection => {
    switch (selection.kind) {
      case 'ScalarField':
        Object.defineProperty(writableProxy, selection.name, {
          get() {
            const record = getRecord();
            if (record == null) {
              return undefined;
            }
            const newVariables = getArgumentValues(selection.args ?? [], variables);
            return record.getValue(selection.name, newVariables);
          },
          set(newValue: mixed) {
            const record = getRecord();
            if (record == null) {
              return;
            }
            const newVariables = getArgumentValues(selection.args ?? [], variables);
            // $FlowFixMe[prop-missing] setValue__UNSAFE exists on the implementation
            record.setValue__UNSAFE(newValue, selection.name, newVariables);
          },
          enumerable: true,
          configurable: true,
        });
        break;
      case 'LinkedField':
        if (selection.plural) {
          // Plural linked fields - create getter/setter
          Object.defineProperty(writableProxy, selection.name, {
            get() {
              const record = getRecord();
              if (record == null) {
                return undefined;
              }
              return createGetterForPluralLinkedField(
                selection,
                variables,
                record,
                recordSourceProxy,
                missingFieldHandlers,
              )();
            },
            set(newValue: $FlowFixMe) {
              const record = getRecord();
              if (record == null) {
                return;
              }
              return createSetterForPluralLinkedField(
                selection,
                variables,
                record,
                recordSourceProxy,
              )(newValue);
            },
            enumerable: true,
            configurable: true,
          });
        } else {
          // Singular linked field - create getter/setter
          Object.defineProperty(writableProxy, selection.name, {
            get() {
              const record = getRecord();
              if (record == null) {
                return undefined;
              }
              return createGetterForSingularLinkedField(
                selection,
                variables,
                record,
                recordSourceProxy,
                missingFieldHandlers,
              )();
            },
            set(newValue: $FlowFixMe) {
              const record = getRecord();
              if (record == null) {
                return;
              }
              return createSetterForSingularLinkedField(
                selection,
                variables,
                record,
                recordSourceProxy,
              )(newValue);
            },
            enumerable: true,
            configurable: true,
          });
        }
        break;
      case 'InlineFragment':
      case 'Condition':
      case 'Defer':
      case 'Stream':
      case 'ModuleImport':
      case 'ClientExtension':
        // These should have been flattened or are not supported
        throw new Error(
          `Unexpected selection kind "${selection.kind}" in writable fragment. This indicates a bug in Relay.`,
        );
      default:
        // $FlowFixMe[incompatible-type]
        (selection.kind: empty);
        throw new Error('Unknown selection kind');
    }
  });
}

module.exports = {createWritableProxy};
