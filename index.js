export const replacer = (key, value) => {
    if (typeof value === 'symbol') {
        return {
            constructor: 'Symbol',
            value: Symbol.keyFor(value),
        };
    }
    if (typeof value === 'bigint') {
        return {
            constructor: 'BigInt',
            value: `${value}`,
        };
    }
    if (value instanceof Set) {
        return {
            constructor: value.constructor.name,
            value: Array.from(value.values())
                .map((value) => replacer(undefined, value)),
        };
    }
    if (value instanceof Map) {
        return {
            constructor: value.constructor.name,
            value: Array.from(value.entries())
                .map(([key, value]) => [
                    replacer(undefined, key),
                    replacer(undefined, value),
                ]),
        };
    }
    return value;
};

const isDateString = (value) => {
    return typeof value === 'string'
        && value.length === 24
        && value[4] === '-'
        && value[7] === '-'
        && value[10] === 'T'
        && value[13] === ':'
        && value[16] === ':'
        && value[19] === '.'
        && value[23] === 'Z';
}

export const Reviver = (mapping) => {
    const reviver = (key, value) => {
        if (typeof value === 'object') {
            if (value.constructor === 'Symbol') {
                return Symbol.for(value.value);
            }
            if (value.constructor === 'BigInt') {
                return BigInt(value.value);
            }
            if (value.constructor === 'Date') {
                return new Date(value.value);
            }
            if (value.constructor === 'Set') {
                const entries = value.value.map((value) => reviver(null, value));
                return new Set(entries);
            }
            if (value.constructor === 'Map') {
                const entries = value.value.map(([key, value]) => [
                    reviver(null, key),
                    reviver(null, value),
                ]);
                return new Map(entries);
            }
            if (typeof value.constructor === 'string') {
                const Constructor = mapping[value.constructor];
                if (Constructor === undefined ||
                    typeof mapping[value.constructor].fromJSON !== 'function') {
                    throw new Error(`Invalid mapping for ${value.constructor}`);
                }
                return mapping[value.constructor].fromJSON(value);
            }
        }
        if (isDateString(value)) {
            return new Date(value);
        }
        return value;
    };
    return reviver;
};
