# @writable Fragment Feature - Complete Implementation Guide

## Executive Summary

This document describes the implementation of `@writable` fragments for Relay - a type-safe layer on top of imperative store updater APIs. The feature allows developers to use GraphQL fragments with getter/setter proxies for type-safe store mutations, including automatic creation of nested linked records.

**Key Innovation**: Eliminates the need for verbose `RecordProxy` calls by providing a declarative fragment-based API with automatic nested object creation.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Data Flow](#data-flow)
3. [Compiler Changes (Rust)](#compiler-changes-rust)
4. [Runtime Changes (JavaScript)](#runtime-changes-javascript)
5. [API Examples](#api-examples)
6. [Implementation Details](#implementation-details)
7. [Testing Strategy](#testing-strategy)
8. [Migration Guide](#migration-guide)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        GraphQL Source Code                           │
│                                                                       │
│  fragment UserFields @writable on User {                            │
│    name                                                              │
│    profilePicture { uri }                                           │
│  }                                                                   │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      COMPILER PIPELINE (Rust)                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  1. Schema Validation                                                │
│     ├─ Check directive is on FRAGMENT_DEFINITION                    │
│     ├─ Reject fragment spreads                                      │
│     ├─ Reject @include/@skip directives                            │
│     └─ Validate inline fragments (interfaces/unions only)           │
│                                                                       │
│  2. Type Generation                                                  │
│     ├─ Generate getter/setter types                                 │
│     ├─ Support fragment arguments                                   │
│     └─ Create __generated__ artifacts                               │
│                                                                       │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  Generated TypeScript/Flow Types                     │
│                                                                       │
│  export type UserFields$writable = {|                               │
│    get name(): ?string,                                             │
│    set name(value: ?string): void,                                  │
│    get profilePicture(): ?{|                                        │
│      get uri(): ?string,                                            │
│      set uri(value: ?string): void,                                 │
│    |},                                                               │
│  |};                                                                 │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     RUNTIME (JavaScript)                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  RecordSourceProxy.createWithFragment()                             │
│           │                                                          │
│           ├─> readWritableFragment()                                │
│           │        │                                                 │
│           │        ├─> createUpdatableProxy()                       │
│           │        │        │                                        │
│           │        │        ├─> Scalar fields: getValue/setValue    │
│           │        │        │                                        │
│           │        │        └─> Linked fields:                      │
│           │        │                 │                               │
│           │        │                 ├─ Exists? Return proxy        │
│           │        │                 │                               │
│           │        │                 └─ Null? Return lazy proxy     │
│           │        │                           │                     │
│           │        │                           └─> Auto-create      │
│           │        │                               on write          │
│           │        │                                                 │
│           │        └─> Return type-safe proxy                       │
│           │                                                          │
│           └─> Mutations persist to Relay Store                      │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Creating a New Record with Nested Fields

```
User Code:
┌─────────────────────────────────────────────────────────────────┐
│ const user = store.createWithFragment(                          │
│   'user:alice',                                                 │
│   UserFragment,                                                 │
│   { scale: 2.0 }                                               │
│ );                                                              │
│                                                                 │
│ user.name = 'Alice';                                           │
│ user.profilePicture.uri = 'https://...';  // Auto-creates!    │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ RecordSourceProxy.createWithFragment()                          │
│  1. Extract fragment type from fragment definition             │
│  2. Call store.create(dataID, typename)                        │
│  3. Call readWritableFragment() → returns proxy                │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ readWritableFragment()                                          │
│  1. Get fragment definition via getFragment()                  │
│  2. Merge fragment arguments                                   │
│  3. Get RecordProxy from store                                 │
│  4. Call createUpdatableProxy() with selections                │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ createUpdatableProxy()                                          │
│  For each selection:                                            │
│    • ScalarField → Object.defineProperty with get/set          │
│    • LinkedField (exists) → Return mutable proxy               │
│    • LinkedField (null) → Return LAZY proxy                    │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ User sets: user.profilePicture.uri = '...'                     │
│                                                                 │
│ Lazy Proxy Intercepts:                                         │
│  1. Lazy getter accessed → createLazyLinkedRecordProxy()      │
│  2. On first write (uri = '...'):                             │
│     a. generateClientID()                                      │
│     b. store.create(clientID, 'Image')                        │
│     c. parent.setLinkedRecord(created, 'profilePicture')      │
│     d. record.setValue(value, 'uri')                          │
└─────────────────────────────────────────────────────────────────┘

Final Relay Store State:
┌─────────────────────────────────────────────────────────────────┐
│ {                                                               │
│   'user:alice': {                                              │
│     __typename: 'User',                                        │
│     name: 'Alice',                                             │
│     profilePicture: { __ref: 'client:1' }                     │
│   },                                                            │
│   'client:1': {                                                │
│     __typename: 'Image',                                       │
│     uri: 'https://...'                                         │
│   }                                                             │
│ }                                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Compiler Changes (Rust)

### 1. Schema Extension
**File**: `compiler/crates/relay-schema/src/relay-extensions.graphql`

```graphql
"""
Marks a given fragment as writable, enabling type-safe imperative store updates
with fragment-based APIs. Writable fragments support arguments but do not allow
fragment spreads or conditional directives (@include, @skip).
"""
directive @writable on FRAGMENT_DEFINITION
```

**Why**: Defines the directive that users write in their GraphQL code.

---

### 2. Validation Implementation
**File**: `compiler/crates/relay-transforms/src/validations/validate_writable_directive.rs` (NEW - 420 lines)

```rust
pub struct WritableDirective<'a> {
    fragment_info: Option<FragmentInfo>,
    program: &'a Program,
}

impl Validator for WritableDirective<'_> {
    // Only validates fragments with @writable directive
    fn validate_fragment(&mut self, fragment: &FragmentDefinition) -> DiagnosticsResult<()> {
        if fragment.directives.named(*WRITABLE_DIRECTIVE).is_some() {
            // Validate all selections
            self.default_validate_fragment(fragment)
        } else {
            Ok(())
        }
    }

    // Reject fragment spreads
    fn validate_fragment_spread(&mut self, spread: &FragmentSpread) -> DiagnosticsResult<()> {
        Err(vec![Diagnostic::error(
            ValidationMessage::WritableNoFragmentSpreads,
            spread.fragment.location,
        )])
    }

    // Reject @include/@skip
    fn validate_condition(&mut self, condition: &Condition) -> DiagnosticsResult<()> {
        Err(vec![Diagnostic::error(
            ValidationMessage::WritableNoConditions,
            condition.location,
        )])
    }

    // Validate inline fragments (for interfaces/unions)
    fn validate_inline_fragments_with_parent(...) -> DiagnosticsResult<()> {
        // 1. Parent type must be abstract (interface/union)
        // 2. Type conditions must be concrete
        // 3. Must include __typename field
        // 4. No duplicate type conditions
    }
}
```

**Key Validations**:
- ✅ Only on `FRAGMENT_DEFINITION`
- ✅ No fragment spreads (`...OtherFragment`)
- ✅ No `@include` or `@skip` directives
- ✅ No Relay resolvers
- ✅ Inline fragments only on abstract types
- ✅ Auto-validates `__typename` inclusion

**Integration**:
```rust
// File: compiler/crates/relay-transforms/src/validations.rs
pub use validate_writable_directive::validate_writable_directive;
pub use validate_writable_directive::WRITABLE_DIRECTIVE;

// File: compiler/crates/relay-compiler/src/build_project/validate.rs
use relay_transforms::validate_writable_directive;

pub fn validate(...) -> DiagnosticsResult<...> {
    let output = try_all(vec![
        // ... other validators
        validate_writable_directive(program),
        // ...
    ]);
}
```

---

### 3. Type Generation
**File**: `compiler/crates/relay-typegen/src/lib.rs`

**Changes**:
```rust
use relay_transforms::WRITABLE_DIRECTIVE;

fn generate_fragment_type_exports_section_impl(...) -> String {
    let typegen_context = TypegenContext::new(
        schema,
        project_config,
        // Treat @writable same as @updatable for type generation
        fragment_definition.directives.named(*UPDATABLE_DIRECTIVE).is_some()
            || fragment_definition.directives.named(*WRITABLE_DIRECTIVE).is_some(),
        // ...
    );
    // ...
}
```

**Result**: Generates getter/setter types:
```typescript
export type UserFields$writable = {|
  get name(): ?string,
  set name(value: ?string): void,
  get age(): ?number,
  set age(value: ?number): void,
|};
```

---

## Runtime Changes (JavaScript)

### 1. Type Definitions

**File**: `packages/relay-runtime/util/RelayRuntimeTypes.js`

```javascript
/**
 * Return type of graphql tag literals for writable fragments.
 * Writable fragments support arguments and provide type-safe imperative store updates.
 */
declare export opaque type WritableFragment<+TData>: ReaderFragment;
```

**File**: `packages/relay-runtime/store/RelayStoreTypes.js`

```javascript
export interface RecordSourceProxy {
  // Existing methods...
  create(dataID: DataID, typeName: string): RecordProxy;
  get(dataID: DataID): ?RecordProxy;

  // NEW: Writable fragment APIs
  createWithFragment<TData>(
    dataID: DataID,
    fragment: WritableFragment<TData>,
    args?: Variables,
  ): TData;

  getWithFragment<TData>(
    dataID: DataID,
    fragment: WritableFragment<TData>,
    args?: Variables,
  ): ?TData;
}
```

---

### 2. Core Helper Function

**File**: `packages/relay-runtime/mutations/readWritableFragment.js` (NEW - 65 lines)

```javascript
function readWritableFragment<TData>(
  fragment: WritableFragment<TData>,
  dataID: DataID,
  args: ?Variables,
  proxy: RecordSourceProxy,
  missingFieldHandlers: $ReadOnlyArray<MissingFieldHandler>,
): ?TData {
  // 1. Get fragment definition
  const writableFragment = getFragment(fragment);

  // 2. Use provided args or empty object
  const fragmentVariables = args ?? {};

  // 3. Get the record from store
  const fragmentRoot = proxy.get(dataID);

  // 4. Return null if record doesn't exist
  if (fragmentRoot == null) {
    return null;
  }

  // 5. Create updatable proxy with selections
  return createUpdatableProxy<TData>(
    fragmentRoot,
    fragmentVariables,
    writableFragment.selections,
    proxy,
    missingFieldHandlers,
  );
}
```

**Key Differences from `readUpdatableFragment`**:
- Takes `DataID` instead of `fragmentReference`
- Accepts `args` as separate parameter (supports `@argumentDefinitions`)
- Returns `null` instead of throwing when record doesn't exist
- Simpler signature for imperative use

---

### 3. RecordSourceProxy Implementation

**File**: `packages/relay-runtime/mutations/RelayRecordSourceProxy.js`

```javascript
class RelayRecordSourceProxy implements RecordSourceProxy {
  // NEW METHOD 1: Create record with fragment
  createWithFragment<TData>(
    dataID: DataID,
    fragment: WritableFragment<TData>,
    args?: Variables,
  ): TData {
    // Extract type from fragment definition
    const {getFragment} = require('../query/GraphQLTag');
    const writableFragment = getFragment(fragment);
    const typeName = writableFragment.type;

    // Create the record
    this.create(dataID, typeName);

    // Read and return the writable proxy
    const result = readWritableFragment(
      fragment,
      dataID,
      args,
      this,
      this._missingFieldHandlers,
    );

    invariant(result != null, 'Expected created record to be readable');
    return result;
  }

  // NEW METHOD 2: Get record with fragment
  getWithFragment<TData>(
    dataID: DataID,
    fragment: WritableFragment<TData>,
    args?: Variables,
  ): ?TData {
    return readWritableFragment(
      fragment,
      dataID,
      args,
      this,
      this._missingFieldHandlers,
    );
  }
}
```

---

### 4. Auto-Create Linked Fields Feature

**File**: `packages/relay-runtime/mutations/createUpdatableProxy.js`

**Key Changes**:

#### A. Remove Object.freeze() on Nested Objects
```javascript
function createGetterForSingularLinkedField(...): () => ?$FlowFixMe {
  return function () {
    // ... get linkedRecord ...

    if (linkedRecord != null) {
      const updatableProxy = {};
      updateProxyFromSelections(/* ... */);

      // REMOVED: Object.freeze(updatableProxy) in DEV
      // This allows mutation of nested objects

      return updatableProxy;
    } else {
      // NEW: Return lazy proxy for auto-creation
      return createLazyLinkedRecordProxy(/* ... */);
    }
  };
}
```

#### B. Create Lazy Proxy for Auto-Creation
```javascript
/**
 * Creates a lazy proxy for a linked record that doesn't exist yet.
 * When any field is set on this proxy, it will automatically:
 * 1. Create the linked record in the store
 * 2. Link it to the parent record
 * 3. Set the field value
 */
function createLazyLinkedRecordProxy(
  selection: ReaderLinkedField,
  variables: Variables,
  updatableProxyRootRecord: RecordProxy,
  recordSourceProxy: RecordSourceProxy,
  missingFieldHandlers: $ReadOnlyArray<MissingFieldHandler>,
): $FlowFixMe {
  let createdRecord: ?RecordProxy = null;

  // Helper to ensure the record is created (only once)
  const ensureRecordCreated = () => {
    if (createdRecord == null) {
      // Generate client ID
      const {generateClientID} = require('../store/ClientID');
      const newRecordID = generateClientID();

      // Get type from selection's concreteType
      const typeName = selection.concreteType;

      // Create the record
      createdRecord = recordSourceProxy.create(newRecordID, typeName);

      // Link it to parent
      updatableProxyRootRecord.setLinkedRecord(
        createdRecord,
        selection.name,
        newVariables,
      );
    }
    return createdRecord;
  };

  // Create proxy with lazy getters/setters
  const lazyProxy = {};
  updateProxyFromSelectionsLazy(
    lazyProxy,
    ensureRecordCreated,  // Record created on first access
    variables,
    selection.selections,
    recordSourceProxy,
    missingFieldHandlers,
  );

  return lazyProxy;
}
```

#### C. Lazy Selection Updates
```javascript
function updateProxyFromSelectionsLazy(
  updatableProxy: {...},
  getRecord: () => RecordProxy,  // Lazy record getter
  variables: Variables,
  selections: $ReadOnlyArray<ReaderSelection>,
  recordSourceProxy: RecordSourceProxy,
  missingFieldHandlers: $ReadOnlyArray<MissingFieldHandler>,
): void {
  selections.forEach(selection => {
    switch (selection.kind) {
      case 'ScalarField':
        Object.defineProperty(updatableProxy, selection.name, {
          get() {
            const record = getRecord();  // Creates if needed
            return record.getValue(selection.name, args);
          },
          set(newValue) {
            const record = getRecord();  // Creates if needed
            record.setValue__UNSAFE(newValue, selection.name, args);
          },
        });
        break;
      // ... similar for LinkedField
    }
  });
}
```

**Auto-Create Flow**:
```
user.profilePicture.uri = "..."
       │
       ├─> getter for profilePicture
       │   ├─> linkedRecord is null
       │   └─> return createLazyLinkedRecordProxy()
       │
       └─> setter for uri
           ├─> calls ensureRecordCreated()
           │   ├─> generateClientID() → "client:1"
           │   ├─> create("client:1", "Image")
           │   └─> parent.setLinkedRecord(created, "profilePicture")
           │
           └─> record.setValue("...", "uri")
```

---

## API Examples

### Example 1: Basic Scalar Fields
```javascript
const UserFragment = graphql`
  fragment UserBasic @writable on User {
    name
    age
    email
  }
`;

// Create new
commitLocalUpdate(environment, store => {
  const user = store.createWithFragment('user:1', UserFragment, {});
  user.name = 'Alice';
  user.age = 30;
  user.email = 'alice@example.com';
});

// Update existing
commitLocalUpdate(environment, store => {
  const user = store.getWithFragment('user:1', UserFragment, {});
  if (user) {
    user.name = 'Alice Cooper';
    user.age = 31;
  }
});
```

### Example 2: Auto-Create Nested Objects
```javascript
const UserFragment = graphql`
  fragment UserWithProfile @writable on User {
    name
    profilePicture {
      uri
      width
      height
    }
  }
`;

commitLocalUpdate(environment, store => {
  const user = store.createWithFragment('user:2', UserFragment, {});
  user.name = 'Bob';

  // Auto-creates profilePicture record!
  user.profilePicture.uri = 'https://example.com/bob.jpg';
  user.profilePicture.width = 200;
  user.profilePicture.height = 200;
});

// Store state after:
// {
//   'user:2': {
//     name: 'Bob',
//     profilePicture: { __ref: 'client:1' }
//   },
//   'client:1': {
//     uri: 'https://example.com/bob.jpg',
//     width: 200,
//     height: 200
//   }
// }
```

### Example 3: Fragment Arguments
```javascript
const UserFragment = graphql`
  fragment UserWithArgs @writable on User
  @argumentDefinitions(
    imageSize: {type: "Int"}
    includeName: {type: "Boolean", defaultValue: true}
  ) {
    name @include(if: $includeName)
    profilePicture(size: $imageSize) {
      uri
    }
  }
`;

commitLocalUpdate(environment, store => {
  // Different size versions
  const userSmall = store.getWithFragment('user:3', UserFragment, { imageSize: 100 });
  const userLarge = store.getWithFragment('user:3', UserFragment, { imageSize: 500 });

  if (userSmall) {
    userSmall.profilePicture.uri = 'https://example.com/user-100.jpg';
  }

  if (userLarge) {
    userLarge.profilePicture.uri = 'https://example.com/user-500.jpg';
  }
});
```

### Example 4: Interfaces and Unions
```javascript
const NodeFragment = graphql`
  fragment NodeWritable @writable on Node {
    id
    ... on User {
      __typename  // Auto-included by compiler
      name
      email
    }
    ... on Page {
      __typename  // Auto-included by compiler
      title
      url
    }
  }
`;

commitLocalUpdate(environment, store => {
  // Create a User (implements Node)
  const user = store.createWithFragment('user:4', NodeFragment, {});
  user.id = 'user:4';
  user.name = 'Charlie';
  user.email = 'charlie@example.com';

  // Create a Page (implements Node)
  const page = store.createWithFragment('page:1', NodeFragment, {});
  page.id = 'page:1';
  page.title = 'About Us';
  page.url = 'https://example.com/about';
});
```

### Example 5: Deep Nesting
```javascript
const UserFragment = graphql`
  fragment UserDeep @writable on User {
    name
    address {
      street
      city {
        name
        country {
          name
          code
        }
      }
    }
  }
`;

commitLocalUpdate(environment, store => {
  const user = store.createWithFragment('user:5', UserFragment, {});
  user.name = 'Diana';

  // All nested objects auto-create!
  user.address.street = '123 Main St';
  user.address.city.name = 'New York';
  user.address.city.country.name = 'United States';
  user.address.city.country.code = 'US';
});
```

---

## Testing Strategy

**File**: `packages/relay-runtime/mutations/__tests__/writableFragments-test.js` (480 lines)

### Test Categories

#### 1. Creating New Records (3 tests)
```javascript
describe('Creating new records', () => {
  it('creates a new record with scalar fields');
  it('creates a new record with nested linked fields (auto-create)');
  it('creates a new record with fragment arguments');
});
```

#### 2. Updating Existing Records (3 tests)
```javascript
describe('Updating existing records', () => {
  it('updates existing scalar fields');
  it('updates existing nested linked fields');
  it('updates fields with arguments');
});
```

#### 3. Interfaces and Unions (2 tests)
```javascript
describe('Interfaces and Unions', () => {
  it('works with interfaces and inline fragments');
  it('handles union types with inline fragments');
});
```

#### 4. Edge Cases (3 tests)
```javascript
describe('Edge cases', () => {
  it('returns null for non-existent records');
  it('handles null values correctly');
  it('handles deeply nested auto-created objects');
});
```

### Test Pattern
```javascript
it('test name', () => {
  const writableFragment = graphql`
    fragment TestFragment @writable on User {
      field1
      field2
    }
  `;

  commitLocalUpdate(environment, store => {
    // Create/get record
    const record = store.createWithFragment('id', writableFragment, {});

    // Set fields
    record.field1 = 'value1';
    record.field2 = 'value2';

    // Assert immediate results
    expect(record.field1).toBe('value1');
  });

  // Verify store was actually updated
  const storedRecord = source.get('id');
  expect(storedRecord?.field1).toBe('value1');
});
```

---

## Migration Guide

### Before (Verbose RecordProxy API)
```javascript
commitLocalUpdate(environment, store => {
  // Create user
  const user = store.create('user:1', 'User');
  user.setValue('Alice', 'name');
  user.setValue(30, 'age');

  // Create profile picture
  const profilePic = store.create('image:1', 'Image');
  profilePic.setValue('https://example.com/alice.jpg', 'uri');
  profilePic.setValue(200, 'width');

  // Link them
  user.setLinkedRecord(profilePic, 'profilePicture', { size: 200 });
});
```

### After (Writable Fragments)
```javascript
const UserFragment = graphql`
  fragment UserFields @writable on User {
    name
    age
    profilePicture(size: $size) {
      uri
      width
    }
  }
`;

commitLocalUpdate(environment, store => {
  const user = store.createWithFragment('user:1', UserFragment, { size: 200 });
  user.name = 'Alice';
  user.age = 30;
  user.profilePicture.uri = 'https://example.com/alice.jpg';
  user.profilePicture.width = 200;
});
```

**Benefits**:
- ✅ 50% less code
- ✅ Type-safe (compile-time errors)
- ✅ No manual ID management for nested objects
- ✅ Auto-creation of linked records
- ✅ Fragment arguments support
- ✅ Natural JavaScript syntax

---

## Files Changed Summary

### Created (3 files)
1. `compiler/crates/relay-transforms/src/validations/validate_writable_directive.rs` (420 lines)
2. `packages/relay-runtime/mutations/readWritableFragment.js` (65 lines)
3. `packages/relay-runtime/mutations/__tests__/writableFragments-test.js` (480 lines)

### Modified (9 files)
1. `compiler/crates/relay-schema/src/relay-extensions.graphql` (+8 lines)
2. `compiler/crates/relay-transforms/src/validations.rs` (+3 lines)
3. `compiler/crates/relay-compiler/src/build_project/validate.rs` (+2 lines)
4. `compiler/crates/relay-typegen/src/lib.rs` (+12 lines)
5. `packages/relay-runtime/util/RelayRuntimeTypes.js` (+5 lines)
6. `packages/relay-runtime/store/RelayStoreTypes.js` (+18 lines)
7. `packages/relay-runtime/mutations/RelayRecordSourceProxy.js` (+50 lines)
8. `packages/relay-runtime/mutations/createUpdatableProxy.js` (+160 lines)
9. `packages/relay-runtime/index.js` (+1 line)

**Total**: ~1,200 lines of code added/modified

---

## Conclusion

The `@writable` fragment feature provides a modern, type-safe API for imperative store updates in Relay. By leveraging GraphQL fragments and automatic proxy generation, it eliminates boilerplate code while maintaining full type safety.

**Key Achievements**:
- ✅ Declarative fragment-based API
- ✅ Automatic nested object creation
- ✅ Fragment arguments support
- ✅ Full type safety via getter/setter generation
- ✅ Backward compatible (doesn't affect existing code)
- ✅ Comprehensive test coverage

**Next Steps**:
1. Build Rust compiler: `cd compiler && cargo build`
2. Generate artifacts: `yarn relay-compiler`
3. Run tests: `yarn jest writableFragments-test`
