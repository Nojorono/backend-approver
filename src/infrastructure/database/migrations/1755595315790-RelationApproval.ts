import { MigrationInterface, QueryRunner } from "typeorm";

export class RelationApproval1755595315790 implements MigrationInterface {
    name = 'RelationApproval1755595315790'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "approval_processes" DROP COLUMN "approvalRequestId"`);
        await queryRunner.query(`ALTER TABLE "approval_processes" DROP COLUMN "approverId"`);
        await queryRunner.query(`ALTER TABLE "approval_processes" ADD "approval_request_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "approval_processes" ADD "approver_id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "approval_processes" ALTER COLUMN "status" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "approval_processes" ADD CONSTRAINT "FK_d5ead7e8c1f8441b18f491e8e11" FOREIGN KEY ("approval_request_id") REFERENCES "approval_requests"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "approval_processes" DROP CONSTRAINT "FK_d5ead7e8c1f8441b18f491e8e11"`);
        await queryRunner.query(`ALTER TABLE "approval_processes" ALTER COLUMN "status" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "approval_processes" DROP COLUMN "approver_id"`);
        await queryRunner.query(`ALTER TABLE "approval_processes" DROP COLUMN "approval_request_id"`);
        await queryRunner.query(`ALTER TABLE "approval_processes" ADD "approverId" character varying`);
        await queryRunner.query(`ALTER TABLE "approval_processes" ADD "approvalRequestId" character varying`);
    }

}
