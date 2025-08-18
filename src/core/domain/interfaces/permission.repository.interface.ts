import { Permission } from '../entities/permission.entity';

export interface IPermissionRepository {
  findAll(): Promise<Permission[]>;
  findById(id: string): Promise<Permission | null>;
  findByRoleId(roleId: string): Promise<Permission[]>;
  findByMenuId(menuId: string): Promise<Permission[]>;
  findMenuByRoleId(roleId: string): Promise<{ menus: any[] }>;
  create(permission: Partial<Permission>): Promise<Permission>;
  update(
    id: string,
    permission: Partial<Permission>,
  ): Promise<Permission | null>;
  delete(id: string): Promise<boolean>;
  deleteByRoleId(roleId: string): Promise<boolean>;
}
