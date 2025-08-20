import { ApiProperty } from '@nestjs/swagger';

export class DateRangeDto {
  @ApiProperty({ description: 'Start date of the period' })
  start: Date;

  @ApiProperty({ description: 'End date of the period' })
  end: Date;
}

export class DashboardSummaryDto {
  @ApiProperty({ description: 'Total number of approval requests' })
  totalApprovalRequests: number;

  @ApiProperty({ description: 'Total number of users' })
  totalUsers: number;

  @ApiProperty({ description: 'Total number of notifications' })
  totalNotifications: number;

  @ApiProperty({ description: 'Approval rate percentage' })
  approvalRate: number;

  @ApiProperty({ description: 'Average response time in hours' })
  averageResponseTime: number;
}

export class ApprovalRequestStatsDto {
  @ApiProperty({ description: 'Total number of approval requests' })
  total: number;

  @ApiProperty({ description: 'Approval requests grouped by status' })
  byStatus: Record<string, number>;

  @ApiProperty({ description: 'Daily trend data' })
  dailyTrend: Array<{ date: string; count: number }>;
}

export class NotificationStatsDto {
  @ApiProperty({ description: 'Total number of notifications' })
  total: number;

  @ApiProperty({ description: 'Notifications grouped by type' })
  byType: Record<string, number>;

  @ApiProperty({ description: 'Notifications grouped by status' })
  byStatus: Record<string, number>;
}

export class UserStatsDto {
  @ApiProperty({ description: 'Total number of users' })
  total: number;

  @ApiProperty({ description: 'Number of active users' })
  active: number;

  @ApiProperty({ description: 'Number of inactive users' })
  inactive: number;

  @ApiProperty({ description: 'Users grouped by role' })
  byRole: Record<string, number>;
}

export class ApprovalProcessStatsDto {
  @ApiProperty({ description: 'Total number of approval processes' })
  total: number;

  @ApiProperty({ description: 'Number of approved processes' })
  approved: number;

  @ApiProperty({ description: 'Number of rejected processes' })
  rejected: number;

  @ApiProperty({ description: 'Number of pending processes' })
  pending: number;

  @ApiProperty({ description: 'Approval rate percentage' })
  approvalRate: number;

  @ApiProperty({ description: 'Rejection rate percentage' })
  rejectionRate: number;

  @ApiProperty({ description: 'Average response time in hours' })
  averageResponseTime: number;
}

export class NotificationDeliveryStatsDto {
  @ApiProperty({ description: 'Total number of notifications' })
  total: number;

  @ApiProperty({ description: 'Number of delivered notifications' })
  delivered: number;

  @ApiProperty({ description: 'Number of failed notifications' })
  failed: number;

  @ApiProperty({ description: 'Number of pending notifications' })
  pending: number;

  @ApiProperty({ description: 'Delivery rate percentage' })
  deliveryRate: number;

  @ApiProperty({ description: 'Failure rate percentage' })
  failureRate: number;
}

export class RecentActivityDto {
  @ApiProperty({ description: 'Recent approval requests with approvers' })
  approvalRequests: Array<{
    id: string;
    code: string;
    subject: string;
    status: string;
    approverIds: string[];
    approvers: Array<{
      id: string;
      username: string;
      role: any;
    }>;
    createdAt: Date;
  }>;

  @ApiProperty({ description: 'Recent notifications' })
  notifications: any[];

  @ApiProperty({ description: 'Recent approval processes' })
  approvalProcesses: any[];
}

export class DashboardResponseDto {
  @ApiProperty({ enum: ['daily', 'weekly', 'monthly'], description: 'Time period' })
  period: string;

  @ApiProperty({ description: 'Date range for the data' })
  dateRange: DateRangeDto;

  @ApiProperty({ description: 'Summary statistics' })
  summary: DashboardSummaryDto;

  @ApiProperty({ description: 'Approval request statistics' })
  approvalRequests: ApprovalRequestStatsDto;

  @ApiProperty({ description: 'Notification statistics' })
  notifications: NotificationStatsDto;

  @ApiProperty({ description: 'User statistics' })
  users: UserStatsDto;

  @ApiProperty({ description: 'Approval process statistics' })
  approvalProcesses: ApprovalProcessStatsDto;

  @ApiProperty({ description: 'Status distribution' })
  statusDistribution: Record<string, number>;

  @ApiProperty({ description: 'Notification delivery statistics' })
  notificationDelivery: NotificationDeliveryStatsDto;

  @ApiProperty({ description: 'Recent activity' })
  recentActivity: RecentActivityDto;
}
