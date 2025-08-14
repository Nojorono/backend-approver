import { DataSource } from 'typeorm';
import { Role } from '@/modules/roles/entities/role.entity';

export class RoleSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const roleRepository = this.dataSource.getRepository(Role);

    const defaultRoles = [
      {
        name: 'admin',
        description: 'Administrator with full access to all features',
      },
      {
        name: 'audit',
        description: 'Audit role with read-only access to system logs and reports',
      },
      {
        name: 'requestor',
        description: 'Requestor role with ability to create and submit requests',
      },
      {
        name: 'approver',
        description: 'Approver role with ability to approve or reject requests',
      },
    ];

    for (const roleData of defaultRoles) {
      const existingRole = await roleRepository.findOne({
        where: { name: roleData.name },
      });

      if (!existingRole) {
        const role = roleRepository.create(roleData);
        await roleRepository.save(role);
      }
    }

    console.log('Role seeder completed successfully');
  }
}
