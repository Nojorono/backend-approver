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
import { MenusService } from '../services/menus.service';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { UpdateMenuDto } from '../dto/update-menu.dto';
import { UserMenuDto } from '../dto/user-menu.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { ApiResponseDto } from '@/common/dto/api-response.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/modules/auth/entities/user.entity';

@ApiTags('Menus')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Get('user')
  @ApiOperation({ summary: 'Get user menus based on roles' })
  @ApiResponse({
    status: 200,
    description: 'User menus retrieved successfully',
    type: ApiResponseDto<UserMenuDto[]>,
  })
  async getUserMenus(@CurrentUser() user: User): Promise<ApiResponseDto<UserMenuDto[]>> {
    const userRoleIds = user.roles.map(role => role.id);
    const result = await this.menusService.getUserMenus(userRoleIds);
    return new ApiResponseDto(true, 'User menus retrieved successfully', result);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get menu tree structure' })
  @ApiResponse({
    status: 200,
    description: 'Menu tree retrieved successfully',
    type: ApiResponseDto,
  })
  async getMenuTree(): Promise<ApiResponseDto<any>> {
    const result = await this.menusService.getMenuTree();
    return new ApiResponseDto(true, 'Menu tree retrieved successfully', result);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get all menus with pagination (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Menus retrieved successfully',
    type: ApiResponseDto,
  })
  async findAll(@Query() paginationDto: PaginationDto): Promise<ApiResponseDto<any>> {
    const result = await this.menusService.findAll(paginationDto);
    return new ApiResponseDto(true, 'Menus retrieved successfully', result);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get menu by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Menu retrieved successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  async findOne(@Param('id') id: string): Promise<ApiResponseDto<any>> {
    const result = await this.menusService.findOne(id);
    return new ApiResponseDto(true, 'Menu retrieved successfully', result);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create new menu (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Menu created successfully',
    type: ApiResponseDto,
  })
  async create(@Body() createMenuDto: CreateMenuDto): Promise<ApiResponseDto<any>> {
    const result = await this.menusService.create(createMenuDto);
    return new ApiResponseDto(true, 'Menu created successfully', result);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update menu (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Menu updated successfully',
    type: ApiResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateMenuDto: UpdateMenuDto,
  ): Promise<ApiResponseDto<any>> {
    const result = await this.menusService.update(id, updateMenuDto);
    return new ApiResponseDto(true, 'Menu updated successfully', result);
  }

  @Put(':id/toggle')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Toggle menu active status (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Menu status toggled successfully',
    type: ApiResponseDto,
  })
  async toggleActive(@Param('id') id: string): Promise<ApiResponseDto<any>> {
    const result = await this.menusService.toggleActive(id);
    return new ApiResponseDto(true, 'Menu status toggled successfully', result);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete menu (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Menu deleted successfully',
    type: ApiResponseDto,
  })
  async remove(@Param('id') id: string): Promise<ApiResponseDto<any>> {
    const result = await this.menusService.remove(id);
    return new ApiResponseDto(true, 'Menu deleted successfully', result);
  }
}
