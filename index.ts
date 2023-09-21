import startClient from './client/client';
import startServer from './server/server';
import 'dotenv/config';
import { AppDataSource } from './datasource';
import LogService from './src/services/LogService';

//incorrect logger method used in most places, need to recheck

(async () => {
    //Add database creation if does not exist in application start.
    //Add Docker Compose.
    try {
        await AppDataSource.initialize();
        console.log('Data Source Initialized');

        // startServer();
        // startClient();
    } catch(err) {
        if (err instanceof Error) {
            console.log(err.message);
        } else {
            console.log('Unknown error');
        }
    }
})();