import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../core/domain/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.repository.create(createUserDto);
    return await this.repository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.repository.find();
  }

  async findDecryptedUser(id: string): Promise<User> {
    const user = await this.repository.findOne({ where: { id: id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.email = user.getUnhashedEmail() || '';
    user.phone = user.getUnhashedPhone() || '';
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const findAll = await this.repository.find();
    const user = findAll.find(user => user.getUnhashedEmail() === email);
    if (!user) {
      return null;
    }
    return user;
  }

  async findByPhone(phone: string): Promise<User | null> {
    const findAll = await this.repository.find();
    const user = findAll.find(user => user.getUnhashedPhone() === phone);
    if (!user) {
      return null;
    }
    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.repository.findOne({
      where: { username: username },
    });
    if (!user) {
      return null;
    }
    return user;
  }

  async findByRoleName(roleName: string): Promise<User[]> {
    return await this.repository.find({
      where: { role: { name: roleName } },
      relations: ['role'],
    });
  }

  async findOne(id: string): Promise<User | null> {
    const user = await this.repository.findOne({ where: { id: id } });
    if (!user) {
      return null;
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    const existing = await this.findOne(id);
    if (!existing) {
      throw new NotFoundException('User not found');
    }
    const preloaded = await this.repository.preload({ id, ...updateUserDto });
    if (!preloaded) {
      throw new NotFoundException('User not found');
    }
    const saved = await this.repository.save(preloaded);
    return saved;
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.repository.delete(id);
  }
}
