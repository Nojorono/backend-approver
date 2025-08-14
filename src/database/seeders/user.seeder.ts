import { DataSource, In } from 'typeorm';
import { User } from '@/modules/auth/entities/user.entity';
import { Role } from '@/modules/roles/entities/role.entity';

export class UserSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const userRepository = this.dataSource.getRepository(User);
    const roleRepository = this.dataSource.getRepository(Role);

    const defaultUsers = [
      {
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        password: 'admin123',
        roleName: 'admin',
      },
      {
        email: 'audit@example.com',
        firstName: 'Audit',
        lastName: 'User',
        password: 'audit123',
        roleName: 'audit',
      },
      {
        email: 'requestor@example.com',
        firstName: 'Requestor',
        lastName: 'User',
        password: 'requestor123',
        roleName: 'requestor',
      },
      {
        email: 'approver@example.com',
        firstName: 'Approver',
        lastName: 'User',
        password: 'approver123',
        roleName: 'approver',
      },
      {
        email: 'multi@example.com',
        firstName: 'Multi',
        lastName: 'Role User',
        password: 'multi123',
        roleNames: ['requestor', 'approver'],
      },
    ];

    for (const userData of defaultUsers) {
      const existingUser = await userRepository.findOne({
        where: { email: userData.email },
      });

      if (!existingUser) {
        const user = userRepository.create({
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          password: userData.password,
          isActive: true,
        });

        const savedUser = await userRepository.save(user);

        if (userData.roleName) {
          const role = await roleRepository.findOne({
            where: { name: userData.roleName },
          });

          if (role) {
            user.roles = [role];
            await userRepository.save(user);
          }
        } else if (userData.roleNames) {
          const roles = await roleRepository.find({
            where: { name: In(userData.roleNames) },
          });

          if (roles.length > 0) {
            user.roles = roles;
            await userRepository.save(user);
          }
        }
      }
    }

    console.log('User seeder completed successfully');
  }
}
