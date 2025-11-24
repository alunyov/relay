/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<ef2992ca66e1347c628ae44f261b2bc2>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type writableFragmentsTest_userWithArgs$fragmentType: FragmentType;
export type writableFragmentsTest_userWithArgs$data = {|
  name: ?string,
  get profilePicture(): ?{|
    uri: ?string,
  |},
  set profilePicture(value: null | void): void,
  +$fragmentType: writableFragmentsTest_userWithArgs$fragmentType,
|};
export type writableFragmentsTest_userWithArgs$key = {
  +$data?: writableFragmentsTest_userWithArgs$data,
  +$updatableFragmentSpreads: writableFragmentsTest_userWithArgs$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "imageSize"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "writableFragmentsTest_userWithArgs",
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
      "args": [
        {
          "kind": "Variable",
          "name": "size",
          "variableName": "imageSize"
        }
      ],
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
        }
      ],
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "f1163fcf97106d874c6e900db9953d15";
}

module.exports = ((node/*: any*/)/*: Fragment<
  writableFragmentsTest_userWithArgs$fragmentType,
  writableFragmentsTest_userWithArgs$data,
>*/);
