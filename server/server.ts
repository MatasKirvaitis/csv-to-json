import http from 'http';
import Logger from '../logger';
import csvToJSON from '../csvToJson';
import fs from 'fs';
import 'dotenv/config';
import url from 'url';

const port = 1337;

// 'feat/file-download'
//CSV file sent to endpoint with method POST and content-type text/csv - done
//File passed to csvToJson with output file name same as input file name - done
//Conversion result file changed into URL with format 'http://localhost:1337/downloads?file=<JSON converted file name> - done
//This URL is returned in the response WITHOUT awaiting for the conversion to be done - done
//This URL is also saved to DB along with 'Initial Conversion Timestamp' when entry is first created
//multiple entries with same URL means the file has been re-converted after the initial file and thus is overwriten.
//If URL is accessed before the conversion is done, message is displaying prompting the user to wait
//If page is refreshed or opened after conversion is done, it automatically downloads the converted file
//User can access the same page in the future, the server checks with DB if file with this name exists and returns the file
//Additionally server returns a message 'File <JSON converted file name> is ready to download, file converted at <timestamp>'
//If file was overwriten since the initial conversion, message is returned 'File <JSON converted file name> is ready to download, the file has been overwritten since first conversion, latest conversion at <timestamp>'

export default async function startServer() {
    const logger = new Logger('Server',
        process.env.LOG_TO_CONSOLE === 'false' ? false : true,
        process.env.SAVE_TO_DB === 'true' ? true : false);

    const server = http.createServer((request, response) => {
        if (request.url?.split('?')[0] === '/upload') {
            // Need to send argument ?headers=true if headers are in file otherwise automatically set to false
            if (request.method === 'POST' && request.headers['content-type'] === 'text/csv') {
                let fileName: string;
                let headers: boolean;
                let params = new URLSearchParams(request.url.split('?')[1]);

                fileName = params.get('file') ?? `file_${Date.now()}`;

                if (params.get('headers') === null || params.get('headers') === 'false') {
                    params.set('headers', 'false');
                }

                const writeStream = fs.createWriteStream(`./filesInput/${fileName}.csv`);

                request.on('data', chunk => {
                    writeStream.write(chunk, err => {
                        if (err) {
                            response.writeHead(500, { 'Content-Type': 'text/plain'});
                            response.end('File saving failed');
                            logger.error(err.message);
                        }
                    });
                })
                .on('end', () => {
                    writeStream.close();
                    response.writeHead(200, { 'Content-Type': 'text/plain'});
                    response.end('File saved successfully');
                    logger.info('File saved successfully');
                })
                .on('error', err => {
                    logger.error(err.message);
                });

                console.log(params.get('headers'));

                if(params.get('headers') === 'true') {
                    csvToJSON(fileName, fileName, true);
                } else {
                    csvToJSON(fileName, fileName, false);
                }

                // Needs to push this URL to DB
                let downloadURL = `http://${process.env.PG_HOST}:${process.env.PG_PORT}/downloads?file=${fileName}`;

                response.writeHead(200, { 'Content-Type': 'text/plain' });
                response.end(`File is being converted and once done will be available at: ${downloadURL}`);
            }
        } else if (request.url?.split('?')[0] === '/download') {
            if (request.method === 'GET' && request.url?.includes('/downloads')) {
                // logic for checking DB and downloading
            }
        } else {
            response.writeHead(404, { 'Content-Type': 'text/plain'});
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

            if(config.length === 5) {
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