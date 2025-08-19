import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateApprovalRequest1755566208586 implements MigrationInterface {
    name = 'CreateApprovalRequest1755566208586'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "approval_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "code" character varying, "subject" character varying, "approverIds" text, "description" character varying, "attachments" text, "status" character varying, CONSTRAINT "PK_484806bb8ff331b851fc75973c0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_db400bd80b47586ccfb5f6ef9a" ON "approval_requests" ("code") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_db400bd80b47586ccfb5f6ef9a"`);
        await queryRunner.query(`DROP TABLE "approval_requests"`);
    }

}
