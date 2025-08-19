import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Role } from './role.entity';
import { BaseEntity } from './base.entity';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

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

  private static readonly ENCRYPTION_KEY = 'your-secret-key-32-chars-long!!'; // In production, use environment variable
  private static readonly ALGORITHM = 'aes-256-cbc';

  @BeforeInsert()
  @BeforeUpdate()
  async hashEmail() {
    if (this.email && !this.email.startsWith('$2b$')) {
      this.email = this.encrypt(this.email);
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  async hashPhone() {
    if (this.phone && !this.phone.startsWith('$2b$')) {
      this.phone = this.encrypt(this.phone);
    }
  }

  getUnhashedEmail(): string | null {
    if (!this.email) return null;
    try {
      return this.decrypt(this.email);
    } catch {
      return this.email;
    }
  }

  getUnhashedPhone(): string | null {
    if (!this.phone) return null;
    try {
      return this.decrypt(this.phone);
    } catch {
      return this.phone;
    }
  }

  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(User.ENCRYPTION_KEY, 'salt', 32);
    const cipher = crypto.createCipheriv(User.ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  private decrypt(encryptedText: string): string {
    const textParts = encryptedText.split(':');
    const ivHex = textParts.shift();
    if (!ivHex) {
      throw new Error('Invalid encrypted text format');
    }
    const iv = Buffer.from(ivHex, 'hex');
    const encryptedData = textParts.join(':');
    const key = crypto.scryptSync(User.ENCRYPTION_KEY, 'salt', 32);
    const decipher = crypto.createDecipheriv(User.ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
