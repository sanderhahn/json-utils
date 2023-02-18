import { spawn } from "child_process";
import { watch } from "fs";

const start = Date.now();
function throttle(func, wait = 1000) {
    let timer;
    return (...args) => {
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
    const proc = spawn('node', ['index.test.js']);
    proc.stdout.on('data', function (data) {
        process.stdout.write(data.toString());
    });

    proc.stderr.on('data', function (data) {
        process.stderr.write(data.toString());
    });

    proc.on('exit', function (code) {
        console.log('child process exited with code ' + code.toString());
    });
}

console.clear();
watch('.', { recursive: true }, throttle(watcher, 1000));
