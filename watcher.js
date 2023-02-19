import { spawn } from 'child_process';
import { watch } from 'fs';

function throttle(func, wait = 1000) {
    let timer;
    return function (...args) {
        if (timer === undefined) {
            func.apply(this, args);
            timer = setTimeout(() => {
                timer = undefined;
            }, wait);
        }
    };
}

function watcher(event, filename) {
    console.clear();
    const proc = spawn('node', ['index_test.js']);
    proc.stdout.on('data', function (data) {
        process.stdout.write(data.toString());
    });

    proc.stderr.on('data', function (data) {
        process.stderr.write(data.toString());
    });

    proc.on('exit', function (code) {
        if (code === null) {
            throw new Error('internal error');
        }
        if (code === 0) {
            console.log('testing successful');
        } else {
            console.error('testing failed');
        }
    });
}

console.clear();
watch('.', { recursive: true }, throttle(watcher, 1000));
