import { DataSource } from 'typeorm';
require('dotenv').config();

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.PG_HOST,
    port: Number(process.env.PG_PORT),
    username: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    entities: ['./src/entities/*.{js,ts}'],
    synchronize: false,
    migrations: ['./src/migration/*.{js,ts}'],
});