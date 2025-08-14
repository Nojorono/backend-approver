import { Entity, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { MenuRole } from './menu-role.entity';

@Entity('menus')
export class Menu extends BaseEntity {
  @Column()
  name: string;

  @Column()
  path: string;

  @Column({ nullable: true })
  icon?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: 0 })
  order: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  parentId?: string;

  @ManyToMany(() => Menu)
  @JoinTable({
    name: 'menu_children',
    joinColumn: { name: 'parentId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'childId', referencedColumnName: 'id' },
  })
  children: Menu[];

  @OneToMany(() => MenuRole, (menuRole) => menuRole.menu)
  menuRoles: MenuRole[];
}
