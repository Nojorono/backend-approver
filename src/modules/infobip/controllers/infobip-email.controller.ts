import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Query, 
  Param, 
  HttpCode, 
  HttpStatus,
  UseGuards,
  Request
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InfobipEmailService } from '../services/infobip-email.service';
import { InfobipAuthService, AuthMethod } from '../services/infobip-auth.service';
import { 
  SendEmailDto, 
  ValidateEmailDto, 
  EmailValidationResponseDto, 
  EmailReportDto, 
  EmailReportsQueryDto 
} from '../dto/email.dto';
import { ApiResponseDto } from '@/common/dto/api-response.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';

@ApiTags('Infobip Email')
@Controller('infobip/email')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class InfobipEmailController {
  constructor(
    private readonly emailService: InfobipEmailService,
    private readonly authService: InfobipAuthService,
  ) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'requestor', 'approver')
  @ApiOperation({ summary: 'Send email via Infobip' })
  @ApiResponse({
    status: 200,
    description: 'Email sent successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async sendEmail(
    @Body() emailData: SendEmailDto,
    @Request() req: any
  ): Promise<ApiResponseDto<any>> {
    // Use OAuth2 as primary authentication method
    const authMethod = 'oauth2';
    const result = await this.emailService.sendEmail(emailData, authMethod);
    return new ApiResponseDto(true, 'Email sent successfully', result);
  }

  @Post('send/bulk')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Send bulk emails via Infobip' })
  @ApiResponse({
    status: 200,
    description: 'Bulk emails sent successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async sendBulkEmails(
    @Body() emails: SendEmailDto[],
    @Request() req: any
  ): Promise<ApiResponseDto<any>> {
    // Use OAuth2 as primary authentication method
    const authMethod = 'oauth2';
    const result = await this.emailService.sendBulkEmails(emails, authMethod);
    return new ApiResponseDto(true, 'Bulk emails sent successfully', result);
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'audit')
  @ApiOperation({ summary: 'Validate email address via Infobip' })
  @ApiResponse({
    status: 200,
    description: 'Email validation completed',
    type: ApiResponseDto<EmailValidationResponseDto>,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async validateEmail(
    @Body() emailData: ValidateEmailDto,
    @Request() req: any
  ): Promise<ApiResponseDto<EmailValidationResponseDto>> {
    // Use OAuth2 as primary authentication method
    const authMethod = 'oauth2';
    const result = await this.emailService.validateEmail(emailData, authMethod);
    return new ApiResponseDto(true, 'Email validation completed', result);
  }

  @Get('reports')
  @Roles('admin', 'audit')
  @ApiOperation({ summary: 'Get email reports' })
  @ApiResponse({
    status: 200,
    description: 'Email reports retrieved successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'from', required: false, type: String })
  @ApiQuery({ name: 'to', required: false, type: String })
  @ApiQuery({ name: 'email', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getEmailReports(
    @Query() query: EmailReportsQueryDto,
    @Request() req: any
  ): Promise<ApiResponseDto<any>> {
    // Use OAuth2 as primary authentication method
    const authMethod = 'oauth2';
    const result = await this.emailService.getEmailReports(query, authMethod);
    return new ApiResponseDto(true, 'Email reports retrieved successfully', result);
  }

  @Get('reports/:messageId')
  @Roles('admin', 'audit')
  @ApiOperation({ summary: 'Get email report by message ID' })
  @ApiResponse({
    status: 200,
    description: 'Email report retrieved successfully',
    type: ApiResponseDto<EmailReportDto>,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async getEmailReportById(
    @Param('messageId') messageId: string,
    @Request() req: any
  ): Promise<ApiResponseDto<EmailReportDto>> {
    // Use OAuth2 as primary authentication method
    const authMethod = 'oauth2';
    const result = await this.emailService.getEmailReportById(messageId, authMethod);
    return new ApiResponseDto(true, 'Email report retrieved successfully', result);
  }

  @Get('templates')
  @Roles('admin', 'audit', 'requestor', 'approver')
  @ApiOperation({ summary: 'Get available email templates' })
  @ApiResponse({
    status: 200,
    description: 'Email templates retrieved successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getEmailTemplates(
    @Request() req: any
  ): Promise<ApiResponseDto<any>> {
    // Use OAuth2 as primary authentication method
    const authMethod = 'oauth2';
    const result = await this.emailService.getEmailTemplates(authMethod);
    return new ApiResponseDto(true, 'Email templates retrieved successfully', result);
  }
}
