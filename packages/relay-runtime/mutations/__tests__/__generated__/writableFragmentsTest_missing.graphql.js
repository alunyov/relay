/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<d22e9bedeca899d358c7b87eaabd049c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type writableFragmentsTest_missing$fragmentType: FragmentType;
export type writableFragmentsTest_missing$data = {|
  name: ?string,
  +$fragmentType: writableFragmentsTest_missing$fragmentType,
|};
export type writableFragmentsTest_missing$key = {
  +$data?: writableFragmentsTest_missing$data,
  +$updatableFragmentSpreads: writableFragmentsTest_missing$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "writableFragmentsTest_missing",
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
  (node/*: any*/).hash = "9df040da0b39d33366948fea7f9fc28e";
}

module.exports = ((node/*: any*/)/*: Fragment<
  writableFragmentsTest_missing$fragmentType,
  writableFragmentsTest_missing$data,
>*/);
