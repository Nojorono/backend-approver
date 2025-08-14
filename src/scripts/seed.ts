import { DataSource } from 'typeorm';
import { runSeeders } from '../database/seeders/run-seeders';
import { AppDataSource } from '../config/data-source';

async function seed() {
  const dataSource = new DataSource(AppDataSource.options);

  try {
    await dataSource.initialize();
    console.log('Database connected successfully');

    await runSeeders(dataSource);
    
    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

seed();
