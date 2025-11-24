/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<21758cd81d1de849ceccea8f33667034>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type writableFragmentsTest_updateWithArgs$fragmentType: FragmentType;
export type writableFragmentsTest_updateWithArgs$data = {|
  name: ?string,
  get profilePicture(): ?{|
    uri: ?string,
  |},
  set profilePicture(value: null | void): void,
  +$fragmentType: writableFragmentsTest_updateWithArgs$fragmentType,
|};
export type writableFragmentsTest_updateWithArgs$key = {
  +$data?: writableFragmentsTest_updateWithArgs$data,
  +$updatableFragmentSpreads: writableFragmentsTest_updateWithArgs$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "size"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "writableFragmentsTest_updateWithArgs",
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
          "variableName": "size"
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
  (node/*: any*/).hash = "1e8ffa94a052751fd77901b0c0536036";
}

module.exports = ((node/*: any*/)/*: Fragment<
  writableFragmentsTest_updateWithArgs$fragmentType,
  writableFragmentsTest_updateWithArgs$data,
>*/);
