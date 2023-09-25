import { AppDataSource } from '../datasource';
import { Log, LogDTO } from '../entities/Log';
import { DeleteResult, UpdateResult } from 'typeorm';

export default class LogService {

    private logRepository = AppDataSource.getRepository(Log);

    async create(log: LogDTO): Promise<Log> {
        return this.logRepository.save(log);
    }

    async findAll(): Promise<Log[]> {
        return this.logRepository.find();
    }

    async findOne(params: Partial<Log>): Promise<Log | null> {
        return this.logRepository.findOneBy(params);
    }

    async update(existing: Partial<Log>, updated: Partial<Log>): Promise<UpdateResult> {
        return this.logRepository
            .createQueryBuilder()
            .update(Log)
            .set(updated)
            .where(existing)
            .execute();
    }

    async delete(params: Partial<Log>): Promise<DeleteResult> {
        return this.logRepository
            .createQueryBuilder('log')
            .delete()
            .from(Log)
            .where(params)
            .execute()
    }
}