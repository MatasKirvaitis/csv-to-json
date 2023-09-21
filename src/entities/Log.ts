import { Entity, PrimaryGeneratedColumn, Column, Timestamp } from 'typeorm';

@Entity()
export class Log {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    appName!: string;

    @Column({
        type: 'enum',
        enum: ['INFO', 'ERROR']
    })
    level!: string;

    @Column()
    message!: string;

    @Column('timestamptz')
    timestamp!: Date;
}

export interface LogDTO {
    appName: string;
    level: string;
    message: string;
    timestamp: Date;
}