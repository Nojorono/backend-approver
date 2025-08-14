import { DataSource, In } from 'typeorm';
import { Menu } from '@/modules/menus/entities/menu.entity';
import { MenuRole } from '@/modules/menus/entities/menu-role.entity';
import { Role } from '@/modules/roles/entities/role.entity';

export class MenuSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const menuRepository = this.dataSource.getRepository(Menu);
    const menuRoleRepository = this.dataSource.getRepository(MenuRole);
    const roleRepository = this.dataSource.getRepository(Role);

    const defaultMenus = [
             {
         name: 'Dashboard',
         path: '/dashboard',
         icon: 'dashboard',
         order: 1,
         roleNames: ['admin', 'audit', 'requestor', 'approver'],
       },
      {
        name: 'User Management',
        path: '/users',
        icon: 'users',
        order: 2,
        roleNames: ['admin'],
        children: [
          {
            name: 'All Users',
            path: '/users',
            icon: 'list',
            order: 1,
            roleNames: ['admin'],
          },
                     {
             name: 'User Profile',
             path: '/users/profile',
             icon: 'profile',
             order: 2,
             roleNames: ['admin', 'audit', 'requestor', 'approver'],
           },
        ],
      },
      {
        name: 'Role Management',
        path: '/roles',
        icon: 'shield',
        order: 3,
        roleNames: ['admin'],
        children: [
          {
            name: 'All Roles',
            path: '/roles',
            icon: 'list',
            order: 1,
            roleNames: ['admin'],
          },
          {
            name: 'Active Roles',
            path: '/roles/active',
            icon: 'check-circle',
            order: 2,
            roleNames: ['admin'],
          },
        ],
      },
      {
        name: 'Menu Management',
        path: '/menus',
        icon: 'menu',
        order: 4,
        roleNames: ['admin'],
        children: [
          {
            name: 'All Menus',
            path: '/menus',
            icon: 'list',
            order: 1,
            roleNames: ['admin'],
          },
          {
            name: 'Menu Tree',
            path: '/menus/tree',
            icon: 'tree',
            order: 2,
            roleNames: ['admin'],
          },
        ],
      },
             {
         name: 'Requests',
         path: '/requests',
         icon: 'file-text',
         order: 5,
         roleNames: ['requestor', 'approver', 'admin'],
         children: [
           {
             name: 'My Requests',
             path: '/requests/my',
             icon: 'user-check',
             order: 1,
             roleNames: ['requestor', 'admin'],
           },
           {
             name: 'Create Request',
             path: '/requests/create',
             icon: 'plus',
             order: 2,
             roleNames: ['requestor', 'admin'],
           },
           {
             name: 'Pending Approvals',
             path: '/requests/pending',
             icon: 'clock',
             order: 3,
             roleNames: ['approver', 'admin'],
           },
           {
             name: 'All Requests',
             path: '/requests/all',
             icon: 'list',
             order: 4,
             roleNames: ['admin'],
           },
         ],
       },
      {
        name: 'Audit & Reports',
        path: '/audit',
        icon: 'bar-chart',
        order: 6,
        roleNames: ['audit', 'admin'],
        children: [
          {
            name: 'System Logs',
            path: '/audit/logs',
            icon: 'file-text',
            order: 1,
            roleNames: ['audit', 'admin'],
          },
          {
            name: 'User Activity',
            path: '/audit/activity',
            icon: 'activity',
            order: 2,
            roleNames: ['audit', 'admin'],
          },
          {
            name: 'Request Reports',
            path: '/audit/requests',
            icon: 'pie-chart',
            order: 3,
            roleNames: ['audit', 'admin'],
          },
          {
            name: 'Security Reports',
            path: '/audit/security',
            icon: 'shield',
            order: 4,
            roleNames: ['audit', 'admin'],
          },
        ],
      },
      {
        name: 'Settings',
        path: '/settings',
        icon: 'settings',
        order: 7,
        roleNames: ['admin'],
        children: [
          {
            name: 'System Settings',
            path: '/settings/system',
            icon: 'gear',
            order: 1,
            roleNames: ['admin'],
          },
                     {
             name: 'User Settings',
             path: '/settings/user',
             icon: 'user-cog',
             order: 2,
             roleNames: ['admin', 'audit', 'requestor', 'approver'],
           },
        ],
      },
    ];

    for (const menuData of defaultMenus) {
      const existingMenu = await menuRepository.findOne({
        where: { path: menuData.path },
      });

      if (!existingMenu) {
        const menu = menuRepository.create({
          name: menuData.name,
          path: menuData.path,
          icon: menuData.icon,
          order: menuData.order,
        });

        const savedMenu = await menuRepository.save(menu);

        if (menuData.roleNames && menuData.roleNames.length > 0) {
          const roles = await roleRepository.find({
            where: { name: In(menuData.roleNames) },
          });

          for (const role of roles) {
            const menuRole = menuRoleRepository.create({
              menuId: savedMenu.id,
              roleId: role.id,
            });
            await menuRoleRepository.save(menuRole);
          }
        }

        if (menuData.children) {
          for (const childData of menuData.children) {
            const childMenu = menuRepository.create({
              name: childData.name,
              path: childData.path,
              icon: childData.icon,
              order: childData.order,
              parentId: savedMenu.id,
            });

            const savedChildMenu = await menuRepository.save(childMenu);

            if (childData.roleNames && childData.roleNames.length > 0) {
              const childRoles = await roleRepository.find({
                where: { name: In(childData.roleNames) },
              });

              for (const role of childRoles) {
                const menuRole = menuRoleRepository.create({
                  menuId: savedChildMenu.id,
                  roleId: role.id,
                });
                await menuRoleRepository.save(menuRole);
              }
            }
          }
        }
      }
    }

    console.log('Menu seeder completed successfully');
  }
}
