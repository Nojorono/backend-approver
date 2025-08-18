import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { getInfobipConfig, INFOBIP_ENDPOINTS } from '../../core/config/infobip.config';

export interface OAuthTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export interface IBSSOTokenResponse {
  token: string;
  expiresAt: string;
}

export type AuthMethod = 'api_key' | 'basic_auth' | 'oauth2' | 'ibssso';

@Injectable()
export class InfobipAuthService {
  private readonly logger = new Logger(InfobipAuthService.name);
  private readonly config: ReturnType<typeof getInfobipConfig>;
  private httpClient: AxiosInstance;
  private oauthToken: string | null = null;
  private oauthExpiresAt: number | null = null;
  private ibssoToken: string | null = null;
  private ibssoExpiresAt: number | null = null;

  constructor(private configService: ConfigService) {
    this.config = getInfobipConfig(configService);
    this.initializeHttpClient();
  }

  private initializeHttpClient(): void {
    this.httpClient = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.httpClient.interceptors.request.use(
      (config) => {
        this.logger.debug(`Making request to: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        this.logger.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    this.httpClient.interceptors.response.use(
      (response) => {
        this.logger.debug(`Response received: ${response.status} ${response.statusText}`);
        return response;
      },
      (error) => {
        this.logger.error('Response error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  async getAuthenticatedClient(authMethod: AuthMethod = 'oauth2'): Promise<AxiosInstance> {
    const client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    switch (authMethod) {
      case 'oauth2':
        const oauthToken = await this.getOAuthToken();
        client.defaults.headers.Authorization = `Bearer ${oauthToken}`;
        break;

      case 'api_key':
        if (!this.config.apiKey) {
          throw new Error('Infobip API key is required for API key authentication');
        }
        client.defaults.headers.Authorization = `App ${this.config.apiKey}`;
        break;

      case 'basic_auth':
        if (!this.config.username || !this.config.password) {
          throw new Error('Infobip username and password are required for basic authentication');
        }
        const credentials = Buffer.from(`${this.config.username}:${this.config.password}`).toString('base64');
        client.defaults.headers.Authorization = `Basic ${credentials}`;
        break;

      case 'ibssso':
        const ibssoToken = await this.getIBSSOToken();
        client.defaults.headers.Authorization = `IBSSO ${ibssoToken}`;
        break;

      default:
        throw new Error(`Unsupported authentication method: ${authMethod}`);
    }

    return client;
  }

  async getOAuthToken(): Promise<string> {
    if (this.oauthToken && this.oauthExpiresAt && Date.now() < this.oauthExpiresAt) {
      return this.oauthToken;
    }

    try {
      this.logger.log('Requesting OAuth2 token...');
      
      const response = await this.httpClient.post<OAuthTokenResponse>(
        INFOBIP_ENDPOINTS.AUTH.OAUTH_TOKEN,
        {
          client_id: this.config.username,
          client_secret: this.config.password,
          grant_type: 'client_credentials',
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.oauthToken = response.data.access_token;
      this.oauthExpiresAt = Date.now() + (response.data.expires_in * 1000) - 60000; // Expire 1 minute early

      this.logger.log('OAuth2 token obtained successfully');
      return this.oauthToken;
    } catch (error) {
      this.logger.error('Failed to obtain OAuth2 token:', error);
      throw new Error('Failed to obtain OAuth2 token');
    }
  }

  async getIBSSOToken(): Promise<string> {
    if (this.ibssoToken && this.ibssoExpiresAt && Date.now() < this.ibssoExpiresAt) {
      return this.ibssoToken;
    }

    try {
      this.logger.log('Requesting IBSSO token...');
      
      const response = await this.httpClient.post<IBSSOTokenResponse>(
        INFOBIP_ENDPOINTS.AUTH.IBSSO_SESSION,
        {
          username: this.config.username,
          password: this.config.password,
        }
      );

      this.ibssoToken = response.data.token;
      this.ibssoExpiresAt = new Date(response.data.expiresAt).getTime() - 60000; // Expire 1 minute early

      this.logger.log('IBSSO token obtained successfully');
      return this.ibssoToken;
    } catch (error) {
      this.logger.error('Failed to obtain IBSSO token:', error);
      throw new Error('Failed to obtain IBSSO token');
    }
  }

  async destroyIBSSOSession(): Promise<void> {
    if (!this.ibssoToken) {
      return;
    }

    try {
      await this.httpClient.delete(INFOBIP_ENDPOINTS.AUTH.IBSSO_SESSION, {
        headers: {
          Authorization: `IBSSO ${this.ibssoToken}`,
        },
      });

      this.ibssoToken = null;
      this.ibssoExpiresAt = null;
      this.logger.log('IBSSO session destroyed successfully');
    } catch (error) {
      this.logger.error('Failed to destroy IBSSO session:', error);
    }
  }

  clearTokens(): void {
    this.oauthToken = null;
    this.oauthExpiresAt = null;
    this.ibssoToken = null;
    this.ibssoExpiresAt = null;
    this.logger.log('All tokens cleared');
  }

  hasApiKey(): boolean {
    return !!this.config.apiKey;
  }
}
