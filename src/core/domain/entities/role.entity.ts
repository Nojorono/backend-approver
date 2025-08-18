import { Entity, Column, OneToMany, Index } from 'typeorm';
import { User } from './user.entity';
import { Permission } from './permission.entity';
import { BaseEntity } from './base.entity';

@Entity('roles')
@Index(['name'], { unique: true })
export class Role extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Permission, (permission) => permission.role, {
    cascade: true,
  })
  permissions: Permission[];

  @OneToMany(() => User, (user: User) => user.role, { lazy: true })
  users: Promise<User[]>;
}
