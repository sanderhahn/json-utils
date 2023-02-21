import { spawn } from 'child_process';
import { watch, WatchEventType } from 'fs';
import { npm } from './npm.js';

type TrottleFn = <T>(...T) => void;

function throttle(func: TrottleFn, wait = 5000): TrottleFn {
    let timer;
    return function (...args) {
        if (timer === undefined) {
            func.bind(this)(...args);
            timer = setTimeout(() => {
                timer = undefined;
            }, wait);
        }
    };
}

function watcher(event: WatchEventType, filename: string | Buffer): void {
    console.clear();
    const proc = spawn(npm(), ['run', 'test'], {
        env: {
            OS: process.env.OS,
            PATH: process.env.PATH,
            PATHEXT: process.env.PATHEXT,
        },
    });
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
watch('./src', { recursive: true }, throttle(watcher, 5000));
