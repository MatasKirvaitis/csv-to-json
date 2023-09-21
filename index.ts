import startClient from './client/client';
import startServer from './server/server';
import 'dotenv/config';
import { AppDataSource } from './datasource';
import { DataSource } from 'typeorm';

(async () => {
    //Add Docker Compose.
    try {
        const tempDataSource = new DataSource ({
            type: 'postgres',
            host: process.env.PG_HOST,
            port: Number(process.env.PG_PORT),
            username: process.env.PG_USER,
            password: process.env.PG_PASSWORD,
            database: 'postgres',
        });
    
        await tempDataSource.initialize();
    
        const dbExists = await tempDataSource.query(
            `SELECT datname FROM pg_database WHERE datname='${process.env.PG_DATABASE}'`
        );

        if (dbExists.length === 0) {
            await tempDataSource.query(`CREATE DATABASE ${process.env.PG_DATABASE}`);
            console.log(`Database ${process.env.PG_DATABASE} created successfully`);
        }

        await tempDataSource.destroy();

        await AppDataSource.initialize();
        console.log('Data Source Initialized');

        startServer();
        startClient();
    } catch(err) {
        if (err instanceof Error) {
            console.log(err.message);
        } else {
            console.log('Unknown error');
        }
    }
})();