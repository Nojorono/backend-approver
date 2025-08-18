import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../../core/domain/entities/permission.entity';
import { IPermissionRepository } from '../../core/domain/interfaces/permission.repository.interface';
import { Menu } from 'src/core/domain/entities/menu.entity';

@Injectable()
export class PermissionRepository implements IPermissionRepository {
  constructor(
    @InjectRepository(Permission)
    private readonly repository: Repository<Permission>,
  ) {}

  async findAll(): Promise<Permission[]> {
    return this.repository.find({ relations: ['menu', 'role'] });
  }

  async findById(id: string): Promise<Permission | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['menu', 'role'],
    });
  }

  async findByRoleId(roleId: string): Promise<Permission[]> {
    return this.repository.find({
      where: { roleId: roleId },
      relations: ['menu', 'role'],
    });
  }

  async findMenuByRoleId(roleId: string): Promise<{ menus: any[] }> {
    const permissions = await this.repository.find({
      where: { roleId: roleId },
      relations: ['menu'],
    });

    // Group actions by menu
    const menuMap = new Map<string, any>();

    for (const permission of permissions) {
      const menuId = permission.menu.id;

      if (!menuMap.has(menuId)) {
        // Initialize menu if not exists
        menuMap.set(menuId, {
          id: permission.menu.id,
          name: permission.menu.name,
          path: permission.menu.path,
          icon: permission.menu.icon,
          parentId: permission.menu.parentId,
          order: permission.menu.order,
          createdAt: permission.menu.createdAt,
          updatedAt: permission.menu.updatedAt,
          actions: [],
        });
      }

      // Add action to the menu
      menuMap.get(menuId).actions.push(permission.action);
    }

    const menus = Array.from(menuMap.values());
    return { menus };
  }

  async findByMenuId(menuId: string): Promise<Permission[]> {
    return this.repository.find({
      where: { menuId: menuId },
      relations: ['menu', 'role'],
    });
  }

  async create(permission: Partial<Permission>): Promise<Permission> {
    const newPermission = this.repository.create(permission);
    return this.repository.save(newPermission);
  }

  async update(
    id: string,
    permission: Partial<Permission>,
  ): Promise<Permission | null> {
    await this.repository.update(id, permission);
    return this.findById(id);
  }

  async delete(id: string): Promise<any> {
    const result = await this.repository.delete(id);
    return result;
  }

  async deleteByRoleId(roleId: string): Promise<any> {
    const result = await this.repository.delete({ roleId });
    return result;
  }
}
