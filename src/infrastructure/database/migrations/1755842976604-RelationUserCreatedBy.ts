import { MigrationInterface, QueryRunner } from "typeorm";

export class RelationUserCreatedBy1755842976604 implements MigrationInterface {
    name = 'RelationUserCreatedBy1755842976604'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "approval_requests" DROP COLUMN "createdBy"`);
        await queryRunner.query(`ALTER TABLE "approval_requests" ADD "createdBy" uuid`);
        await queryRunner.query(`ALTER TABLE "approval_requests" ADD CONSTRAINT "FK_fc604f19a2db9adb2779ac61ce7" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "approval_requests" DROP CONSTRAINT "FK_fc604f19a2db9adb2779ac61ce7"`);
        await queryRunner.query(`ALTER TABLE "approval_requests" DROP COLUMN "createdBy"`);
        await queryRunner.query(`ALTER TABLE "approval_requests" ADD "createdBy" character varying`);
    }

}
