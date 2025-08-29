import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { VerifyPinDto } from './dto/verify-pin.dto';
import { SetPinDto } from './dto/set-pin.dto';
import { User } from '../core/domain/entities/user.entity';
import { Public } from '../core/decorators/public.decorator';

@ApiTags('User')
@Controller('user')
@ApiBearerAuth('JWT-auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new User' })
  @ApiResponse({
    status: 201,
    description: 'The User has been successfully created.',
    type: User,
  })
  @ApiResponse({
    status: 409,
    description: 'User with this code already exists.',
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all Users' })
  @ApiResponse({ status: 200, description: 'Return all Users.', type: [User] })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a User by id' })
  @ApiResponse({ status: 200, description: 'Return the User.', type: User })
  @ApiResponse({ status: 404, description: 'User not found.' })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a User' })
  @ApiResponse({
    status: 200,
    description: 'The User has been successfully updated.',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({
    status: 409,
    description: 'User with this code already exists.',
  })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a User' })
  @ApiResponse({
    status: 200,
    description: 'The User has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Public()
  @Post('verify-pin/:id')
  @ApiOperation({ summary: 'Verify PIN code for a user' })
  @ApiResponse({ 
    status: 200, 
    description: 'PIN code verified successfully.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'PIN verification successful' },
        token: { type: 'string', description: 'JWT token for authentication' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'User ID' },
            username: { type: 'string', description: 'Username' },
            role: { type: 'object', description: 'User role information' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid PIN code or user has no PIN set.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  verifyPin(@Param('id') id: string, @Body() verifyPinDto: VerifyPinDto) {
    return this.userService.verifyPin(id, verifyPinDto);
  }

  @Public()
  @Post('verify-token')
  @ApiOperation({ summary: 'Verify JWT token validity' })
  @ApiResponse({ 
    status: 200, 
    description: 'Token verification result.',
    schema: {
      type: 'object',
      properties: {
        valid: { type: 'boolean', description: 'Whether the token is valid' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'User ID' },
            username: { type: 'string', description: 'Username' },
            role: { type: 'object', description: 'User role information' }
          }
        }
      }
    }
  })
  verifyToken(@Body() body: { token: string }) {
    return this.userService.verifyToken(body.token);
  }

  @Post('set-pin/:id')
  @ApiOperation({ summary: 'Set or update PIN code for a user' })
  @ApiResponse({ 
    status: 200, 
    description: 'PIN has been set successfully.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'PIN has been set successfully' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid PIN format.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  setPin(@Param('id') id: string, @Body() setPinDto: SetPinDto) {
    return this.userService.setPin(id, setPinDto);
  }

  @Get('role/:roleName')
  @ApiOperation({ summary: 'Get all users by role name' })
  @ApiResponse({ status: 200, description: 'Return all users with specified role.', type: [User] })
  @ApiParam({ name: 'roleName', description: 'Role name (e.g., admin, approver, user)' })
  findByRole(@Param('roleName') roleName: string) {
    return this.userService.findByRole(roleName);
  }

  @Get('decrypt/:id')
  @ApiOperation({ summary: 'Decrypt PIN code for a user' })
  @ApiResponse({ status: 200, description: 'Return decrypted PIN code.', type: String })
  @ApiResponse({ status: 404, description: 'User not found.' })
  decryptUser(@Param('id') id: string) {
    return this.userService.decryptUser(id);
  }

  @Post('reset-pin/:id')
  @ApiOperation({ summary: 'Reset PIN code for a user' })
  @ApiResponse({ status: 200, description: 'PIN has been reset successfully.', type: String })
  @ApiResponse({ status: 404, description: 'User not found.' })
  resetPin(@Param('id') id: string) {
    return this.userService.resetPin(id);
  }
}
