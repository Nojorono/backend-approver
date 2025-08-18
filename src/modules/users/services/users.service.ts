import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '@/modules/auth/entities/user.entity';
import { UserProfile } from '../entities/user-profile.entity';
import { Role } from '@/modules/roles/entities/role.entity';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private userProfileRepository: Repository<UserProfile>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findOne({
      where: [
        { email: createUserDto.email },
        { username: createUserDto.username },
        { phone: createUserDto.phone }
      ],
    });

    if (existingUser) {
      throw new ConflictException('Email, username, or phone already exists');
    }

    const user = this.userRepository.create({
      email: createUserDto.email,
      username: createUserDto.username,
      phone: createUserDto.phone,
      pin: createUserDto.pin,
      password: createUserDto.password,
      isActive: true,
    });

    const savedUser = await this.userRepository.save(user);

    if (createUserDto.roleIds && createUserDto.roleIds.length > 0) {
      const roles = await this.roleRepository.find({
        where: { id: In(createUserDto.roleIds) }
      });
      if (roles.length > 0) {
        savedUser.roles = roles;
        await this.userRepository.save(savedUser);
      }
    }

    return this.findOne(savedUser.id);
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [users, total] = await this.userRepository.findAndCount({
      skip,
      take: limit,
      relations: ['profile', 'roles'],
      select: ['id', 'email', 'phone', 'isActive', 'createdAt'],
    });

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['profile', 'roles'],
      select: ['id', 'email', 'phone', 'isActive', 'createdAt'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile', 'roles'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateProfileDto.phone) {
      user.phone = updateProfileDto.phone;
    }

    await this.userRepository.save(user);

    let profile = user?.profile;
    if (!profile) {
      profile = this.userProfileRepository.create({ userId });
    }

    Object.assign(profile, {
      avatar: updateProfileDto.avatar,
      phone: updateProfileDto.phone,
      address: updateProfileDto.address,
      bio: updateProfileDto.bio,
      dateOfBirth: updateProfileDto.dateOfBirth ? new Date(updateProfileDto.dateOfBirth) : undefined,
    });

    await this.userProfileRepository.save(profile);

    return this.findOne(userId);
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUser = await this.userRepository.findOne({
        where: { username: updateUserDto.username },
      });
      if (existingUser) {
        throw new ConflictException('Username already exists');
      }
    }

    if (updateUserDto.phone && updateUserDto.phone !== user.phone) {
      const existingUser = await this.userRepository.findOne({
        where: { phone: updateUserDto.phone },
      });
      if (existingUser) {
        throw new ConflictException('Phone already exists');
      }
    }

    Object.assign(user, {
      email: updateUserDto.email,
      username: updateUserDto.username,
      phone: updateUserDto.phone,
      pin: updateUserDto.pin,
      password: updateUserDto.password,
      isActive: updateUserDto.isActive,
    });

    const savedUser = await this.userRepository.save(user);

    if (updateUserDto.roleIds) {
      const roles = await this.roleRepository.find({
        where: { id: In(updateUserDto.roleIds) }
      });
      savedUser.roles = roles;
      await this.userRepository.save(savedUser);
    }

    return this.findOne(savedUser.id);
  }

  async deactivateUser(id: string) {
    const user = await this.userRepository.findOne({ 
      where: { id },
      relations: ['roles'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isActive = false;
    await this.userRepository.save(user);

    return { message: 'User deactivated successfully' };
  }

  async activateUser(id: string) {
    const user = await this.userRepository.findOne({ 
      where: { id },
      relations: ['roles'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isActive = true;
    await this.userRepository.save(user);

    return { message: 'User activated successfully' };
  }
}
