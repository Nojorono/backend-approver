import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFieldCreatedByApprovalRequest1755567672853 implements MigrationInterface {
    name = 'AddFieldCreatedByApprovalRequest1755567672853'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "approval_requests" ADD "createdBy" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "approval_requests" DROP COLUMN "createdBy"`);
    }

}
