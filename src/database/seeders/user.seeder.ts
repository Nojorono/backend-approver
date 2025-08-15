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
        phone: '09123456789',
        username: 'admin',
        pin: '1234567890',
        password: 'admin123',
        roleName: 'admin',
      },
      {
        email: 'audit@example.com',
        phone: '091234567891',
        username: 'audit',
        pin: '1234567890',
        password: 'audit123',
        roleName: 'audit',
      },
      {
        email: 'requestor@example.com',
        phone: '091234567892',
        username: 'requestor',
        pin: '1234567890',
        password: 'requestor123',
        roleName: 'requestor',
      },
      {
        email: 'approver@example.com',
        phone: '091234567893',
        username: 'approver',
        pin: '1234567890',
        password: 'approver123',
        roleName: 'approver',
      },
      {
        email: 'multi@example.com',
        phone: '091234567894',
        username: 'multi',
        pin: '1234567890',
        password: 'multi123',
        roleNames: ['requestor', 'approver'],
      },
    ];

    for (const userData of defaultUsers) {
      const existingUser = await userRepository.findOne({
        where: { username: userData.username },
      });

      if (!existingUser) {
        const user = userRepository.create({
          email: userData.email,
          phone: userData.phone,
          username: userData.username,
          pin: userData.pin,
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
