import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class File {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    url!: string

    @CreateDateColumn({type: 'timestamptz'})
    timestamp!: Date;
}

export interface createDTO {
    url: string;
}

export interface findByUrlDTO {
    url: string;
}