import fs from 'fs';
import path from 'path';

export default class Logger {
    cache: string;
    dir: string;
    consoleFlag: boolean;
    name: string;
    path: string;

    constructor(name:string, consoleFlag = true, dir = './logs') {
        this.dir = dir;
        this.cache = '';
        this.consoleFlag = consoleFlag;
        this.name = name;
        this.path = path.join(dir, `${new Date().toISOString().split('T')[0]}.log`);
    }

    log(level: string, message: string) {
        const output = `${new Date().toISOString().replace('T', '').split('.')[0]} [${this.name}] [${level}] ${message}`;

        if (this.consoleFlag) {
            console.log(output);
        } else {
            this.cache = output;

            if (!fs.existsSync(this.dir)) fs.mkdirSync(this.dir);

            fs.appendFileSync(this.path, this.cache + '\n');
        }
    }

    info(message: string) {this.log('INFO', message);}
    error(message: string) {this.log('ERROR', message);}
}