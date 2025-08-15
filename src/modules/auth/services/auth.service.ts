import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepository.findOne({
      where: { username: loginDto.username },
      relations: ['roles'],
    });

    if (!user || !(await user.validatePassword(loginDto.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const payload = { email: user.email, sub: user.id, roles: user.roles.map(role => role.name) };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        phone: user.phone,
        pin: user.pin,
        roles: user.roles.map(role => role.name),
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.userRepository.findOne({
      where: { username: registerDto.username, email: registerDto.email, phone: registerDto.phone },
    });

    if (existingUser) {
      throw new ConflictException('Username, email, or phone already exists');
    }

    const user = this.userRepository.create(registerDto);
    await this.userRepository.save(user);

    const payload = { email: user.email, sub: user.id, roles: user.roles.map(role => role.name) };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        phone: user.phone,
        pin: user.pin,
        roles: user.roles.map(role => role.name),
      },
    };
  }

  async validateUser(id: string): Promise<User> {
    return this.userRepository.findOne({ 
      where: { id },
      relations: ['roles'],
    });
  }
}
