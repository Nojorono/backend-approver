import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/modules/auth/entities/user.entity';
import { UserProfile } from '../entities/user-profile.entity';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private userProfileRepository: Repository<UserProfile>,
  ) {}

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
}
