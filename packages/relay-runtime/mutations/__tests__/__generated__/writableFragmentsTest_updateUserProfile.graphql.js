/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<216068cee67bdfbdbe4d0f36ab86f7bd>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type writableFragmentsTest_updateUserProfile$fragmentType: FragmentType;
export type writableFragmentsTest_updateUserProfile$data = {|
  name: ?string,
  get profilePicture(): ?{|
    uri: ?string,
    width: ?number,
  |},
  set profilePicture(value: null | void): void,
  +$fragmentType: writableFragmentsTest_updateUserProfile$fragmentType,
|};
export type writableFragmentsTest_updateUserProfile$key = {
  +$data?: writableFragmentsTest_updateUserProfile$data,
  +$updatableFragmentSpreads: writableFragmentsTest_updateUserProfile$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "writableFragmentsTest_updateUserProfile",
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
      "concreteType": "Image",
      "kind": "LinkedField",
      "name": "profilePicture",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "uri",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "width",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "33ac991786b823dd698043623d3c5001";
}

module.exports = ((node/*: any*/)/*: Fragment<
  writableFragmentsTest_updateUserProfile$fragmentType,
  writableFragmentsTest_updateUserProfile$data,
>*/);
