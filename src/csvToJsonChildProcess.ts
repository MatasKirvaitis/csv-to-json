import csvToJSON from './csvToJson';
import { AppDataSource } from './datasource';
import FileService from './services/FileService';

export interface childProcessMessage {
    inputName: string,
    outputName: string,
    headerFlag: boolean,
    loggerFlag: boolean,
    downloadURL: string,
    dbFlag: boolean
    success: boolean,
    error: string
}

process.on('message', async (message: childProcessMessage) => {
    try {
        await AppDataSource.initialize();
        console.log('Data Source Initialized');

        await csvToJSON(message.inputName, message.outputName, message.headerFlag);

        const fileService = new FileService();

        await fileService.create({ url: message.downloadURL });

        sendMessage({ success: true });
    } catch (err) {
        if (err instanceof Error) {
            sendMessage({ success: false, error: err.message });
        } else {
            sendMessage({ success: false, error: 'Unknown error occured' });
        }
    }
});

function sendMessage(message: { success: boolean, error?: string }) {
    if (process.send) {
        process.send(message);
    } else {
        throw (new Error('process.send is undefined'));
    }
}