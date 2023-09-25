import http from 'http';
import Logger from '../logger';
import csvToJSON from '../csvToJson';
import fs from 'fs';
import 'dotenv/config';
import FileService from '../services/FileService';
import readline from 'readline';

const port = 1337;

export default async function startServer() {
    const logger = new Logger('Server',
        process.env.LOG_TO_CONSOLE === 'false' ? false : true,
        process.env.SAVE_TO_DB === 'true' ? true : false);

    const server = http.createServer(async (request, response) => {
        const fileService = new FileService();

        if (request.url?.split('?')[0] === '/upload') {
            if (request.method === 'POST' && request.headers['content-type'] === 'text/csv') {
                let fileName: string;
                let params = new URLSearchParams(request.url.split('?')[1]);

                fileName = params.get('file') ?? `file_${Date.now()}`;

                if (params.get('headers') === null || params.get('headers') === 'false') {
                    params.set('headers', 'false');
                }

                const writeStream = fs.createWriteStream(`./filesInput/${fileName}.csv`);

                request.on('data', chunk => {
                    writeStream.write(chunk, err => {
                        if (err) {
                            response.writeHead(500, { 'Content-Type': 'text/plain' });
                            response.end('File saving failed');
                            logger.error(err.message);
                        }
                    });
                })
                    .on('end', () => {
                        writeStream.close();
                        let downloadURL = `http://localhost:${port}/download?file=${fileName}`;

                        if (params.get('headers') === 'true') {
                            csvToJSON(fileName, fileName, true)
                                .then(() => {
                                    return fileService.create({ url: downloadURL });
                                });
                        } else {
                            csvToJSON(fileName, fileName, false)
                                .then(() => {
                                    return fileService.create({ url: downloadURL });
                                });
                        }

                        response.writeHead(200, { 'Content-Type': 'text/plain' });
                        response.end(`File is being converted and once done will be available at: ${downloadURL}`);
                    })
                    .on('error', err => {
                        logger.error(err.message);
                    });
            } else {
                response.writeHead(400, { 'Content-Type': 'text/plain' });
                response.end('No valid CSV file found, please attach valid file and configure request headers');
            }
        } else if (request.url?.split('?')[0] === '/download') {
            if (request.method === 'GET' && request.url.split('?').length !== 0) {
                let params = new URLSearchParams(request.url.split('?')[1]);
                let fileName = params.get('file') ?? '';
                let foundFiles = await fileService.findAll({ url: fileName });

                if (fileName == '' || foundFiles.length === 0) {
                    response.writeHead(404, { 'Content-Type': 'text/plain' });
                    response.end('File not found');
                } else if (foundFiles.length >= 1) {
                    const readStream = fs.createReadStream(`./filesOutput/${fileName}.json`);

                    readStream.on('error', (err) => {
                        logger.error(err.message);
                        response.writeHead(404, { 'Content-Type': 'text/plain' });
                        response.end(err.message);
                    });

                    response.writeHead(200, { 'Content-Type': 'application/json' });
                    readStream.pipe(response);
                }
            } else {
                response.writeHead(400, { 'Content-Type': 'text/plain' });
                response.end('Invalid HTTP method used or valid arguments not passed');
            }
        } else {
            response.writeHead(404, { 'Content-Type': 'text/plain' });
            response.end('Endpoint not found');
            logger.error(`Attempt to access non-existing endpoint ${request.url}`);
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
            logger.info(`Server received message: ${data}`);

            const config = data.toString().split(' ');

            if (config.length === 5) {
                csvToJSON(
                    config[0],
                    config[1],
                    config[2] === 'false' ? false : true,
                    config[3] === 'false' ? false : true,
                    config[4] === 'true' ? true : false);
            } else {
                logger.error('Incorrect argument number received in message');
            }
        });

        socket.on('end', () => { logger.info('Client Disconnected') });
    }).on('error', err => {
        logger.error(err.message);
    });

    server.listen(port, () => logger.info(`Server running on port ${port}`));
}