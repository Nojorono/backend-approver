import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardResponseDto, DashboardSummaryDto } from './dto/dashboard-response.dto';

@ApiTags('Dashboard')
@Controller('dashboard')
@ApiBearerAuth('JWT-auth')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get dashboard data with specified period' })
  @ApiQuery({ 
    name: 'period', 
    required: false, 
    enum: ['daily', 'weekly', 'monthly'], 
    description: 'Time period for dashboard data (default: daily)' 
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully.',
    type: DashboardResponseDto
  })
  getDashboardData(@Query('period') period: 'daily' | 'weekly' | 'monthly' = 'daily') {
    return this.dashboardService.getDashboardData(period);
  }
}
