# json-utils

Utility `replacer` and `reviver` functions for `JSON.stringify` and `JSON.parse`.

These add support for:

- `Symbol`
- `BigInt`
- `Date`

and collections and custom objects:

- `Set`
- `Map`
- class using `toJSON` and static `fromJSON` methods

See the [`example.js`](example.js).
