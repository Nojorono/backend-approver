import { DataSource } from 'typeorm';
import { User } from '../../../core/domain/entities/user.entity';
import { Role } from '../../../core/domain/entities/role.entity';

export class UserSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const userRepository = this.dataSource.getRepository(User);
    const roleRepository = this.dataSource.getRepository(Role);

    const adminRole = await roleRepository.findOne({
      where: { name: 'admin' },
    });

    const approverRole = await roleRepository.findOne({
      where: { name: 'approver' },
    });

    if (!adminRole) {
      console.log('Admin role not found. Please run role seeder first.');
      return;
    }

    if (!approverRole) {
      console.log('Approver role not found. Please run role seeder first.');
      return;
    }

    const defaultPassword = 'password123';

    const users = [
      {
        username: 'admin',
        password: defaultPassword,
        pin: '1234',
        isActive: true,
        roleId: adminRole.id,
      },
      {
        username: 'testadmin',
        password: defaultPassword,
        pin: '1234',
        isActive: true,
        roleId: adminRole.id,
      },
      {
        username: 'approver1',
        password: defaultPassword,
        pin: '1234',
        isActive: true,
        roleId: approverRole.id,
      },
      {
        username: 'approver2',
        password: defaultPassword,
        pin: '1234',
        isActive: true,
        roleId: approverRole.id,
      },
    ];

    for (const userData of users) {
      const existingUser = await userRepository.findOne({
        where: { username: userData.username },
      });

      if (!existingUser) {
        const user = userRepository.create(userData);
        await userRepository.save(user);
        console.log(
          `Created user: ${userData.username} with role: ${userData.roleId}`,
        );
      } else {
        console.log(`User already exists: ${userData.username}`);
      }
    }

    console.log('\nDefault login credentials:');
    console.log('Username: admin, Password: password123, PIN: 1234');
    console.log('Username: testadmin, Password: password123, PIN: 1234');
    console.log('Username: approver1, Password: password123, PIN: 1234');
    console.log('Username: approver2, Password: password123, PIN: 1234');
  }
}
