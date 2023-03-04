import * as assert from 'assert';
import { replacer, Reviver } from './index.js';
import { npm } from './npm.js';

class X {
    x: any;
    constructor(x: any) {
        this.x = x;
    }
    toJSON(): {
        constructor: string,
        x: any,
    } {
        return {
            constructor: this.constructor.name,
            x: this.x,
        };
    }
    static fromJSON(value: {x: any}): X {
        return new X(value.x);
    }
}

assert.deepStrictEqual(replacer('', Symbol.for('x')), {
    constructor: 'Symbol',
    value: 'x',
});

assert.deepStrictEqual(replacer('', 1n), {
    constructor: 'BigInt',
    value: '1',
});

assert.deepStrictEqual(replacer('', BigInt('1')), {
    constructor: 'BigInt',
    value: '1',
});

const exampleSet = new Set([1, new Set([2])]);
assert.deepStrictEqual(replacer('', exampleSet), {
    constructor: 'Set',
    value: [1, {
        constructor: 'Set',
        value: [2],
    }],
});

const exampleMap = new Map([[new Set([1]), new Map([['a', 'b']])]]);
assert.deepStrictEqual(replacer('', exampleMap), {
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
    reviver('', replacer('', Symbol.for('x'))),
    Symbol.for('x'),
);

assert.equal(
    reviver('', replacer('', 1n)),
    1n,
);

const dateValue = JSON.parse(JSON.stringify(new Date('2023-02-18')), reviver);
assert.ok(dateValue instanceof Date)
assert.equal(dateValue.toISOString(), '2023-02-18T00:00:00.000Z');

assert.deepStrictEqual(
    reviver('', replacer('', exampleSet)),
    exampleSet,
);

assert.deepStrictEqual(
    reviver('', replacer('', exampleMap)),
    exampleMap,
);

const xValue = JSON.parse(JSON.stringify(new X('x'), replacer), reviver);
assert.ok(xValue instanceof X);
assert.equal(xValue.x, 'x');

const nestedValue = JSON.parse(JSON.stringify(new X(new X('x')), replacer), reviver);
assert.ok(nestedValue instanceof X);
assert.ok(nestedValue.x instanceof X);
assert.equal(nestedValue.x.x, 'x');

class Y {
    y: any;
    constructor(y: any) {
        this.y = y;
    }
    toJSON() {
        return {
            constructor: this.constructor.name,
            y: this.y,
        };
    }
}

assert.throws(() => {
    JSON.parse(JSON.stringify(new Y('y'), replacer), reviver);
}, new Error('Invalid mapping for Y'));

execFile(npm(), ['run', 'build'], (error, stdout, stderr) => {
    if (error) {
        console.log(stdout);
        process.exit(1);
    }
});

import { execFile } from 'child_process';

execFile('node', ['dist/example.js'], (error, stdout, stderr) => {
    if (error) {
        console.error(error);
        process.exit(1);
    }

    assert.strictEqual(stdout, `{
  symbol: Symbol(one),
  bignum: 1n,
  date: 2023-02-18T00:00:00.000Z,
  set: Set(2) { 1, 2 },
  map: Map(1) { 'a' => 'b' },
  sky: Color {}
}
`)
});
