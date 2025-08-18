import { DataSource } from 'typeorm';
import { SeederRunner } from './run-seeders';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config();

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'approver',
    entities: [
      join(
        __dirname,
        '..',
        '..',
        '..',
        'core',
        'domain',
        'entities',
        '*.entity.{ts,js}',
      ),
    ],
    synchronize: false,
    logging: true,
  });

  try {
    await dataSource.initialize();
    console.log('Database connection established.');

    const seederRunner = new SeederRunner(dataSource);

    const args = process.argv.slice(2);
    const seederName = args[0];

    if (seederName) {
      await seederRunner.runSpecificSeeder(seederName);
    } else {
      await seederRunner.run();
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
    console.log('Database connection closed.');
  }
}

seed();
