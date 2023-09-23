import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class File {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    url!: string

    @CreateDateColumn('timestamptz')
    timestamp!: Date;
}

export interface updateDTO {
    url: string;
    timestamp: Date;
}

export interface createDTO {
    url: string;
}