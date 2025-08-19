import { DataSource } from 'typeorm';
import { Permission } from '../../../core/domain/entities/permission.entity';
import { Role } from '../../../core/domain/entities/role.entity';
import { Menu } from '../../../core/domain/entities/menu.entity';

export class PermissionSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const permissionRepository = this.dataSource.getRepository(Permission);
    const roleRepository = this.dataSource.getRepository(Role);
    const menuRepository = this.dataSource.getRepository(Menu);

    const adminRole = await roleRepository.findOne({
      where: { name: 'admin' },
    });

    if (!adminRole) {
      console.log('Admin role not found. Please run role seeder first.');
      return;
    }

    const allMenus = await menuRepository.find();
    const actions = ['View', 'Create', 'Update', 'Delete'];

    const permissions: Array<{
      action: string;
      menuId: string;
      roleId: string;
    }> = [];

    for (const menu of allMenus) {
      for (const action of actions) {
        permissions.push({
          action,
          menuId: menu.id,
          roleId: adminRole.id,
        });
      }
    }

    for (const permissionData of permissions) {
      const existingPermission = await permissionRepository.findOne({
        where: {
          roleId: permissionData.roleId,
          menuId: permissionData.menuId,
          action: permissionData.action,
        },
      });

      if (!existingPermission) {
        const permission = permissionRepository.create(permissionData);
        await permissionRepository.save(permission);
        console.log(
          `Created permission: ${permissionData.action} for menu ${permissionData.menuId} and role ${permissionData.roleId}`,
        );
      } else {
        console.log(
          `Permission already exists: ${permissionData.action} for menu ${permissionData.menuId} and role ${permissionData.roleId}`,
        );
      }
    }
  }
}
