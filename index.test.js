import assert from 'assert';
import { replacer, Reviver } from 'json-utils';

class X {
    constructor(x) {
        this.x = x;
    }
    toJSON() {
        return {
            constructor: this.constructor.name,
            x: this.x,
        };
    }
    static fromJSON(value) {
        return new X(value.x);
    }
}

assert.deepStrictEqual(replacer(null, Symbol.for('x')), {
    constructor: 'Symbol',
    value: 'x',
});

assert.deepStrictEqual(replacer(null, 1n), {
    constructor: 'BigInt',
    value: '1',
});

assert.deepStrictEqual(replacer(null, BigInt('1')), {
    constructor: 'BigInt',
    value: '1',
});

const exampleSet = new Set([1, new Set([2])]);
assert.deepStrictEqual(replacer(null, exampleSet), {
    constructor: 'Set',
    value: [1, {
        constructor: 'Set',
        value: [2],
    }],
});

const exampleMap = new Map([[new Set([1]), new Map([['a', 'b']])]]);
assert.deepStrictEqual(replacer(null, exampleMap), {
    constructor: 'Map',
    value: [[{
        constructor: 'Set',
        value: [1],
    }, {
        constructor: 'Map',
        value: [['a', 'b']],
    }]],
});

const reviver = Reviver({
    X: X,
});

assert.equal(
    reviver(null, replacer(null, Symbol.for('x'))),
    Symbol.for('x'),
);

assert.equal(
    reviver(null, replacer(null, 1n)),
    1n,
);

const dateResult = JSON.parse(JSON.stringify(new Date('2023-02-18')), reviver);
assert(dateResult instanceof Date)
assert.equal(dateResult.toISOString(), '2023-02-18T00:00:00.000Z');

assert.deepStrictEqual(
    reviver(null, replacer(null, exampleSet)),
    exampleSet,
);

assert.deepStrictEqual(
    reviver(null, replacer(null, exampleMap)),
    exampleMap,
);

const xValue = JSON.parse(JSON.stringify(new X('x'), replacer), reviver);
assert(xValue instanceof X);
assert.equal(xValue.x, 'x');
