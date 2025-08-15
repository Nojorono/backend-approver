import { DataSource } from 'typeorm';
import { runSeeders } from '../database/seeders/run-seeders';
import { AppDataSource } from '../config/data-source';

async function refreshSeed() {
  const dataSource = new DataSource(AppDataSource.options);

  try {
    await dataSource.initialize();
    console.log('Database connected successfully');

    console.log('Clearing existing data...');
    
    await dataSource.query('TRUNCATE TABLE "user_roles" CASCADE');
    await dataSource.query('TRUNCATE TABLE "menu_roles" CASCADE');
    await dataSource.query('TRUNCATE TABLE "menu_children" CASCADE');
    await dataSource.query('TRUNCATE TABLE "users" CASCADE');
    await dataSource.query('TRUNCATE TABLE "user_profiles" CASCADE');
    await dataSource.query('TRUNCATE TABLE "menus" CASCADE');
    await dataSource.query('TRUNCATE TABLE "roles" CASCADE');
    
    console.log('Existing data cleared successfully');

    await runSeeders(dataSource);
    
    console.log('Refresh seeding completed successfully');
  } catch (error) {
    console.error('Refresh seeding failed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

refreshSeed();
