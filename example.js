import { replacer, Reviver } from 'json-utils';

class X {
    constructor(y) {
        this.y = y;
    }
    toJSON() {
        return {
            constructor: this.constructor.name,
            y: this.y,
        };
    }
    static fromJSON(value) {
        return new X(value.y);
    }
}

const str = JSON.stringify({
    symbol: Symbol.for('one'),
    bignum: 1n,
    date: new Date('2023-02-18'),
    set: new Set([1, 2]),
    map: new Map([['a', 'b']]),
    custom: new X('z'),
}, replacer, 2);

const reviver = Reviver({
    X: X,
});

const obj = JSON.parse(str, reviver);

console.dir(obj);

// output:
// {
//     symbol: Symbol(one),
//     bignum: 1n,
//     date: 2023-02-18T00:00:00.000Z,
//     set: Set(2) { 1, 2 },
//     map: Map(1) { 'a' => 'b' },
//     custom: X { y: 'z' }
// }
