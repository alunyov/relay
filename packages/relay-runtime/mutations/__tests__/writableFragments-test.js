/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

import type {
  GraphQLResponse,
  LogRequestInfoFunction,
  UploadableMap,
} from '../../network/RelayNetworkTypes';
import type {ObservableFromValue} from '../../network/RelayObservable';
import type {RequestParameters} from '../../util/RelayConcreteNode';
import type {CacheConfig, Variables} from '../../util/RelayRuntimeTypes';

const RelayNetwork = require('../../network/RelayNetwork');
const {graphql} = require('../../query/GraphQLTag');
const RelayModernEnvironment = require('../../store/RelayModernEnvironment');
const RelayModernStore = require('../../store/RelayModernStore');
const RelayRecordSource = require('../../store/RelayRecordSource');
const commitLocalUpdate = require('../commitLocalUpdate');
const {readWritableFragment} = require('../readWritableFragment');

describe('Writable Fragments', () => {
  let environment;
  let source;
  let store;

  beforeEach(() => {
    source = RelayRecordSource.create();
    store = new RelayModernStore(source);

    const fetch = jest.fn<
      [
        RequestParameters,
        Variables,
        CacheConfig,
        ?UploadableMap,
        ?LogRequestInfoFunction,
      ],
      ObservableFromValue<GraphQLResponse>,
    >();
    environment = new RelayModernEnvironment({
      network: RelayNetwork.create(fetch),
      store,
    });
  });

  describe('Creating new records', () => {
    it('creates a new record with scalar fields', () => {
      const writableFragment = graphql`
        fragment writableFragmentsTest_user on User @writable {
          name
          alternate_name
          actorCount
        }
      `;

      commitLocalUpdate(environment, store => {
        const user = store.createWithFragment('user:new', writableFragment, {});

        user.name = 'Alice';
        user.alternate_name = 'Allie';
        user.actorCount = 5;

        expect(user.name).toBe('Alice');
        expect(user.alternate_name).toBe('Allie');
        expect(user.actorCount).toBe(5);
      });

      // Verify the record was created in the store
      // $FlowFixMe[incompatible-cast] Record fields are accessible at runtime
      // $FlowFixMe[unclear-type]
      const userRecord: any = source.get('user:new');
      expect(userRecord).toBeTruthy();
      expect(userRecord?.name).toBe('Alice');
      expect(userRecord?.alternate_name).toBe('Allie');
      expect(userRecord?.actorCount).toBe(5);
    });

    it('creates a new record with nested linked fields (auto-create)', () => {
      const writableFragment = graphql`
        fragment writableFragmentsTest_userWithProfile on User @writable {
          name
          profilePicture {
            uri
            width
            height
          }
        }
      `;

      commitLocalUpdate(environment, store => {
        const user = store.createWithFragment(
          'user:alice',
          writableFragment,
          {},
        );

        user.name = 'Alice';
        // Auto-create nested profilePicture
        user.profilePicture.uri = 'https://example.com/alice.jpg';
        user.profilePicture.width = 200;
        user.profilePicture.height = 200;

        expect(user.name).toBe('Alice');
        expect(user.profilePicture.uri).toBe('https://example.com/alice.jpg');
        expect(user.profilePicture.width).toBe(200);
      });

      // Verify both records exist
      commitLocalUpdate(environment, store => {
        const userProxy = store.get('user:alice');
        expect(userProxy).toBeTruthy();
        expect(userProxy?.getValue('name')).toBe('Alice');

        // The profilePicture should be a linked record with a client ID
        const profilePictureProxy =
          userProxy?.getLinkedRecord('profilePicture');
        expect(profilePictureProxy).toBeTruthy();
        expect(profilePictureProxy?.getValue('uri')).toBe(
          'https://example.com/alice.jpg',
        );
        expect(profilePictureProxy?.getValue('width')).toBe(200);
        expect(profilePictureProxy?.getValue('height')).toBe(200);
      });
    });

    it('creates a new record with fragment arguments', () => {
      const writableFragment = graphql`
        fragment writableFragmentsTest_userWithArgs on User
        @writable
        @argumentDefinitions(imageSize: {type: "[Int]"}) {
          name
          profilePicture(size: $imageSize) {
            uri
          }
        }
      `;

      commitLocalUpdate(environment, store => {
        const user = store.createWithFragment('user:bob', writableFragment, {
          imageSize: [500],
        });

        user.name = 'Bob';
        user.profilePicture.uri = 'https://example.com/bob-500.jpg';

        expect(user.name).toBe('Bob');
        expect(user.profilePicture.uri).toBe('https://example.com/bob-500.jpg');
      });

      // $FlowFixMe[incompatible-cast]
      // $FlowFixMe[unclear-type]
      const userRecord: any = source.get('user:bob');
      expect(userRecord).toBeTruthy();
      expect(userRecord?.name).toBe('Bob');
    });
  });

  describe('Updating existing records', () => {
    it('updates existing scalar fields', () => {
      const writableFragment = graphql`
        fragment writableFragmentsTest_updateUser on User @writable {
          name
          alternate_name
          actorCount
        }
      `;

      // Pre-populate the store
      commitLocalUpdate(environment, store => {
        const user = store.create('user:charlie', 'User');
        user.setValue('Charlie', 'name');
        user.setValue('Chuck', 'alternate_name');
        user.setValue(10, 'actorCount');
      });

      // Update using writable fragment
      commitLocalUpdate(environment, store => {
        const user = store.getWithFragment(
          'user:charlie',
          writableFragment,
          {},
        );

        expect(user?.name).toBe('Charlie');
        expect(user?.alternate_name).toBe('Chuck');

        if (user) {
          user.name = 'Charles';
          user.alternate_name = 'Charlie';
          user.actorCount = 15;
        }
      });

      // Verify updates
      // $FlowFixMe[incompatible-cast]
      // $FlowFixMe[unclear-type]
      const userRecord: any = source.get('user:charlie');
      expect(userRecord?.name).toBe('Charles');
      expect(userRecord?.alternate_name).toBe('Charlie');
      expect(userRecord?.actorCount).toBe(15);
    });

    it('updates existing nested linked fields', () => {
      const writableFragment = graphql`
        fragment writableFragmentsTest_updateUserProfile on User @writable {
          name
          profilePicture {
            uri
            width
          }
        }
      `;

      // Pre-populate with existing profile picture
      commitLocalUpdate(environment, store => {
        const user = store.create('user:diana', 'User');
        user.setValue('Diana', 'name');

        const profile = store.create('image:1', 'Image');
        profile.setValue('https://old.com/diana.jpg', 'uri');
        profile.setValue(100, 'width');

        user.setLinkedRecord(profile, 'profilePicture');
      });

      // Update using writable fragment
      commitLocalUpdate(environment, store => {
        const user = store.getWithFragment('user:diana', writableFragment, {});

        expect(user?.profilePicture.uri).toBe('https://old.com/diana.jpg');

        if (user) {
          user.profilePicture.uri = 'https://new.com/diana.jpg';
          user.profilePicture.width = 300;
        }
      });

      // Verify updates
      // $FlowFixMe[incompatible-cast]
      // $FlowFixMe[unclear-type]
      const profileRecord: any = source.get('image:1');
      expect(profileRecord?.uri).toBe('https://new.com/diana.jpg');
      expect(profileRecord?.width).toBe(300);
    });

    it('creates new linked record by setting object inline (weak type)', () => {
      const writableFragment = graphql`
        fragment writableFragmentsTest_userWithProfile on User @writable {
          name
          profilePicture {
            uri
            width
            height
          }
        }
      `;

      // Create a user without a profile picture
      commitLocalUpdate(environment, store => {
        const user = store.create('user:frank', 'User');
        user.setValue('Frank', 'name');
      });

      // Use writable fragment to set profilePicture as an inline object
      // This works because ProfilePicture is a "weak type" (no id field)
      commitLocalUpdate(environment, store => {
        const user = readWritableFragment(
          writableFragment,
          'user:frank',
          null,
          store,
          [],
        );

        expect(user).toBeTruthy();
        expect(user?.name).toBe('Frank');
        expect(user?.profilePicture).toBeNull();

        if (user) {
          // Set the entire profilePicture object inline
          // This creates a new linked record with a client-generated ID
          user.profilePicture = {
            uri: 'https://example.com/frank.jpg',
            width: 200,
            height: 200,
          };
        }
      });

      // Verify the profilePicture was created and linked
      commitLocalUpdate(environment, store => {
        const user = readWritableFragment(
          writableFragment,
          'user:frank',
          null,
          store,
          [],
        );

        expect(user?.profilePicture).toBeTruthy();
        expect(user?.profilePicture?.uri).toBe('https://example.com/frank.jpg');
        expect(user?.profilePicture?.width).toBe(200);
        expect(user?.profilePicture?.height).toBe(200);
      });

      // Verify we can update it again with a different object
      commitLocalUpdate(environment, store => {
        const user = readWritableFragment(
          writableFragment,
          'user:frank',
          null,
          store,
          [],
        );

        if (user) {
          user.profilePicture = {
            uri: 'https://example.com/frank-new.jpg',
            width: 400,
            height: 400,
          };
        }
      });

      // Verify the update
      commitLocalUpdate(environment, store => {
        const user = readWritableFragment(
          writableFragment,
          'user:frank',
          null,
          store,
          [],
        );

        expect(user?.profilePicture?.uri).toBe(
          'https://example.com/frank-new.jpg',
        );
        expect(user?.profilePicture?.width).toBe(400);
        expect(user?.profilePicture?.height).toBe(400);
      });
    });

    it('updates fields with arguments', () => {
      const writableFragment = graphql`
        fragment writableFragmentsTest_updateWithArgs on User
        @writable
        @argumentDefinitions(size: {type: "[Int]"}) {
          name
          profilePicture(size: $size) {
            uri
          }
        }
      `;

      // Pre-populate
      commitLocalUpdate(environment, store => {
        const user = store.create('user:eve', 'User');
        user.setValue('Eve', 'name');

        const profile1 = store.create('image:eve-100', 'Image');
        profile1.setValue('https://example.com/eve-100.jpg', 'uri');
        user.setLinkedRecord(profile1, 'profilePicture', {size: [100]});

        const profile2 = store.create('image:eve-500', 'Image');
        profile2.setValue('https://example.com/eve-500.jpg', 'uri');
        user.setLinkedRecord(profile2, 'profilePicture', {size: [500]});
      });

      // Update the size:100 version
      commitLocalUpdate(environment, store => {
        const user = store.getWithFragment('user:eve', writableFragment, {
          size: [100],
        });

        if (user) {
          user.profilePicture.uri = 'https://example.com/eve-100-updated.jpg';
        }
      });

      // Verify only the size:100 version was updated
      // $FlowFixMe[incompatible-cast]
      // $FlowFixMe[unclear-type]
      const profile100: any = source.get('image:eve-100');
      expect(profile100?.uri).toBe('https://example.com/eve-100-updated.jpg');

      // $FlowFixMe[incompatible-cast]
      // $FlowFixMe[unclear-type]
      const profile500: any = source.get('image:eve-500');
      expect(profile500?.uri).toBe('https://example.com/eve-500.jpg'); // Unchanged
    });
  });

  describe('Interfaces and Unions', () => {
    it('works with interfaces and inline fragments', () => {
      const writableFragment = graphql`
        fragment writableFragmentsTest_node on Node @writable {
          id
          ... on User {
            __typename
            name
            actorCount
          }
          ... on Page {
            __typename
            name
            username
          }
        }
      `;

      // Create a User (implements Node)
      commitLocalUpdate(environment, store => {
        const user = store.create('user:frank', 'User');
        user.setValue('user:frank', 'id');
        user.setValue('Frank', 'name');
        user.setValue(20, 'actorCount');
      });

      // Create a Page (implements Node)
      commitLocalUpdate(environment, store => {
        const page = store.create('page:relay', 'Page');
        page.setValue('page:relay', 'id');
        page.setValue('Relay Docs', 'name');
        page.setValue('relaydocs', 'username');
      });

      // Use writable fragment to read and verify User
      commitLocalUpdate(environment, store => {
        const userProxy = readWritableFragment(
          writableFragment,
          'user:frank',
          null,
          store,
          [],
        );
        expect(userProxy?.id).toBe('user:frank');
        expect(userProxy?.name).toBe('Frank');
        // $FlowFixMe[incompatible-use]
        expect(userProxy?.actorCount).toBe(20);
      });

      // Use writable fragment to read and update Page
      commitLocalUpdate(environment, store => {
        const pageProxy = readWritableFragment(
          writableFragment,
          'page:relay',
          null,
          store,
          [],
        );
        expect(pageProxy?.id).toBe('page:relay');
        expect(pageProxy?.name).toBe('Relay Docs');
        // $FlowFixMe[incompatible-use]
        expect(pageProxy?.username).toBe('relaydocs');

        // Update the page name using writable fragment
        if (pageProxy) {
          pageProxy.name = 'Updated Relay Docs';
        }
      });

      // Verify the update persisted
      // $FlowFixMe[incompatible-cast]
      // $FlowFixMe[unclear-type]
      const pageRecord: any = source.get('page:relay');
      expect(pageRecord?.name).toBe('Updated Relay Docs');
    });

    it('handles union types with inline fragments', () => {
      const writableFragment = graphql`
        fragment writableFragmentsTest_searchResult on MaybeNode @writable {
          ... on Story {
            __typename
            message {
              text
            }
          }
          ... on NonNode {
            __typename
            name
          }
        }
      `;

      // Create different union members
      commitLocalUpdate(environment, store => {
        // Story variant
        const story = store.create('story:grace', 'Story');
        const messageRecord = store.create('message:story:grace', 'Text');
        messageRecord.setValue('Grace posted a story', 'text');
        story.setLinkedRecord(messageRecord, 'message');

        // NonNode variant
        const nonNode = store.create('nonnode:about', 'NonNode');
        nonNode.setValue('About Us', 'name');
      });

      // Use writable fragment to read and update Story
      commitLocalUpdate(environment, store => {
        const storyProxy = readWritableFragment(
          writableFragment,
          'story:grace',
          null,
          store,
          [],
        );
        expect(storyProxy).toBeTruthy();
        // $FlowFixMe[incompatible-use]
        expect(storyProxy?.message?.text).toBe('Grace posted a story');

        // Update the message text
        if (storyProxy?.message) {
          // $FlowFixMe[incompatible-use]
          storyProxy.message.text = 'Updated story text';
        }
      });

      // Use writable fragment to read and update NonNode
      commitLocalUpdate(environment, store => {
        const nonNodeProxy = readWritableFragment(
          writableFragment,
          'nonnode:about',
          null,
          store,
          [],
        );
        expect(nonNodeProxy).toBeTruthy();
        // $FlowFixMe[incompatible-use]
        expect(nonNodeProxy?.name).toBe('About Us');

        // Update the name
        if (nonNodeProxy) {
          // $FlowFixMe[incompatible-use]
          nonNodeProxy.name = 'Updated About Us';
        }
      });

      // Verify updates persisted
      commitLocalUpdate(environment, store => {
        const storyProxy = store.get('story:grace');
        const messageProxy = storyProxy?.getLinkedRecord('message');
        expect(messageProxy?.getValue('text')).toBe('Updated story text');

        const nonNodeProxy = store.get('nonnode:about');
        expect(nonNodeProxy?.getValue('name')).toBe('Updated About Us');
      });
    });
  });

  describe('Edge cases', () => {
    it('returns null for non-existent records', () => {
      const writableFragment = graphql`
        fragment writableFragmentsTest_missing on User @writable {
          name
        }
      `;

      commitLocalUpdate(environment, store => {
        const user = store.getWithFragment(
          'user:nonexistent',
          writableFragment,
          {},
        );

        expect(user).toBeNull();
      });
    });

    describe('type mismatch', () => {
      beforeEach(() => {
        jest.mock('warning');
      });

      it('returns undefined and warns for type mismatch', () => {
        const writableFragment = graphql`
          fragment writableFragmentsTest_typeMismatch on User @writable {
            name
          }
        `;

        // Create a Page record (not a User)
        commitLocalUpdate(environment, store => {
          const page = store.create('page:test', 'Page');
          page.setValue('Test Page', 'name');
        });

        const warning = require('warning');
        // $FlowFixMe[prop-missing] warning is mocked in tests
        warning.mockClear();

        // Try to read it with a User fragment
        commitLocalUpdate(environment, store => {
          const user = store.getWithFragment('page:test', writableFragment, {});

          expect(user).toBeUndefined();
        });

        // Check that our specific warning was called
        // $FlowFixMe[prop-missing] warning is mocked in tests
        const ourWarningCall = warning.mock.calls.find(
          call =>
            call[1] &&
            call[1].includes(
              "getWithFragment(): Record 'page:test' has type 'Page'",
            ),
        );
        expect(ourWarningCall).toBeDefined();
        expect(ourWarningCall[0]).toBe(false);
        expect(ourWarningCall[1]).toContain(
          "getWithFragment(): Record 'page:test' has type 'Page' but fragment 'writableFragmentsTest_typeMismatch' expects type 'User'. Returning undefined.",
        );
      });
    });

    it('handles null values correctly', () => {
      const writableFragment = graphql`
        fragment writableFragmentsTest_nulls on User @writable {
          name
          actorCount
          alternate_name
        }
      `;

      commitLocalUpdate(environment, store => {
        const user = store.createWithFragment(
          'user:henry',
          writableFragment,
          {},
        );

        user.name = 'Henry';
        user.actorCount = null; // Explicitly set to null
        // alternate_name is not set (undefined)

        expect(user.name).toBe('Henry');
        expect(user.actorCount).toBeUndefined(); // null is normalized to undefined
        expect(user.alternate_name).toBeUndefined();
      });

      // $FlowFixMe[incompatible-cast]
      // $FlowFixMe[unclear-type]
      const userRecord: any = source.get('user:henry');
      expect(userRecord?.name).toBe('Henry');
      expect(userRecord?.actorCount).toBeNull(); // Store keeps null
      expect(userRecord?.alternate_name).toBeUndefined();
    });

    it('handles deeply nested auto-created objects', () => {
      const writableFragment = graphql`
        fragment writableFragmentsTest_deepNesting on User @writable {
          name
          address {
            street
            city
            country
          }
        }
      `;

      commitLocalUpdate(environment, store => {
        const user = store.createWithFragment(
          'user:isabel',
          writableFragment,
          {},
        );

        user.name = 'Isabel';
        user.address.street = '123 Main St';
        user.address.city = 'New York';
        user.address.country = 'United States';

        expect(user.address.city).toBe('New York');
        expect(user.address.country).toBe('United States');
      });

      // Verify nested structure was created
      commitLocalUpdate(environment, store => {
        const userProxy = store.get('user:isabel');
        expect(userProxy?.getValue('name')).toBe('Isabel');

        const addressProxy = userProxy?.getLinkedRecord('address');
        expect(addressProxy).toBeTruthy();
        expect(addressProxy?.getValue('street')).toBe('123 Main St');
        expect(addressProxy?.getValue('city')).toBe('New York');
        expect(addressProxy?.getValue('country')).toBe('United States');
      });
    });
  });
});
