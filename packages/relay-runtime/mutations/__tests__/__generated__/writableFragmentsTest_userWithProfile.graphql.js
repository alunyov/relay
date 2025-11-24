/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<00d37dc13db93763a9f89095bff611c1>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type writableFragmentsTest_userWithProfile$fragmentType: FragmentType;
export type writableFragmentsTest_userWithProfile$data = {|
  name: ?string,
  get profilePicture(): ?{|
    height: ?number,
    uri: ?string,
    width: ?number,
  |},
  set profilePicture(value: null | void): void,
  +$fragmentType: writableFragmentsTest_userWithProfile$fragmentType,
|};
export type writableFragmentsTest_userWithProfile$key = {
  +$data?: writableFragmentsTest_userWithProfile$data,
  +$updatableFragmentSpreads: writableFragmentsTest_userWithProfile$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "writableFragmentsTest_userWithProfile",
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
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "height",
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
  (node/*: any*/).hash = "9e9a414c5ba511fbc85432b415633d7e";
}

module.exports = ((node/*: any*/)/*: Fragment<
  writableFragmentsTest_userWithProfile$fragmentType,
  writableFragmentsTest_userWithProfile$data,
>*/);
