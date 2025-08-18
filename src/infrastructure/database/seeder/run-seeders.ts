import { DataSource } from 'typeorm';
import { RoleSeeder } from './role.seeder';
import { MenuSeeder } from './menu.seeder';
import { PermissionSeeder } from './permission.seeder';
import { UserSeeder } from './user.seeder';

export class SeederRunner {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    console.log('Starting database seeding...\n');

    try {
      const roleSeeder = new RoleSeeder(this.dataSource);
      await roleSeeder.run();
      console.log('Role seeding completed.\n');

      const menuSeeder = new MenuSeeder(this.dataSource);
      await menuSeeder.run();
      console.log('Menu seeding completed.\n');

      const permissionSeeder = new PermissionSeeder(this.dataSource);
      await permissionSeeder.run();
      console.log('Permission seeding completed.\n');

      const userSeeder = new UserSeeder(this.dataSource);
      await userSeeder.run();
      console.log('User seeding completed.\n');

      console.log('All seeders completed successfully!');
    } catch (error) {
      console.error('Error during seeding:', error);
      throw error;
    }
  }

  async runSpecificSeeder(seederName: string): Promise<void> {
    console.log(`Running ${seederName} seeder...\n`);

    try {
      switch (seederName.toLowerCase()) {
        case 'role':
          const roleSeeder = new RoleSeeder(this.dataSource);
          await roleSeeder.run();
          break;
        case 'menu':
          const menuSeeder = new MenuSeeder(this.dataSource);
          await menuSeeder.run();
          break;
        case 'permission':
          const permissionSeeder = new PermissionSeeder(this.dataSource);
          await permissionSeeder.run();
          break;
        case 'user':
          const userSeeder = new UserSeeder(this.dataSource);
          await userSeeder.run();
          break;
        default:
          console.log(`Unknown seeder: ${seederName}`);
          return;
      }
      console.log(`${seederName} seeder completed successfully!`);
    } catch (error) {
      console.error(`Error during ${seederName} seeding:`, error);
      throw error;
    }
  }
}
