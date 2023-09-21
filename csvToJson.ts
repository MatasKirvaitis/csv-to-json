import fs from 'fs';
import { argv } from 'node:process'
import readline from 'readline';
import Logger from './logger'

export default function csvToJSON(inputFileName: string, outputFileName: string, headerFlag: boolean, loggerFlag: boolean, dbFlag: boolean) {
    const args: string[] = argv.splice(2);
    let headerLine: boolean = true;
    let headers: string[] = [];
    let firstLine = true;
    let lineCounter: number = 0;

    const logger = new Logger('csvToJSON', loggerFlag, dbFlag);

    logger.info('App started');

    try {
        const stream = fs.createReadStream(`./filesInput/${inputFileName}.csv`);

        stream.on('error', (err) => {
            logger.error(err.message);
        });

        const reader = readline.createInterface({
            input: stream,
            crlfDelay: Infinity
        });

        logger.info(`Input file set to: ${inputFileName}.csv`);

        const writer = fs.createWriteStream(`./filesOutput/${outputFileName}.json`);

        logger.info(`Output file set to: ${outputFileName}.json`);

        writer.write('[');

        reader
        .on('line', (line) => {
            if (headerLine && headerFlag) {
                headers = parseCSV(line);
                headerLine = false;
            }else if (headers.length === 0) {
                for (let i = 0; i < line.length; i++) {
                    headers[i] = `Column ${i}`;
                }
                if (firstLine) {
                    lineCounter += 1;
                    writer.write(convertToJSONObject(line, headers));
                    firstLine = false;
                } else {
                    lineCounter += 1;
                    writer.write(', ' + convertToJSONObject(line, headers));
                }
            } else {
                if (firstLine) {
                    lineCounter += 1;
                    writer.write(convertToJSONObject(line, headers));
                    firstLine = false;
                } else {
                    lineCounter += 1;
                    writer.write(', ' + convertToJSONObject(line, headers));
                }
            }
        })
        .on('close', () => {
            writer.write(']');
            writer.close();
            logger.info(`Converted ${lineCounter} lines from CSV`)
            logger.info('App closed');
        });
    } catch (err) {
        if (err instanceof Error) {
            logger.error(err.message);
        } else {
            logger.error('An unknown error occured');
        }
    }
}

function convertToJSONObject(fileContents: string, headers: string[] = []) {
    const obj: {[key: string] : string | number} = {};
    let row: string[] = [];
    
    row = parseCSV(fileContents);

    headers.map((headerName, stringIndex) => {
        obj[headerName] = row[stringIndex];
    });

    return JSON.stringify(obj);
}

function parseCSV(csvLine: string) {
    let currentPos: number = 0;
    let inQuotes: boolean = false;
    let chunk: string = '';
    let row: string[] = [];

    while (currentPos < csvLine.length) {
        if (!inQuotes && csvLine[currentPos] === '"') {
            inQuotes = true;
            currentPos += 1;
            continue;
        }

        if (inQuotes && csvLine[currentPos] === '"') {
            if (csvLine[currentPos + 1] ==='"') {
                chunk += '\'';
                currentPos += 2;
                continue;
            }

            inQuotes = false;
            currentPos += 1;
            continue;
        }

        if (!inQuotes && csvLine[currentPos] === ',') {
            row.push(chunk.trim());
            chunk = '';
            currentPos += 1;
            continue;
        }

        chunk += csvLine[currentPos];
        currentPos += 1;
    }

    chunk ? row.push(chunk.trim()) : chunk;

    return row;
}