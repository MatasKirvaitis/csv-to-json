import { DeleteResult } from 'typeorm';
import { AppDataSource } from '../datasource';
import { File, createDTO, findByUrlDTO } from '../entities/File';

export default class FileService {
    private fileRepository = AppDataSource.getRepository(File);

    async create(file: createDTO): Promise<File> {
        return this.fileRepository.save(file);
    }

    async findAll(params: findByUrlDTO): Promise<File[]> {
        return this.fileRepository
            .createQueryBuilder()
            .select('file')
            .from(File, 'file')
            .where('file.url LIKE :url', { url: `%${params.url}%` })
            .getMany();
    }

    async findOne(params: Partial<File>): Promise<File | null> {
        return this.fileRepository.findOneBy(params);
    }

    async delete(params: Partial<File>): Promise<DeleteResult> {
        return this.fileRepository
            .createQueryBuilder('file')
            .delete()
            .from(File)
            .where(params)
            .execute();
    }
}