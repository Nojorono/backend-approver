import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from '../services/roles.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { ApiResponseDto } from '@/common/dto/api-response.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';

@ApiTags('Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all roles with pagination (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Roles retrieved successfully',
    type: ApiResponseDto,
  })
  async findAll(@Query() paginationDto: PaginationDto): Promise<ApiResponseDto<any>> {
    const result = await this.rolesService.findAll(paginationDto);
    return new ApiResponseDto(true, 'Roles retrieved successfully', result);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active roles (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Active roles retrieved successfully',
    type: ApiResponseDto,
  })
  async findAllActive(): Promise<ApiResponseDto<any>> {
    const result = await this.rolesService.findAllActive();
    return new ApiResponseDto(true, 'Active roles retrieved successfully', result);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Role retrieved successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async findOne(@Param('id') id: string): Promise<ApiResponseDto<any>> {
    const result = await this.rolesService.findOne(id);
    return new ApiResponseDto(true, 'Role retrieved successfully', result);
  }

  @Post()
  @ApiOperation({ summary: 'Create new role (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Role created successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Role with this name already exists' })
  async create(@Body() createRoleDto: CreateRoleDto): Promise<ApiResponseDto<any>> {
    const result = await this.rolesService.create(createRoleDto);
    return new ApiResponseDto(true, 'Role created successfully', result);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update role (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Role updated successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Role with this name already exists' })
  async update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<ApiResponseDto<any>> {
    const result = await this.rolesService.update(id, updateRoleDto);
    return new ApiResponseDto(true, 'Role updated successfully', result);
  }

  @Put(':id/toggle')
  @ApiOperation({ summary: 'Toggle role active status (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Role status toggled successfully',
    type: ApiResponseDto,
  })
  async toggleActive(@Param('id') id: string): Promise<ApiResponseDto<any>> {
    const result = await this.rolesService.toggleActive(id);
    return new ApiResponseDto(true, 'Role status toggled successfully', result);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete role (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Role deleted successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Cannot delete role that has assigned users' })
  async remove(@Param('id') id: string): Promise<ApiResponseDto<any>> {
    const result = await this.rolesService.remove(id);
    return new ApiResponseDto(true, 'Role deleted successfully', result);
  }
}
