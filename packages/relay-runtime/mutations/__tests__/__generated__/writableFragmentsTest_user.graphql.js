/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<aa76d54e7bab9fb1b95dc7db0435ea5e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type writableFragmentsTest_user$fragmentType: FragmentType;
export type writableFragmentsTest_user$data = {|
  actorCount: ?number,
  alternate_name: ?string,
  name: ?string,
  +$fragmentType: writableFragmentsTest_user$fragmentType,
|};
export type writableFragmentsTest_user$key = {
  +$data?: writableFragmentsTest_user$data,
  +$updatableFragmentSpreads: writableFragmentsTest_user$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "writableFragmentsTest_user",
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
  (node/*: any*/).hash = "2bc4663b7518b9b2833e2ac85f97d597";
}

module.exports = ((node/*: any*/)/*: Fragment<
  writableFragmentsTest_user$fragmentType,
  writableFragmentsTest_user$data,
>*/);
