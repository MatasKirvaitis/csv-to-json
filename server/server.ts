import http from 'http';
import Logger from '../logger';
import csvToJSON from '../csvToJson';
import fs from 'fs';
import 'dotenv/config';

const port = 1337;

export default async function startServer() {
    const logger = new Logger('Server', process.env.LOG_TO_CONSOLE === 'false' ? false : true);

    const server = http.createServer((request, response) => {
        if (request.method === 'POST' && request.headers['content-type'] === 'text/csv') {
            let fileName: string;

            if (request.url === '/' || typeof request.url === 'undefined') {
                fileName = `file_${Date.now()}`;
            } else {
                fileName = request.url.slice(1);
            }

            const writeStream = fs.createWriteStream(`./filesInput/${fileName}.csv`);

            request.on('data', chunk => {
                writeStream.write(chunk, err => {
                    if (err) {
                        response.writeHead(500, { 'Content-Type': 'text/plain'});
                        response.end('File saving failed');
                        logger.log('ERROR', err.message);
                    }
                });
            })
            .on('end', () => {
                writeStream.close();
                response.writeHead(200, { 'Content-Type': 'text/plain'});
                response.end('File saved successfully');
                logger.log('INFO', 'File saved successfully');
            })
            .on('error', err => {
                logger.log('ERROR', err.message);
            });
        } else {
            response.writeHead(400, { 'Content-Type': 'text/plain'});
            response.end('Send a POST request with a CSV file using Content-Type: text/csv');
            logger.log('ERROR', 'Server rejected HTTP request because of incorrect method or Content-Type');
        }
    });

    server.on('upgrade', (request, socket, head) => {
        const headers = [
            'HTTP/1.1 101 Web Socket Protocol Handshake',
            'Upgrade: Websocket',
            'Connection: Upgrade',
            ''
        ].map(line => line.concat('\r\n')).join('');

        socket.write(headers);

        socket.on('data', data => {
            logger.log('INFO', `Server received message: ${data}`);

            const config = data.toString().split(' ');

            if(config.length === 4) {
                csvToJSON(
                    config[0],
                    config[1],
                    config[2] === 'false' ? false : true,
                    config[3] === 'false' ? false : true);
            } else {
                logger.log('ERROR', 'Incorrect argument number received in message');
            }
        });

        socket.on('end', () => { logger.log('INFO', 'Client Disconnected') });
    }).on('error', err => {
        logger.log('ERROR', err.message);
    });

    server.listen(port, () => logger.log('INFO', `Server running on port ${port}`));
}