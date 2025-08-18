import { DataSource } from 'typeorm';
import { Menu } from '../../../core/domain/entities/menu.entity';

export class MenuSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const menuRepository = this.dataSource.getRepository(Menu);

    const menus = [
      {
        name: 'Dashboard',
        path: '/dashboard',
        icon: 'dashboard',
        parentId: null,
        order: 1,
      },
      {
        name: 'User',
        path: '/user',
        icon: 'user',
        parentId: null,
        order: 2,
      },
      {
        name: 'Menu',
        path: '/menu',
        icon: 'menu',
        parentId: null,
        order: 3,
      },
      {
        name: 'Role',
        path: '/role',
        icon: 'shield',
        parentId: null,
        order: 4,
      },
    ];

    for (const menuData of menus) {
      const existingMenu = await menuRepository.findOne({
        where: { path: menuData.path },
      });

      if (!existingMenu) {
        const menu = menuRepository.create(menuData);
        await menuRepository.save(menu);
        console.log(`Created menu: ${menuData.name} (${menuData.path})`);
      } else {
        console.log(`Menu already exists: ${menuData.name} (${menuData.path})`);
      }
    }
  }
}
