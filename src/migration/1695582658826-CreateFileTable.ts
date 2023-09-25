import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFileTable1695582658826 implements MigrationInterface {
    name = 'CreateFileTable1695582658826'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "file" ("id" SERIAL NOT NULL, "url" character varying NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_36b46d232307066b3a2c9ea3a1d" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "file"`);
    }

}
