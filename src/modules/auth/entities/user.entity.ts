import { Entity, Column, BeforeInsert, BeforeUpdate, OneToOne, ManyToMany, JoinTable } from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcryptjs';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserProfile } from '../../users/entities/user-profile.entity';
import { Role } from '../../roles/entities/role.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  username?: string;

  @Column({ nullable: true })
  pin?: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'roleId', referencedColumnName: 'id' },
  })
  roles: Role[];

  @OneToOne(() => UserProfile, (profile) => profile.user)
  profile: UserProfile;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  async hashPin() {
    if (this.pin) {
      this.pin = await bcrypt.hash(this.pin, 12);
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  async hashEmail() {
    if (this.email) {
      this.email = await bcrypt.hash(this.email, 12);
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  async hashPhone() {
    if (this.phone) {
      this.phone = await bcrypt.hash(this.phone, 12);
    }
  }

  async validateEmail(email: string): Promise<boolean> {
    return bcrypt.compare(email, this.email);
  }

  async validatePhone(phone: string): Promise<boolean> {
    return bcrypt.compare(phone, this.phone);
  }

  async validatePin(pin: string): Promise<boolean> {
    return bcrypt.compare(pin, this.pin);
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
