import { MigrationInterface, QueryRunner } from "typeorm";

export class RecipentIdNotifTrack1755677054849 implements MigrationInterface {
    name = 'RecipentIdNotifTrack1755677054849'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification_tracks" ADD "recipientId" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification_tracks" DROP COLUMN "recipientId"`);
    }

}
