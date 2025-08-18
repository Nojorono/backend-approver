import { Entity, Column, ManyToOne, JoinColumn, Index, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Role } from './role.entity';
import { BaseEntity } from './base.entity';
import * as bcrypt from 'bcrypt';

@Entity('users')
@Index(['username'], { unique: true })
@Index(['roleId'])
export class User extends BaseEntity {
  @Column({ unique: true, length: 100 })
  username: string;

  @Column({ unique: true, length: 100, nullable: true })
  email: string;

  @Column({ unique: true, length: 100, nullable: true })
  phone: string;

  @Column({ unique: true, length: 100, nullable: true })
  pin: string;

  @Column({ length: 255 })
  password: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ManyToOne(() => Role, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ name: 'role_id', type: 'uuid' })
  roleId: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 12);
  }

  @BeforeInsert()
  @BeforeUpdate()
  async hashPin() {
    this.pin = await bcrypt.hash(this.pin, 12);
  }

  @BeforeInsert()
  @BeforeUpdate()
  async hashPhone() {
    this.phone = await bcrypt.hash(this.phone, 12);
  }

  @BeforeInsert()
  @BeforeUpdate()
  async hashEmail() {
    this.email = await bcrypt.hash(this.email, 12);
  }
}
