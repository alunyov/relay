/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<ba95c9734d440508aeead2fd40ee10b1>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type writableFragmentsTest_node$fragmentType: FragmentType;
export type writableFragmentsTest_node$data = {|
  +__typename: "Page",
  +id: string,
  name: ?string,
  username: ?string,
  +$fragmentType: writableFragmentsTest_node$fragmentType,
|} | {|
  +__typename: "User",
  actorCount: ?number,
  +id: string,
  name: ?string,
  +$fragmentType: writableFragmentsTest_node$fragmentType,
|} | {|
  // This will never be '%other', but we need some
  // value in case none of the concrete values match.
  +__typename: "%other",
  +$fragmentType: writableFragmentsTest_node$fragmentType,
|};
export type writableFragmentsTest_node$key = {
  +$data?: writableFragmentsTest_node$data,
  +$updatableFragmentSpreads: writableFragmentsTest_node$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "writableFragmentsTest_node",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": [
        (v0/*: any*/),
        (v1/*: any*/),
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
    },
    {
      "kind": "InlineFragment",
      "selections": [
        (v0/*: any*/),
        (v1/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "username",
          "storageKey": null
        }
      ],
      "type": "Page",
      "abstractKey": null
    }
  ],
  "type": "Node",
  "abstractKey": "__isNode"
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "02624c0d2f81898514753b882c829e66";
}

module.exports = ((node/*: any*/)/*: Fragment<
  writableFragmentsTest_node$fragmentType,
  writableFragmentsTest_node$data,
>*/);
