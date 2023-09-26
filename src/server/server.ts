import http from 'http';
import Logger from '../logger';
import csvToJSON from '../csvToJson';
import fs from 'fs';
import 'dotenv/config';
import FileService from '../services/FileService';

export default async function startServer() {
    const logger = new Logger('Server',
        process.env.LOG_TO_CONSOLE === 'false' ? false : true,
        process.env.SAVE_TO_DB === 'true' ? true : false);

    const server = http.createServer(async (request, response) => {
        const requestUrl = new URL(`http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}${request.url ?? ''}`);

        if (requestUrl.pathname === '/upload') {
            fileUpload(request, response, requestUrl, logger);
        } else if (requestUrl.pathname === '/download') {
            fileDownload(request, response, requestUrl, logger);
        } else {
            handleErrorResponse(response, 404, `Attempt to access non-existing endpoint ${request.url}`, logger);
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

    server.listen(process.env.SERVER_PORT, () => logger.info(`Server running on port ${process.env.SERVER_PORT}`));
}

function fileUpload(request: http.IncomingMessage, response: http.ServerResponse<http.IncomingMessage>, requestUrl: URL, logger: Logger) {
    if (request.method !== 'POST' || request.headers['content-type'] !== 'text/csv') {
        return handleErrorResponse(response, 400, 'Incorrect HTTP method or Content-Type', logger);
    }
    const requestParams = requestUrl.searchParams;
    const fileName= requestParams.get('file') ?? `file_${Date.now()}`;
    const fileService = new FileService();
    const writeStream = fs.createWriteStream(`./filesInput/${fileName}.csv`);
    const downloadURL = `http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/download?file=${fileName}`;

    if (requestParams.get('headers') === null || requestParams.get('headers') === 'false') {
        requestParams.set('headers', 'false');
    }

    request.on('data', chunk => {
        writeStream.write(chunk, err => {
            if (err) {
                handleErrorResponse(response, 500, err.message, logger);
            }
        });
    }).on('end', () => {
        writeStream.close();
        if (requestParams.get('headers') === 'true') {
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
    }).on('error', err => {
        logger.error(err.message);
    });
}

async function fileDownload(request: http.IncomingMessage, response: http.ServerResponse<http.IncomingMessage>, requestUrl: URL, logger: Logger) {
    if (request.method !== 'GET' || requestUrl.searchParams.size === 0) {
        return handleErrorResponse(response, 400, 'Invalid HTTP method used or valid arguments not passed', logger);
    }

    const fileService = new FileService();
    const fileName = requestUrl.searchParams.get('file') ?? '';
    const foundFiles = await fileService.findAll({ url: fileName });

    if (fileName == '' || foundFiles.length === 0) {
        handleErrorResponse(response, 404, 'File not found', logger);
    } else {
        const readStream = fs.createReadStream(`./filesOutput/${fileName}.json`);

        readStream.on('error', (err) => {
            handleErrorResponse(response, 404, err.message, logger);
        });

        response.writeHead(200, { 'Content-Type': 'application/json' });
        readStream.pipe(response);
    }
}

function handleErrorResponse(response: http.ServerResponse<http.IncomingMessage>, statusCode: number, message: string, logger: Logger) {
    response.writeHead(statusCode, { 'Content-Type': 'text/plain' });
    response.end(message);
    logger.error(message);
}