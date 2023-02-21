import * as os from 'os';

function isWindows() {
    return os.platform() === 'win32';
}

export function npm() {
    if (isWindows()) {
        return 'npm.cmd';
    }
    return 'npm';
}
