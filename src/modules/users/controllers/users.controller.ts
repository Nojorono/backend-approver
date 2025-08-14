import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { UserRolesService } from '../services/user-roles.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { AssignRolesDto } from '../dto/assign-roles.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { ApiResponseDto } from '@/common/dto/api-response.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/modules/auth/entities/user.entity';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userRolesService: UserRolesService,
  ) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get all users with pagination (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: ApiResponseDto,
  })
  async findAll(@Query() paginationDto: PaginationDto): Promise<ApiResponseDto<any>> {
    const result = await this.usersService.findAll(paginationDto);
    return new ApiResponseDto(true, 'Users retrieved successfully', result);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    type: ApiResponseDto,
  })
  async getProfile(@CurrentUser() user: User): Promise<ApiResponseDto<any>> {
    const result = await this.usersService.findOne(user.id);
    return new ApiResponseDto(true, 'Profile retrieved successfully', result);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string): Promise<ApiResponseDto<any>> {
    const result = await this.usersService.findOne(id);
    return new ApiResponseDto(true, 'User retrieved successfully', result);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: ApiResponseDto,
  })
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<ApiResponseDto<any>> {
    const result = await this.usersService.updateProfile(user.id, updateProfileDto);
    return new ApiResponseDto(true, 'Profile updated successfully', result);
  }

  @Put(':id/deactivate')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Deactivate user (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User deactivated successfully',
    type: ApiResponseDto,
  })
  async deactivateUser(@Param('id') id: string): Promise<ApiResponseDto<any>> {
    const result = await this.usersService.deactivateUser(id);
    return new ApiResponseDto(true, 'User deactivated successfully', result);
  }

  @Get(':id/roles')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get user roles (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User roles retrieved successfully',
    type: ApiResponseDto,
  })
  async getUserRoles(@Param('id') id: string): Promise<ApiResponseDto<any>> {
    const result = await this.userRolesService.getUserRoles(id);
    return new ApiResponseDto(true, 'User roles retrieved successfully', result);
  }

  @Post(':id/roles')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Assign roles to user (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Roles assigned successfully',
    type: ApiResponseDto,
  })
  async assignRoles(
    @Param('id') id: string,
    @Body() assignRolesDto: AssignRolesDto,
  ): Promise<ApiResponseDto<any>> {
    const result = await this.userRolesService.assignRolesToUser(id, assignRolesDto.roleIds);
    return new ApiResponseDto(true, 'Roles assigned successfully', result);
  }

  @Post(':id/roles/:roleId')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Add role to user (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Role added successfully',
    type: ApiResponseDto,
  })
  async addRole(
    @Param('id') id: string,
    @Param('roleId') roleId: string,
  ): Promise<ApiResponseDto<any>> {
    const result = await this.userRolesService.addRoleToUser(id, roleId);
    return new ApiResponseDto(true, 'Role added successfully', result);
  }

  @Delete(':id/roles/:roleId')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Remove role from user (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Role removed successfully',
    type: ApiResponseDto,
  })
  async removeRole(
    @Param('id') id: string,
    @Param('roleId') roleId: string,
  ): Promise<ApiResponseDto<any>> {
    const result = await this.userRolesService.removeRoleFromUser(id, roleId);
    return new ApiResponseDto(true, 'Role removed successfully', result);
  }
}
