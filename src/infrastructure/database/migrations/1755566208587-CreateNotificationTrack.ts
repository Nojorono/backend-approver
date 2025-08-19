import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNotificationTrack1755566208587 implements MigrationInterface {
    name = 'CreateNotificationTrack1755566208587'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."notification_type_enum" AS ENUM('email', 'whatsapp')`);
        await queryRunner.query(`CREATE TYPE "public"."notification_status_enum" AS ENUM('pending', 'sent', 'delivered', 'failed', 'rejected')`);
        await queryRunner.query(`CREATE TABLE "notification_tracks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "approval_request_id" uuid NOT NULL, "type" "public"."notification_type_enum" NOT NULL, "status" "public"."notification_status_enum" NOT NULL DEFAULT 'pending', "messageId" character varying, "recipient" character varying, "subject" character varying, "content" text, "metadata" jsonb, "sentAt" TIMESTAMP, "deliveredAt" TIMESTAMP, "errorMessage" text, "retryCount" integer, CONSTRAINT "PK_notification_tracks_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_notification_tracks_approval_request_type" ON "notification_tracks" ("approval_request_id", "type") `);
        await queryRunner.query(`CREATE INDEX "IDX_notification_tracks_status" ON "notification_tracks" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_notification_tracks_message_id" ON "notification_tracks" ("messageId") `);
        await queryRunner.query(`ALTER TABLE "notification_tracks" ADD CONSTRAINT "FK_notification_tracks_approval_request" FOREIGN KEY ("approval_request_id") REFERENCES "approval_requests"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification_tracks" DROP CONSTRAINT "FK_notification_tracks_approval_request"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_notification_tracks_message_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_notification_tracks_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_notification_tracks_approval_request_type"`);
        await queryRunner.query(`DROP TABLE "notification_tracks"`);
        await queryRunner.query(`DROP TYPE "public"."notification_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notification_type_enum"`);
    }
}
