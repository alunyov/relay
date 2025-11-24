/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<764fb2a75eee8402763ca55328c15e12>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type writableFragmentsTest_searchResult$fragmentType: FragmentType;
export type writableFragmentsTest_searchResult$data = {|
  +__typename: "NonNode",
  name: ?string,
  +$fragmentType: writableFragmentsTest_searchResult$fragmentType,
|} | {|
  +__typename: "Story",
  get message(): ?{|
    text: ?string,
  |},
  set message(value: null | void): void,
  +$fragmentType: writableFragmentsTest_searchResult$fragmentType,
|} | {|
  // This will never be '%other', but we need some
  // value in case none of the concrete values match.
  +__typename: "%other",
  +$fragmentType: writableFragmentsTest_searchResult$fragmentType,
|};
export type writableFragmentsTest_searchResult$key = {
  +$data?: writableFragmentsTest_searchResult$data,
  +$updatableFragmentSpreads: writableFragmentsTest_searchResult$fragmentType,
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
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "writableFragmentsTest_searchResult",
  "selections": [
    {
      "kind": "InlineFragment",
      "selections": [
        (v0/*: any*/),
        {
          "alias": null,
          "args": null,
          "concreteType": "Text",
          "kind": "LinkedField",
          "name": "message",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "text",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "type": "Story",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": [
        (v0/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        }
      ],
      "type": "NonNode",
      "abstractKey": null
    }
  ],
  "type": "MaybeNode",
  "abstractKey": "__isMaybeNode"
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "0d3994a0f60a7ed7de326e6c73ccefd5";
}

module.exports = ((node/*: any*/)/*: Fragment<
  writableFragmentsTest_searchResult$fragmentType,
  writableFragmentsTest_searchResult$data,
>*/);
