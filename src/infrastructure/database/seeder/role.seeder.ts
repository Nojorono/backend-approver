import { DataSource } from 'typeorm';
import { Role } from '../../../core/domain/entities/role.entity';

export class RoleSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const roleRepository = this.dataSource.getRepository(Role);

    const roles = [
      {
        name: 'admin',
        description: 'Administrator with full access',
        isActive: true,
      },
      {
        name: 'approver',
        description: 'User with approval permissions',
        isActive: true,
      },
    ];

    for (const roleData of roles) {
      const existingRole = await roleRepository.findOne({
        where: { name: roleData.name },
      });

      if (!existingRole) {
        const role = roleRepository.create(roleData);
        await roleRepository.save(role);
        console.log(`Created role: ${roleData.name}`);
      } else {
        console.log(`Role already exists: ${roleData.name}`);
      }
    }
  }
}
