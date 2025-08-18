import { Menu } from '../entities/menu.entity';

export const MENU_REPOSITORY = 'MENU_REPOSITORY';

export interface IMenuRepository {
  findAll(): Promise<Menu[]>;
  findAllParent(): Promise<Menu[]>;
  findById(id: string): Promise<Menu>;
  findByPath(path: string): Promise<Menu>;
  create(menu: Partial<Menu>): Promise<Menu>;
  update(id: string, menu: Partial<Menu>): Promise<Menu>;
  delete(id: string): Promise<void>;
  findChildren(parentId: string): Promise<Menu[]>;
}
