/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f5efb100c4d04dfcd14749f5ee976238>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type writableFragmentsTest_updateUser$fragmentType: FragmentType;
export type writableFragmentsTest_updateUser$data = {|
  actorCount: ?number,
  alternate_name: ?string,
  name: ?string,
  +$fragmentType: writableFragmentsTest_updateUser$fragmentType,
|};
export type writableFragmentsTest_updateUser$key = {
  +$data?: writableFragmentsTest_updateUser$data,
  +$updatableFragmentSpreads: writableFragmentsTest_updateUser$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "writableFragmentsTest_updateUser",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "alternate_name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "actorCount",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "4f7764a43114a9af191ee895f0de99dd";
}

module.exports = ((node/*: any*/)/*: Fragment<
  writableFragmentsTest_updateUser$fragmentType,
  writableFragmentsTest_updateUser$data,
>*/);
