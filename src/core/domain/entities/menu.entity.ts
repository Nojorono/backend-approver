import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Permission } from './permission.entity';
import { BaseEntity } from './base.entity';

@Entity('menus')
@Index(['path'], { unique: true })
@Index(['parentId'])
export class Menu extends BaseEntity {
  @Column({ length: 100 })
  name: string;

  @Column({ unique: true, length: 200 })
  path: string;

  @Column({ nullable: true, type: 'varchar', length: 100 })
  icon: string | null;

  @Column({ name: 'parent_id', nullable: true, type: 'uuid' })
  parentId: string | null;

  @ManyToOne(() => Menu, (menu) => menu.children, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_id' })
  parent: Menu | null;

  @OneToMany(() => Menu, (menu) => menu.parent, { cascade: true })
  children: Menu[];

  @Column({ default: 0 })
  order: number;

  @OneToMany(() => Permission, (permission) => permission.menu, {
    cascade: true,
  })
  permissions: Permission[];
}
