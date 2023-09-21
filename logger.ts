import fs from 'fs';
import path from 'path';
import LogService from './src/services/LogService';

export default class Logger {
    cache: string;
    dir: string;
    consoleFlag: boolean;
    name: string;
    path: string;
    dbFlag: boolean;
    logService: LogService;

    constructor(name:string, consoleFlag = true, dbFlag = false, dir = './logs') {
        this.dir = dir;
        this.cache = '';
        this.consoleFlag = consoleFlag;
        this.name = name;
        this.path = path.join(dir, `${new Date().toISOString().split('T')[0]}.log`);
        this.dbFlag = dbFlag;
        this.logService = new LogService();
    }

    log(level: string, message: string) {
        const timestamp = new Date();
        const output = `${timestamp.toISOString()} [${this.name}] [${level}] ${message}`;

        if (this.consoleFlag) {
            console.log(output);
        } else {
            if (!fs.existsSync(this.dir)) fs.mkdirSync(this.dir);

            fs.appendFileSync(this.path, output + '\n');
        }

        if (this.dbFlag) {
            this.logService.create({appName: this.name, level: level, message: message, timestamp: timestamp});
        }
    }

    info(message: string) {this.log('INFO', message);}
    error(message: string) {this.log('ERROR', message);}
}