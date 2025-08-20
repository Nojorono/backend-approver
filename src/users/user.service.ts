import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { VerifyPinDto } from './dto/verify-pin.dto';
import { SetPinDto } from './dto/set-pin.dto';
import { User } from '../core/domain/entities/user.entity';
import { AuthService } from '../infrastructure/services/auth.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    private readonly repository: UserRepository,
    private readonly authService: AuthService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.repository.findByUsername(
      createUserDto.username,
    );
    if (existingUser) {
      throw new ConflictException(
        `User with username ${createUserDto.username} already exists`,
      );
    }
    return await this.repository.create(createUserDto);
  }

  async findAll(): Promise<User[]> {
    return await this.repository.findAll();
  }

  async findByRole(roleName: string): Promise<User[]> {
    return await this.repository.findByRoleName(roleName);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.repository.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUser = await this.repository.findByUsername(
        updateUserDto.username,
      );
      if (existingUser) {
        throw new ConflictException(
          `User with username ${updateUserDto.username} already exists`,
        );
      }
    }
    const updatedUser = await this.repository.update(id, updateUserDto);
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repository.remove(id);
  }

  async verifyPin(id: string, verifyPinDto: VerifyPinDto): Promise<{ 
    success: boolean; 
    message: string; 
    token: string;
    user: {
      id: string;
      username: string;
      role: any;
    };
  }> {
    const user = await this.findOne(id);
    
    if (!user.pin) {
      throw new BadRequestException('User does not have a PIN set');
    }

    const isPinValid = await bcrypt.compare(verifyPinDto.pin, user.pin);
    
    if (!isPinValid) {
      throw new BadRequestException('Invalid PIN code');
    }

    const token = await this.authService.generateToken(user);

    return {
      success: true,
      message: 'PIN verification successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }

  async setPin(id: string, setPinDto: SetPinDto): Promise<{ success: boolean; message: string }> {
    const user = await this.findOne(id);
    
    const hashedPin = await bcrypt.hash(setPinDto.pin, 12);
    
    await this.repository.update(id, { pin: hashedPin });
    
    return {
      success: true,
      message: 'PIN has been set successfully',
    };
  }

  async verifyToken(token: string): Promise<{ 
    valid: boolean; 
    user?: {
      id: string;
      username: string;
      role: any;
    };
  }> {
    try {
      const payload = await this.authService.verifyToken(token);
      const user = await this.findOne(payload.sub);
      
      if (!user) {
        return { valid: false };
      }

      return {
        valid: true,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      };
    } catch (error) {
      return { valid: false };
    }
  }
}
