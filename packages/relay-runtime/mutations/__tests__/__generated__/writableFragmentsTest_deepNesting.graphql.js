/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<c1f44305f7eab6919e1c6d93572d1e95>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type writableFragmentsTest_deepNesting$fragmentType: FragmentType;
export type writableFragmentsTest_deepNesting$data = {|
  name: ?string,
  get address(): ?{|
    city: ?string,
    country: ?string,
    street: ?string,
  |},
  set address(value: null | void): void,
  +$fragmentType: writableFragmentsTest_deepNesting$fragmentType,
|};
export type writableFragmentsTest_deepNesting$key = {
  +$data?: writableFragmentsTest_deepNesting$data,
  +$updatableFragmentSpreads: writableFragmentsTest_deepNesting$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "writableFragmentsTest_deepNesting",
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
      "concreteType": "StreetAddress",
      "kind": "LinkedField",
      "name": "address",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "street",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "city",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "country",
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
  (node/*: any*/).hash = "8d8071aae33f2c975132da3ad953b576";
}

module.exports = ((node/*: any*/)/*: Fragment<
  writableFragmentsTest_deepNesting$fragmentType,
  writableFragmentsTest_deepNesting$data,
>*/);
