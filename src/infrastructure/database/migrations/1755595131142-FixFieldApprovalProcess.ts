import { MigrationInterface, QueryRunner } from "typeorm";

export class FixFieldApprovalProcess1755595131142 implements MigrationInterface {
    name = 'FixFieldApprovalProcess1755595131142'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "approval_processes" DROP COLUMN "status"`);
        await queryRunner.query(`CREATE TYPE "public"."approval_processes_status_enum" AS ENUM('approved', 'rejected')`);
        await queryRunner.query(`ALTER TABLE "approval_processes" ADD "status" "public"."approval_processes_status_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "approval_processes" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."approval_processes_status_enum"`);
        await queryRunner.query(`ALTER TABLE "approval_processes" ADD "status" character varying`);
    }

}
