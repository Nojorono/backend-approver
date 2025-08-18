import { Logger } from '@nestjs/common';

export interface InfobipErrorInfo {
  status?: number;
  message: string;
  details?: any;
  retryable: boolean;
  category: 'validation' | 'authentication' | 'network' | 'service' | 'unknown';
}

export class InfobipErrorHandler {
  private static readonly logger = new Logger(InfobipErrorHandler.name);

  static analyzeError(error: any): InfobipErrorInfo {
    const errorInfo: InfobipErrorInfo = {
      message: 'Unknown error occurred',
      retryable: false,
      category: 'unknown',
    };

    // Extract error details
    if (error.response?.data?.requestError?.serviceException?.text) {
      errorInfo.message = error.response.data.requestError.serviceException.text;
      errorInfo.details = error.response.data;
    } else if (error.response?.data?.message) {
      errorInfo.message = error.response.data.message;
      errorInfo.details = error.response.data;
    } else if (error.message) {
      errorInfo.message = error.message;
    }

    // Set status code
    if (error.response?.status) {
      errorInfo.status = error.response.status;
    }

    // Categorize and determine retryability
    if (error.response?.status) {
      switch (error.response.status) {
        case 400:
          errorInfo.category = 'validation';
          errorInfo.retryable = false;
          errorInfo.message = `Bad request - ${errorInfo.message}`;
          break;
        case 401:
          errorInfo.category = 'authentication';
          errorInfo.retryable = false;
          errorInfo.message = `Unauthorized - ${errorInfo.message}`;
          break;
        case 403:
          errorInfo.category = 'authentication';
          errorInfo.retryable = false;
          errorInfo.message = `Forbidden - ${errorInfo.message}`;
          break;
        case 429:
          errorInfo.category = 'service';
          errorInfo.retryable = true;
          errorInfo.message = `Rate limit exceeded - ${errorInfo.message}`;
          break;
        case 500:
          errorInfo.category = 'service';
          errorInfo.retryable = true;
          errorInfo.message = `Internal server error - ${errorInfo.message}`;
          break;
        case 502:
        case 503:
        case 504:
          errorInfo.category = 'service';
          errorInfo.retryable = true;
          errorInfo.message = `Service temporarily unavailable - ${errorInfo.message}`;
          break;
        default:
          errorInfo.category = 'service';
          errorInfo.retryable = error.response.status >= 500;
          errorInfo.message = `HTTP ${error.response.status} - ${error.response.statusText}`;
      }
    } else if (error.code) {
      switch (error.code) {
        case 'ECONNABORTED':
          errorInfo.category = 'network';
          errorInfo.retryable = true;
          errorInfo.message = 'Request timeout - Service is taking too long to respond';
          break;
        case 'ENOTFOUND':
          errorInfo.category = 'network';
          errorInfo.retryable = true;
          errorInfo.message = 'Network error - Cannot reach Infobip service';
          break;
        case 'ECONNREFUSED':
          errorInfo.category = 'network';
          errorInfo.retryable = true;
          errorInfo.message = 'Connection refused - Service is not available';
          break;
        default:
          errorInfo.category = 'network';
          errorInfo.retryable = true;
          errorInfo.message = `Network error (${error.code}) - ${errorInfo.message}`;
      }
    }

    return errorInfo;
  }

  static logError(operation: string, error: any, attempt?: number): void {
    const errorInfo = this.analyzeError(error);
    const attemptInfo = attempt ? ` (Attempt ${attempt})` : '';
    
    this.logger.error(`Infobip ${operation} failed${attemptInfo}:`, {
      operation,
      status: errorInfo.status,
      category: errorInfo.category,
      retryable: errorInfo.retryable,
      message: errorInfo.message,
      details: errorInfo.details,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        timeout: error.config?.timeout,
      },
      stack: error.stack,
    });
  }

  static shouldRetry(error: any): boolean {
    const errorInfo = this.analyzeError(error);
    return errorInfo.retryable;
  }

  static getRetryDelay(attempt: number, baseDelay: number = 1000): number {
    return Math.pow(2, attempt) * baseDelay;
  }

  static formatUserFriendlyMessage(error: any): string {
    const errorInfo = this.analyzeError(error);
    return errorInfo.message;
  }

  static createFallbackResponse(operation: string, error: any): any {
    const errorInfo = this.analyzeError(error);
    
    return {
      success: false,
      error: {
        operation,
        message: errorInfo.message,
        category: errorInfo.category,
        status: errorInfo.status,
        timestamp: new Date().toISOString(),
      },
      data: null,
    };
  }
}
