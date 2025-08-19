import { DataSource } from 'typeorm';
import { SeederRunner } from './run-seeders';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config();

async function seedRefresh() {
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

    console.log('Clearing existing data...');

    await dataSource.query('DELETE FROM permissions');
    await dataSource.query('DELETE FROM users');
    await dataSource.query('DELETE FROM roles');
    await dataSource.query('DELETE FROM menus');

    console.log('Existing data cleared successfully.');

    const seederRunner = new SeederRunner(dataSource);
    await seederRunner.run();

    console.log('Seed refresh completed successfully!');
  } catch (error) {
    console.error('Error during seed refresh:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
    console.log('Database connection closed.');
  }
}

seedRefresh();
