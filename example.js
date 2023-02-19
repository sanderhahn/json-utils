import { replacer, Reviver } from './index.js';

class Color {
    #red
    #green
    #blue
    constructor(red, green, blue) {
        this.#red = red;
        this.#green = green;
        this.#blue = blue;
    }
    toJSON() {
        return {
            constructor: this.constructor.name,
            red: this.#red,
            green: this.#green,
            blue: this.#blue,
        };
    }
    static fromJSON(value) {
        return new Color(
            value.red,
            value.green,
            value.blue,
        );
    }
}

const str = JSON.stringify({
    symbol: Symbol.for('one'),
    bignum: 1n,
    date: new Date('2023-02-18'),
    set: new Set([1, 2]),
    map: new Map([['a', 'b']]),
    sky: new Color(202, 235, 242),
}, replacer, 2);

const reviver = Reviver({
    Color: Color,
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
//     sky: Color { red: 202, green: 235, blue: 242 }
// }
