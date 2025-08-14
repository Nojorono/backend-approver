import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from '../entities/menu.entity';
import { MenuRole } from '../entities/menu-role.entity';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { UpdateMenuDto } from '../dto/update-menu.dto';
import { UserMenuDto } from '../dto/user-menu.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
    @InjectRepository(MenuRole)
    private menuRoleRepository: Repository<MenuRole>,
  ) {}

  async create(createMenuDto: CreateMenuDto): Promise<Menu> {
    const menu = this.menuRepository.create(createMenuDto);
    const savedMenu = await this.menuRepository.save(menu);

    if (createMenuDto.roleIds && createMenuDto.roleIds.length > 0) {
      await this.assignRolesToMenu(savedMenu.id, createMenuDto.roleIds);
    }

    return this.findOne(savedMenu.id);
  }

  async findAll(paginationDto: PaginationDto): Promise<{ menus: Menu[]; total: number; page: number; limit: number; totalPages: number }> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [menus, total] = await this.menuRepository.findAndCount({
      skip,
      take: limit,
      relations: ['children', 'menuRoles', 'menuRoles.role'],
      order: { order: 'ASC', createdAt: 'DESC' },
    });

    return {
      menus,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Menu> {
    const menu = await this.menuRepository.findOne({
      where: { id },
      relations: ['children', 'menuRoles', 'menuRoles.role'],
    });

    if (!menu) {
      throw new NotFoundException('Menu not found');
    }

    return menu;
  }

  async update(id: string, updateMenuDto: UpdateMenuDto): Promise<Menu> {
    const menu = await this.findOne(id);
    Object.assign(menu, updateMenuDto);
    const savedMenu = await this.menuRepository.save(menu);

    if (updateMenuDto.roleIds) {
      await this.updateMenuRoles(id, updateMenuDto.roleIds);
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    const menu = await this.findOne(id);
    await this.menuRepository.remove(menu);
    return { message: 'Menu deleted successfully' };
  }

  async getUserMenus(userRoleIds: string[]): Promise<UserMenuDto[]> {
    const allMenus = await this.menuRepository.find({
      where: { isActive: true, parentId: null },
      relations: ['children', 'menuRoles', 'menuRoles.role'],
      order: { order: 'ASC' },
    });

    return this.filterMenusByRoleIds(allMenus, userRoleIds);
  }

  private filterMenusByRoleIds(menus: Menu[], userRoleIds: string[]): UserMenuDto[] {
    return menus
      .filter(menu => this.hasRequiredRoleIds(menu, userRoleIds))
      .map(menu => ({
        id: menu.id,
        name: menu.name,
        path: menu.path,
        icon: menu.icon,
        order: menu.order,
        children: menu.children ? this.filterMenusByRoleIds(menu.children, userRoleIds) : undefined,
      }));
  }

  private hasRequiredRoleIds(menu: Menu, userRoleIds: string[]): boolean {
    if (!menu.menuRoles || menu.menuRoles.length === 0) {
      return true;
    }
    return menu.menuRoles.some(menuRole => userRoleIds.includes(menuRole.roleId));
  }

  async getMenuTree(): Promise<Menu[]> {
    return this.menuRepository.find({
      where: { parentId: null },
      relations: ['children', 'menuRoles', 'menuRoles.role'],
      order: { order: 'ASC' },
    });
  }

  async toggleActive(id: string): Promise<Menu> {
    const menu = await this.findOne(id);
    menu.isActive = !menu.isActive;
    return this.menuRepository.save(menu);
  }

  private async assignRolesToMenu(menuId: string, roleIds: string[]): Promise<void> {
    const menuRoles = roleIds.map(roleId => 
      this.menuRoleRepository.create({ menuId, roleId })
    );
    await this.menuRoleRepository.save(menuRoles);
  }

  private async updateMenuRoles(menuId: string, roleIds: string[]): Promise<void> {
    await this.menuRoleRepository.delete({ menuId });
    if (roleIds.length > 0) {
      await this.assignRolesToMenu(menuId, roleIds);
    }
  }
}
