import http from 'http';
import readline from 'readline/promises';
import Logger from '../logger';
import 'dotenv/config';

const options = {
    port: 1337,
    host: 'localhost',
    headers: {
        'Connection': 'Upgrade',
        'Upgrade': 'websocket'
    }
};

const consoleRead = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

export default async function startClient() {
    const message: string[] = [];

    const logger = new Logger('Client', process.env.LOG_TO_CONSOLE === 'false' ? false : true);

    const inputFile = (await consoleRead.question('Please enter input CSV file name\n')).split('.')[0];
    const outputFile = (await consoleRead.question('Please enter output CSV file name\n')).split('.')[0];
    const headerFlag = await consoleRead.question('Does the CSV file contain headers? (true/false)\n');
    const loggerFlag = await consoleRead.question('Should the logger log to console (true) or file (false)?\n');
    const dbFlag = await consoleRead.question('Do you want the logs to be save to DB? (true/false)\n');

    message.push(inputFile);
    message.push(outputFile);
    headerFlag === 'true' ? message.push(headerFlag) : message.push('false');
    loggerFlag === 'true' ? message.push(loggerFlag) : message.push('false');
    dbFlag === 'true' ? message.push(dbFlag) : message.push('false');

    const req = http.request(options);
    req.end();

    logger.info('Client sent upgrade request');

    req.on('upgrade', (res, socket, upgradeHead) => {
        logger.info('Connection upgraded to Websocket');

        socket.write(message.join(' '));
    }).on('error', err => {
        logger.error(err.message);
    });;
}
