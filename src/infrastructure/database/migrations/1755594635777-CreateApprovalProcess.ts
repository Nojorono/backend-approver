import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateApprovalProcess1755594635777 implements MigrationInterface {
    name = 'CreateApprovalProcess1755594635777'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification_tracks" DROP CONSTRAINT "FK_notification_tracks_approval_request"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_notification_tracks_approval_request_type"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_notification_tracks_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_notification_tracks_message_id"`);
        await queryRunner.query(`CREATE TABLE "approval_processes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "approvalRequestId" character varying, "approverId" character varying, "status" character varying, "reasonRejected" character varying, CONSTRAINT "PK_38fc523ac1558377b304dd8bcb8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TYPE "public"."notification_type_enum" RENAME TO "notification_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."notification_tracks_type_enum" AS ENUM('email', 'whatsapp')`);
        await queryRunner.query(`ALTER TABLE "notification_tracks" ALTER COLUMN "type" TYPE "public"."notification_tracks_type_enum" USING "type"::"text"::"public"."notification_tracks_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notification_type_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."notification_status_enum" RENAME TO "notification_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."notification_tracks_status_enum" AS ENUM('pending', 'sent', 'delivered', 'failed', 'rejected')`);
        await queryRunner.query(`ALTER TABLE "notification_tracks" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "notification_tracks" ALTER COLUMN "status" TYPE "public"."notification_tracks_status_enum" USING "status"::"text"::"public"."notification_tracks_status_enum"`);
        await queryRunner.query(`ALTER TABLE "notification_tracks" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."notification_status_enum_old"`);
        await queryRunner.query(`CREATE INDEX "IDX_d79ca6b8ed3594636635a5cffe" ON "notification_tracks" ("messageId") `);
        await queryRunner.query(`CREATE INDEX "IDX_39413e64883794afa0ed5f9251" ON "notification_tracks" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_2754d206db2893a998a8c43eba" ON "notification_tracks" ("approval_request_id", "type") `);
        await queryRunner.query(`ALTER TABLE "notification_tracks" ADD CONSTRAINT "FK_4cab21f9265266647be31921143" FOREIGN KEY ("approval_request_id") REFERENCES "approval_requests"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification_tracks" DROP CONSTRAINT "FK_4cab21f9265266647be31921143"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2754d206db2893a998a8c43eba"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_39413e64883794afa0ed5f9251"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d79ca6b8ed3594636635a5cffe"`);
        await queryRunner.query(`CREATE TYPE "public"."notification_status_enum_old" AS ENUM('pending', 'sent', 'delivered', 'failed', 'rejected')`);
        await queryRunner.query(`ALTER TABLE "notification_tracks" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "notification_tracks" ALTER COLUMN "status" TYPE "public"."notification_status_enum_old" USING "status"::"text"::"public"."notification_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "notification_tracks" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."notification_tracks_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."notification_status_enum_old" RENAME TO "notification_status_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."notification_type_enum_old" AS ENUM('email', 'whatsapp')`);
        await queryRunner.query(`ALTER TABLE "notification_tracks" ALTER COLUMN "type" TYPE "public"."notification_type_enum_old" USING "type"::"text"::"public"."notification_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."notification_tracks_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."notification_type_enum_old" RENAME TO "notification_type_enum"`);
        await queryRunner.query(`DROP TABLE "approval_processes"`);
        await queryRunner.query(`CREATE INDEX "IDX_notification_tracks_message_id" ON "notification_tracks" ("messageId") `);
        await queryRunner.query(`CREATE INDEX "IDX_notification_tracks_status" ON "notification_tracks" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_notification_tracks_approval_request_type" ON "notification_tracks" ("approval_request_id", "type") `);
        await queryRunner.query(`ALTER TABLE "notification_tracks" ADD CONSTRAINT "FK_notification_tracks_approval_request" FOREIGN KEY ("approval_request_id") REFERENCES "approval_requests"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
