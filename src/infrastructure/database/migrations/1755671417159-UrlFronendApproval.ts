import { MigrationInterface, QueryRunner } from "typeorm";

export class UrlFronendApproval1755671417159 implements MigrationInterface {
    name = 'UrlFronendApproval1755671417159'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "approval_requests" ADD "frontendUrl" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "approval_requests" DROP COLUMN "frontendUrl"`);
    }

}
