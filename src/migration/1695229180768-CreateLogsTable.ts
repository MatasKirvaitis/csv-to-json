import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateLogsTable1695229180768 implements MigrationInterface {
    name = 'CreateLogsTable1695229180768'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."log_level_enum" AS ENUM('INFO', 'ERROR')`);
        await queryRunner.query(`CREATE TABLE "log" ("id" SERIAL NOT NULL, "appName" character varying NOT NULL, "level" "public"."log_level_enum" NOT NULL, "message" character varying NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_350604cbdf991d5930d9e618fbd" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "log"`);
        await queryRunner.query(`DROP TYPE "public"."log_level_enum"`);
    }

}
