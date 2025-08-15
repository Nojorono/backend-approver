import { DocumentBuilder, SwaggerCustomOptions } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Boilerplat Nest API')
  .setVersion('1.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token (will be cached automatically)',
      in: 'header',
    },
    'JWT-auth',
  )
  .build();

export const swaggerCustomOptions: SwaggerCustomOptions = {
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showRequestHeaders: true,
    docExpansion: 'list',
    defaultModelsExpandDepth: 1,
    defaultModelExpandDepth: 1,
    tryItOutEnabled: true,
    requestInterceptor: (req) => {
      // Enhanced token caching with localStorage
      if (req.headers.Authorization) {
        const token = req.headers.Authorization;
        localStorage.setItem('swagger_token', token);
        localStorage.setItem('swagger_token_timestamp', Date.now().toString());
        
        // Store token expiry time (24 hours from now)
        const expiryTime = Date.now() + (24 * 60 * 60 * 1000);
        localStorage.setItem('swagger_token_expiry', expiryTime.toString());
      }
      return req;
    },
    responseInterceptor: (res) => {
      // Handle token refresh and cleanup
      if (res.status === 401) {
        localStorage.removeItem('swagger_token');
        localStorage.removeItem('swagger_token_timestamp');
        localStorage.removeItem('swagger_token_expiry');
        
        // Show notification to user
        if (typeof window !== 'undefined') {
          alert('Token expired. Please login again.');
        }
      }
      return res;
    },
    onComplete: () => {
      // Auto-load cached token on page load
      if (typeof window !== 'undefined') {
        const cachedToken = localStorage.getItem('swagger_token');
        const tokenExpiry = localStorage.getItem('swagger_token_expiry');
        
        if (cachedToken && tokenExpiry) {
          const now = Date.now();
          const expiry = parseInt(tokenExpiry);
          
          if (now < expiry) {
            // Token is still valid, auto-authorize
            setTimeout(() => {
              const authorizeBtn = document.querySelector('.btn.authorize') as HTMLElement;
              if (authorizeBtn) {
                authorizeBtn.click();
                
                setTimeout(() => {
                  const tokenInput = document.querySelector('input[placeholder*="JWT"]') as HTMLInputElement;
                  if (tokenInput) {
                    tokenInput.value = cachedToken.replace('Bearer ', '');
                    tokenInput.dispatchEvent(new Event('input', { bubbles: true }));
                    
                    const authorizeSubmitBtn = document.querySelector('.auth-btn-wrapper .authorize') as HTMLElement;
                    if (authorizeSubmitBtn) {
                      authorizeSubmitBtn.click();
                    }
                  }
                }, 100);
              }
            }, 500);
          } else {
            // Token expired, clean up
            localStorage.removeItem('swagger_token');
            localStorage.removeItem('swagger_token_timestamp');
            localStorage.removeItem('swagger_token_expiry');
          }
        }
      }
    },
  },
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #3b82f6; font-size: 36px; margin-bottom: 20px; }
    .swagger-ui .info .description { font-size: 14px; line-height: 1.6; margin-bottom: 20px; }
    .swagger-ui .auth-wrapper { background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
    .swagger-ui .btn.authorize { background: #3b82f6; border-color: #3b82f6; border-radius: 6px; }
    .swagger-ui .btn.authorize:hover { background: #2563eb; border-color: #2563eb; }
    .swagger-ui .auth-container { border: 1px solid #e5e7eb; border-radius: 8px; }
    .swagger-ui .opblock-tag { border-bottom: 2px solid #3b82f6; }
    .swagger-ui .opblock.opblock-get { border-color: #3b82f6; }
    .swagger-ui .opblock.opblock-post { border-color: #10b981; }
    .swagger-ui .opblock.opblock-put { border-color: #f59e0b; }
    .swagger-ui .opblock.opblock-delete { border-color: #ef4444; }
    .swagger-ui .opblock-summary-method { border-radius: 4px; }
    .swagger-ui .response-col_status { font-weight: bold; }
    .swagger-ui .response-col_description { font-size: 13px; }
    .swagger-ui .model { font-size: 12px; }
    .swagger-ui .model-title { color: #374151; font-weight: 600; }
    .swagger-ui .parameter__name { font-weight: 600; color: #374151; }
    .swagger-ui .parameter__type { color: #6b7280; }
    .swagger-ui .parameter__required { color: #ef4444; }
    .swagger-ui .parameter__deprecated { color: #f59e0b; }
    .swagger-ui .scheme-container { background: #f9fafb; padding: 10px; border-radius: 6px; }
    .swagger-ui .servers { background: #f0f9ff; padding: 10px; border-radius: 6px; margin-bottom: 20px; }
    .swagger-ui .servers-title { color: #0369a1; font-weight: 600; }
    .swagger-ui .servers select { border: 1px solid #3b82f6; border-radius: 4px; padding: 5px; }
  `,
  customSiteTitle: 'Boilerplat Nest API Documentation',
  customfavIcon: '/favicon.ico',
};
