import { Entity, Column, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { Menu } from './menu.entity';
import { Role } from './role.entity';
import { BaseEntity } from './base.entity';

@Entity('permissions')
@Index(['roleId', 'menuId'])
@Unique(['roleId', 'menuId', 'action'])
export class Permission extends BaseEntity {
  @Column({ length: 50 })
  action: string; // e.g., 'View', 'Create', 'Update', 'Delete'

  @ManyToOne(() => Menu, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'menu_id' })
  menu: Menu;

  @Column({ name: 'menu_id' })
  menuId: string;

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ name: 'role_id' })
  roleId: string;
}
