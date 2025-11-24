/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<5dd561f2c88b765299ce940df94b70de>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type writableFragmentsTest_nulls$fragmentType: FragmentType;
export type writableFragmentsTest_nulls$data = {|
  actorCount: ?number,
  alternate_name: ?string,
  name: ?string,
  +$fragmentType: writableFragmentsTest_nulls$fragmentType,
|};
export type writableFragmentsTest_nulls$key = {
  +$data?: writableFragmentsTest_nulls$data,
  +$updatableFragmentSpreads: writableFragmentsTest_nulls$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "writableFragmentsTest_nulls",
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
      "name": "actorCount",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "alternate_name",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "760d62c6862a0d3e06992cad6cd10304";
}

module.exports = ((node/*: any*/)/*: Fragment<
  writableFragmentsTest_nulls$fragmentType,
  writableFragmentsTest_nulls$data,
>*/);
