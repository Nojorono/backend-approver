import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ApprovalRequest } from '../core/domain/entities/approval-request.entity';
import { NotificationTrack, NotificationStatus } from '../core/domain/entities/notification-track.entity';
import { User } from '../core/domain/entities/user.entity';
import { ApprovalProcess, ApprovalProcessStatus } from '../core/domain/entities/approval-process.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(ApprovalRequest)
    private readonly approvalRequestRepository: Repository<ApprovalRequest>,
    @InjectRepository(NotificationTrack)
    private readonly notificationTrackRepository: Repository<NotificationTrack>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ApprovalProcess)
    private readonly approvalProcessRepository: Repository<ApprovalProcess>,
  ) {}

  private getDateRange(period: 'daily' | 'weekly' | 'monthly'): { start: Date; end: Date } {
    const now = new Date();
    const end = new Date(now);
    let start = new Date(now);

    switch (period) {
      case 'daily':
        start.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        start.setDate(now.getDate() - 7);
        break;
      case 'monthly':
        start.setMonth(now.getMonth() - 1);
        break;
    }

    return { start, end };
  }

  async getDashboardData(period: 'daily' | 'weekly' | 'monthly' = 'daily') {
    const { start, end } = this.getDateRange(period);

    const [
      approvalRequests,
      notificationStats,
      userStats,
      approvalProcessStats,
      statusDistribution,
      notificationDeliveryStats,
      recentActivity
    ] = await Promise.all([
      this.getApprovalRequestStats(start, end),
      this.getNotificationStats(start, end),
      this.getUserStats(),
      this.getApprovalProcessStats(start, end),
      this.getStatusDistribution(start, end),
      this.getNotificationDeliveryStats(start, end),
      this.getRecentActivity(start, end)
    ]);

    return {
      period,
      dateRange: { start, end },
      summary: {
        totalApprovalRequests: approvalRequests.total,
        totalUsers: userStats.total,
        totalNotifications: notificationStats.total,
        approvalRate: approvalProcessStats.approvalRate,
        averageResponseTime: approvalProcessStats.averageResponseTime,
      },
      approvalRequests,
      notifications: notificationStats,
      users: userStats,
      approvalProcesses: approvalProcessStats,
      statusDistribution,
      notificationDelivery: notificationDeliveryStats,
      recentActivity,
    };
  }

  private async getApprovalRequestStats(start: Date, end: Date) {
    const total = await this.approvalRequestRepository.count({
      where: {
        createdAt: Between(start, end),
      },
    });

    const byStatus = await this.approvalRequestRepository
      .createQueryBuilder('ar')
      .select('ar.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('ar.createdAt BETWEEN :start AND :end', { start, end })
      .groupBy('ar.status')
      .getRawMany();

    const dailyTrend = await this.approvalRequestRepository
      .createQueryBuilder('ar')
      .select('DATE(ar.createdAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('ar.createdAt BETWEEN :start AND :end', { start, end })
      .groupBy('DATE(ar.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = parseInt(item.count);
        return acc;
      }, {}),
      dailyTrend,
    };
  }

  private async getNotificationStats(start: Date, end: Date) {
    const total = await this.notificationTrackRepository.count({
      where: {
        createdAt: Between(start, end),
      },
    });

    const byType = await this.notificationTrackRepository
      .createQueryBuilder('nt')
      .select('nt.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('nt.createdAt BETWEEN :start AND :end', { start, end })
      .groupBy('nt.type')
      .getRawMany();

    const byStatus = await this.notificationTrackRepository
      .createQueryBuilder('nt')
      .select('nt.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('nt.createdAt BETWEEN :start AND :end', { start, end })
      .groupBy('nt.status')
      .getRawMany();

    return {
      total,
      byType: byType.reduce((acc, item) => {
        acc[item.type] = parseInt(item.count);
        return acc;
      }, {}),
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = parseInt(item.count);
        return acc;
      }, {}),
    };
  }

  private async getUserStats() {
    const total = await this.userRepository.count();
    
    const byRole = await this.userRepository
      .createQueryBuilder('u')
      .leftJoin('u.role', 'r')
      .select('r.name', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('r.name')
      .getRawMany();

    const activeUsers = await this.userRepository.count({
      where: { isActive: true },
    });

    return {
      total,
      active: activeUsers,
      inactive: total - activeUsers,
      byRole: byRole.reduce((acc, item) => {
        acc[item.role] = parseInt(item.count);
        return acc;
      }, {}),
    };
  }

  private async getApprovalProcessStats(start: Date, end: Date) {
    const total = await this.approvalProcessRepository.count({
      where: {
        createdAt: Between(start, end),
      },
    });

    const approved = await this.approvalProcessRepository.count({
      where: {
        status: ApprovalProcessStatus.APPROVED,
        createdAt: Between(start, end),
      },
    });

    const rejected = await this.approvalProcessRepository.count({
      where: {
        status: ApprovalProcessStatus.REJECTED,
        createdAt: Between(start, end),
      },
    });

    const averageResponseTime = await this.approvalProcessRepository
      .createQueryBuilder('ap')
      .select('AVG(EXTRACT(EPOCH FROM (ap.updatedAt - ap.createdAt))/3600)', 'avgHours')
      .where('ap.createdAt BETWEEN :start AND :end', { start, end })
      .andWhere('ap.status IN (:...statuses)', { statuses: [ApprovalProcessStatus.APPROVED, ApprovalProcessStatus.REJECTED] })
      .getRawOne();

    return {
      total,
      approved,
      rejected,
      pending: total - approved - rejected,
      approvalRate: total > 0 ? (approved / total) * 100 : 0,
      rejectionRate: total > 0 ? (rejected / total) * 100 : 0,
      averageResponseTime: averageResponseTime?.avgHours || 0,
    };
  }

  private async getStatusDistribution(start: Date, end: Date) {
    const distribution = await this.approvalRequestRepository
      .createQueryBuilder('ar')
      .select('ar.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('ar.createdAt BETWEEN :start AND :end', { start, end })
      .groupBy('ar.status')
      .getRawMany();

    return distribution.reduce((acc, item) => {
      acc[item.status] = parseInt(item.count);
      return acc;
    }, {});
  }

  private async getNotificationDeliveryStats(start: Date, end: Date) {
    const total = await this.notificationTrackRepository.count({
      where: {
        createdAt: Between(start, end),
      },
    });

    const delivered = await this.notificationTrackRepository.count({
      where: {
        status: NotificationStatus.DELIVERED,
        createdAt: Between(start, end),
      },
    });

    const failed = await this.notificationTrackRepository.count({
      where: {
        status: NotificationStatus.FAILED,
        createdAt: Between(start, end),
      },
    });

    const pending = await this.notificationTrackRepository.count({
      where: {
        status: NotificationStatus.PENDING,
        createdAt: Between(start, end),
      },
    });

    return {
      total,
      delivered,
      failed,
      pending,
      deliveryRate: total > 0 ? (delivered / total) * 100 : 0,
      failureRate: total > 0 ? (failed / total) * 100 : 0,
    };
  }

  private async getRecentActivity(start: Date, end: Date) {
    const recentApprovalRequests = await this.approvalRequestRepository.find({
      where: {
        createdAt: Between(start, end),
      },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    const recentNotifications = await this.notificationTrackRepository.find({
      where: {
        createdAt: Between(start, end),
      },
      relations: ['approvalRequest'],
      order: { createdAt: 'DESC' },
      take: 10,
    });

    const recentApprovalProcesses = await this.approvalProcessRepository.find({
      where: {
        createdAt: Between(start, end),
      },
      relations: ['approvalRequest'],
      order: { createdAt: 'DESC' },
      take: 10,
    });

    const approvalRequestsWithApprovers = await Promise.all(
      recentApprovalRequests.map(async (approvalRequest) => {
        if (approvalRequest.approverIds && approvalRequest.approverIds.length > 0) {
          const approvers = await this.userRepository.find({
            where: approvalRequest.approverIds.map(id => ({ id })),
            relations: ['role']
          });
        }
        return approvalRequest;
      })
    );

    return {
      approvalRequests: approvalRequestsWithApprovers,
      notifications: recentNotifications,
      approvalProcesses: recentApprovalProcesses,
    };
  }

  async getDailyStats() {
    return this.getDashboardData('daily');
  }

  async getWeeklyStats() {
    return this.getDashboardData('weekly');
  }

  async getMonthlyStats() {
    return this.getDashboardData('monthly');
  }
}
