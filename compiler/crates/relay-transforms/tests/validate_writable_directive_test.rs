/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<89b457523cc22501f4295c55f1b7700e>>
 */

mod validate_writable_directive;

use validate_writable_directive::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn simple_writable_fragment() {
    let input = include_str!("validate_writable_directive/fixtures/simple-writable-fragment.graphql");
    let expected = include_str!("validate_writable_directive/fixtures/simple-writable-fragment.expected");
    test_fixture(transform_fixture, file!(), "simple-writable-fragment.graphql", "validate_writable_directive/fixtures/simple-writable-fragment.expected", input, expected).await;
}

#[tokio::test]
async fn writable_inline_fragment_missing_typename_invalid() {
    let input = include_str!("validate_writable_directive/fixtures/writable-inline-fragment-missing-typename.invalid.graphql");
    let expected = include_str!("validate_writable_directive/fixtures/writable-inline-fragment-missing-typename.invalid.expected");
    test_fixture(transform_fixture, file!(), "writable-inline-fragment-missing-typename.invalid.graphql", "validate_writable_directive/fixtures/writable-inline-fragment-missing-typename.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn writable_nested_inline_fragments_invalid() {
    let input = include_str!("validate_writable_directive/fixtures/writable-nested-inline-fragments.invalid.graphql");
    let expected = include_str!("validate_writable_directive/fixtures/writable-nested-inline-fragments.invalid.expected");
    test_fixture(transform_fixture, file!(), "writable-nested-inline-fragments.invalid.graphql", "validate_writable_directive/fixtures/writable-nested-inline-fragments.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn writable_with_arguments() {
    let input = include_str!("validate_writable_directive/fixtures/writable-with-arguments.graphql");
    let expected = include_str!("validate_writable_directive/fixtures/writable-with-arguments.expected");
    test_fixture(transform_fixture, file!(), "writable-with-arguments.graphql", "validate_writable_directive/fixtures/writable-with-arguments.expected", input, expected).await;
}

#[tokio::test]
async fn writable_with_fragment_spread_invalid() {
    let input = include_str!("validate_writable_directive/fixtures/writable-with-fragment-spread.invalid.graphql");
    let expected = include_str!("validate_writable_directive/fixtures/writable-with-fragment-spread.invalid.expected");
    test_fixture(transform_fixture, file!(), "writable-with-fragment-spread.invalid.graphql", "validate_writable_directive/fixtures/writable-with-fragment-spread.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn writable_with_include_invalid() {
    let input = include_str!("validate_writable_directive/fixtures/writable-with-include.invalid.graphql");
    let expected = include_str!("validate_writable_directive/fixtures/writable-with-include.invalid.expected");
    test_fixture(transform_fixture, file!(), "writable-with-include.invalid.graphql", "validate_writable_directive/fixtures/writable-with-include.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn writable_with_inline_fragments_invalid() {
    let input = include_str!("validate_writable_directive/fixtures/writable-with-inline-fragments.invalid.graphql");
    let expected = include_str!("validate_writable_directive/fixtures/writable-with-inline-fragments.invalid.expected");
    test_fixture(transform_fixture, file!(), "writable-with-inline-fragments.invalid.graphql", "validate_writable_directive/fixtures/writable-with-inline-fragments.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn writable_with_skip_invalid() {
    let input = include_str!("validate_writable_directive/fixtures/writable-with-skip.invalid.graphql");
    let expected = include_str!("validate_writable_directive/fixtures/writable-with-skip.invalid.expected");
    test_fixture(transform_fixture, file!(), "writable-with-skip.invalid.graphql", "validate_writable_directive/fixtures/writable-with-skip.invalid.expected", input, expected).await;
}
