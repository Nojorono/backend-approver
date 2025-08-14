import { DataSource } from 'typeorm';
import { RoleSeeder } from './role.seeder';
import { MenuSeeder } from './menu.seeder';
import { UserSeeder } from './user.seeder';

export async function runSeeders(dataSource: DataSource): Promise<void> {
  console.log('Starting database seeding...');

  try {
    const roleSeeder = new RoleSeeder(dataSource);
    await roleSeeder.run();

    const menuSeeder = new MenuSeeder(dataSource);
    await menuSeeder.run();

    const userSeeder = new UserSeeder(dataSource);
    await userSeeder.run();

    console.log('All seeders completed successfully!');
  } catch (error) {
    console.error('Error running seeders:', error);
    throw error;
  }
}
