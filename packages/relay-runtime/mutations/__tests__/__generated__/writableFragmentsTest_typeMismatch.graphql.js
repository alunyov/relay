/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<00000000000000000000000000000000>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type writableFragmentsTest_typeMismatch$fragmentType: FragmentType;
export type writableFragmentsTest_typeMismatch$data = {|
  name: ?string,
  +$fragmentType: writableFragmentsTest_typeMismatch$fragmentType,
|};
export type writableFragmentsTest_typeMismatch$key = {
  +$data?: writableFragmentsTest_typeMismatch$data,
  +$updatableFragmentSpreads: writableFragmentsTest_typeMismatch$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "writableFragmentsTest_typeMismatch",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "0000000000000000000000000000type";
}

module.exports = ((node/*: any*/)/*: Fragment<
  writableFragmentsTest_typeMismatch$fragmentType,
  writableFragmentsTest_typeMismatch$data,
>*/);
