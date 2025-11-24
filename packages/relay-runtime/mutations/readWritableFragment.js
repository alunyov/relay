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
  RecordSourceProxy,
} from '../store/RelayStoreTypes';
import type {DataID, Variables} from '../util/RelayRuntimeTypes';
import type {WritableFragment} from '../util/RelayRuntimeTypes';

const {getFragment} = require('../query/GraphQLTag');
const {createWritableProxy} = require('./createWritableProxy');
const warning = require('warning');

/**
 * Read a writable fragment from the store and create a type-safe proxy for imperative updates.
 * Writable fragments support arguments and provide getter/setter access to fields.
 *
 * @param fragment The writable fragment definition
 * @param dataID The ID of the record to read
 * @param args Optional fragment arguments
 * @param proxy The store proxy for accessing records
 * @param missingFieldHandlers Handlers for missing fields
 * @returns A proxy object with type-safe field getters/setters, or undefined if type mismatch
 */
function readWritableFragment<TFragmentType, TData>(
  fragment: WritableFragment<TFragmentType, TData>,
  dataID: DataID,
  args: ?Variables,
  proxy: RecordSourceProxy,
  missingFieldHandlers: $ReadOnlyArray<MissingFieldHandler>,
): ?TData {
  const writableFragment = getFragment(fragment);

  // Use provided args or empty object if none provided
  const fragmentVariables = args ?? {};

  const fragmentRoot = proxy.get(dataID);

  // Return null if the record doesn't exist (unlike updatable fragments which throw)
  if (fragmentRoot == null) {
    return null;
  }

  // Check if the record's type matches the fragment type
  const recordType = fragmentRoot.getType();
  const fragmentType = writableFragment.type;

  if (recordType !== fragmentType) {
    warning(
      false,
      `getWithFragment(): Record '${dataID}' has type '${recordType}' but fragment '${writableFragment.name}' expects type '${fragmentType}'. Returning undefined.`,
    );
    return undefined;
  }

  // $FlowFixMe[incompatible-type]
  return createWritableProxy<TData>(
    fragmentRoot,
    fragmentVariables,
    writableFragment.selections,
    proxy,
    missingFieldHandlers,
  );
}

module.exports = {readWritableFragment};
