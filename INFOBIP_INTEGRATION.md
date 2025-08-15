# Infobip Integration Documentation

This document provides comprehensive information about the Infobip integration in the NestJS application, covering email and WhatsApp functionality with multiple authentication methods.

## Table of Contents

1. [Overview](#overview)
2. [Setup and Configuration](#setup-and-configuration)
3. [Authentication Methods](#authentication-methods)
4. [Email API](#email-api)
5. [WhatsApp API](#whatsapp-api)
6. [Error Handling](#error-handling)
7. [Examples](#examples)
8. [Security Considerations](#security-considerations)

## Overview

The Infobip integration provides comprehensive email and WhatsApp messaging capabilities with support for multiple authentication methods:

- **Email Services**: Send emails, validate email addresses, and retrieve delivery reports
- **WhatsApp Services**: Send text, media, location, contact, and template messages
- **Authentication**: API Key, Basic Auth, OAuth2, and IBSSO token support
- **Role-Based Access**: Different authentication methods based on user roles

## Setup and Configuration

### 1. Environment Variables

Add the following variables to your `.env` file:

```env
# Infobip Configuration
INFOBIP_BASE_URL=https://your-api-id.api-id.infobip.com
INFOBIP_API_KEY=your-infobip-api-key-here
INFOBIP_USERNAME=your-infobip-username
INFOBIP_PASSWORD=your-infobip-password
INFOBIP_WHATSAPP_SENDER=your-whatsapp-sender-number
INFOBIP_TIMEOUT=30000
INFOBIP_RETRIES=3
```

**Important**: The `INFOBIP_BASE_URL` must include the `https://` protocol. If you only have the domain (e.g., `69kjm8.api-id.infobip.com`), the system will automatically add the protocol, but it's recommended to include it explicitly.

### 2. Configuration Details

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `INFOBIP_BASE_URL` | Infobip API base URL | No | `https://api.infobip.com` |
| `INFOBIP_API_KEY` | Your Infobip API key | Yes* | - |
| `INFOBIP_USERNAME` | Your Infobip username | Yes* | - |
| `INFOBIP_PASSWORD` | Your Infobip password | Yes* | - |
| `INFOBIP_WHATSAPP_SENDER` | WhatsApp sender phone number | Yes | - |
| `INFOBIP_TIMEOUT` | Request timeout in milliseconds | No | `30000` |
| `INFOBIP_RETRIES` | Number of retry attempts | No | `3` |

*Required based on authentication method used

## Authentication Methods

The integration supports four authentication methods as per [Infobip API documentation](https://www.infobip.com/docs/essentials/api-essentials/api-authentication):

### 1. API Key Authentication (Recommended)
- **Usage**: Most secure and recommended method
- **Headers**: `Authorization: App {API_KEY}`
- **Roles**: Admin users
- **Configuration**: Requires `INFOBIP_API_KEY`

### 2. Basic Authentication
- **Usage**: Username/password authentication
- **Headers**: `Authorization: Basic {base64(username:password)}`
- **Roles**: All authenticated users
- **Configuration**: Requires `INFOBIP_USERNAME` and `INFOBIP_PASSWORD`

### 3. OAuth2 Authentication
- **Usage**: Token-based authentication with automatic refresh
- **Headers**: `Authorization: Bearer {access_token}`
- **Roles**: Non-admin users (requestor, approver, audit)
- **Configuration**: Requires `INFOBIP_USERNAME` and `INFOBIP_PASSWORD`

### 4. IBSSO Token Authentication
- **Usage**: Session-based authentication
- **Headers**: `Authorization: IBSSO {token}`
- **Roles**: All authenticated users
- **Configuration**: Requires `INFOBIP_USERNAME` and `INFOBIP_PASSWORD`

## Email API

### Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| `POST` | `/api/v1/infobip/email/send` | Send single email | admin, requestor, approver |
| `POST` | `/api/v1/infobip/email/send/bulk` | Send bulk emails | admin |
| `POST` | `/api/v1/infobip/email/validate` | Validate email address | admin, audit |
| `GET` | `/api/v1/infobip/email/reports` | Get email reports | admin, audit |
| `GET` | `/api/v1/infobip/email/reports/:messageId` | Get specific email report | admin, audit |

### Send Email Example

```bash
curl -X POST http://localhost:3000/api/v1/infobip/email/send \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "noreply@yourcompany.com",
    "to": [
      {
        "email": "user@example.com",
        "name": "John Doe"
      }
    ],
    "subject": "Welcome to our platform!",
    "html": "<h1>Welcome!</h1><p>Thank you for joining us.</p>",
    "text": "Welcome! Thank you for joining us."
  }'
```

### Email Validation Example

```bash
curl -X POST http://localhost:3000/api/v1/infobip/email/validate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

## WhatsApp API

### Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| `POST` | `/api/v1/infobip/whatsapp/send` | Send WhatsApp message | admin, requestor, approver |
| `POST` | `/api/v1/infobip/whatsapp/send/text` | Send text message | admin, requestor, approver |
| `POST` | `/api/v1/infobip/whatsapp/send/media` | Send media message | admin, requestor, approver |
| `POST` | `/api/v1/infobip/whatsapp/send/location` | Send location message | admin, requestor, approver |
| `POST` | `/api/v1/infobip/whatsapp/send/contact` | Send contact message | admin, requestor, approver |
| `POST` | `/api/v1/infobip/whatsapp/send/template` | Send template message | admin, requestor, approver |
| `GET` | `/api/v1/infobip/whatsapp/templates` | Get templates | admin, audit |
| `GET` | `/api/v1/infobip/whatsapp/reports` | Get WhatsApp reports | admin, audit |
| `GET` | `/api/v1/infobip/whatsapp/reports/:messageId` | Get specific WhatsApp report | admin, audit |

### Send Text Message Example

```bash
curl -X POST http://localhost:3000/api/v1/infobip/whatsapp/send/text \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "1234567890",
    "text": "Hello! How can I help you today?"
  }'
```

### Send Media Message Example

```bash
curl -X POST http://localhost:3000/api/v1/infobip/whatsapp/send/media \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "1234567890",
    "url": "https://example.com/image.jpg",
    "filename": "image.jpg",
    "caption": "Check out this image!",
    "mediaType": "image"
  }'
```

### Send Template Message Example

```bash
curl -X POST http://localhost:3000/api/v1/infobip/whatsapp/send/template \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "1234567890",
    "templateName": "welcome_template",
    "language": "en",
    "variables": [
      {"name": "customer_name", "value": "John Doe"}
    ]
  }'
```

## Error Handling

The integration provides comprehensive error handling:

### Common Error Responses

```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

### Error Types

1. **Authentication Errors**: Invalid credentials or expired tokens
2. **Validation Errors**: Invalid request data
3. **Rate Limiting**: Too many requests
4. **Service Errors**: Infobip service issues
5. **Network Errors**: Connection problems

### Error Handling in Services

All services include:
- Automatic retry logic
- Detailed logging
- Graceful error handling
- User-friendly error messages

## Examples

### Complete Email Workflow

```typescript
// 1. Validate email address
const validation = await emailService.validateEmail({
  email: 'user@example.com'
});

if (validation.valid) {
  // 2. Send email
  const result = await emailService.sendEmail({
    from: 'noreply@yourcompany.com',
    to: [{ email: 'user@example.com', name: 'John Doe' }],
    subject: 'Welcome!',
    html: '<h1>Welcome!</h1><p>Thank you for joining us.</p>'
  });

  // 3. Check delivery status
  const report = await emailService.getEmailReportById(result.messages[0].messageId);
}
```

### Complete WhatsApp Workflow

```typescript
// 1. Get available templates
const templates = await whatsappService.getTemplates();

// 2. Send template message
const result = await whatsappService.sendTemplateMessage({
  to: '1234567890',
  templateName: 'welcome_template',
  language: 'en',
  variables: [
    { name: 'customer_name', value: 'John Doe' }
  ]
});

// 3. Check delivery status
const report = await whatsappService.getWhatsAppReportById(result.messages[0].messageId);
```

## Security Considerations

### 1. Environment Variables
- Never commit API keys to version control
- Use environment-specific configurations
- Rotate API keys regularly

### 2. Authentication
- Use API Key authentication for admin users
- Use OAuth2 for non-admin users
- Implement proper token management

### 3. Rate Limiting
- Monitor API usage
- Implement request throttling
- Handle rate limit errors gracefully

### 4. Data Validation
- Validate all input data
- Sanitize user inputs
- Use TypeScript for type safety

### 5. Logging
- Log all API interactions
- Monitor for suspicious activity
- Implement audit trails

## Testing

### Unit Tests
```bash
npm run test -- --testPathPattern=infobip
```

### Integration Tests
```bash
npm run test:e2e -- --testPathPattern=infobip
```

### Manual Testing
1. Set up environment variables
2. Start the application: `npm run start:dev`
3. Access Swagger documentation: `http://localhost:3000/api/docs`
4. Test endpoints with different authentication methods

## Troubleshooting

### Common Issues

#### 1. Invalid URL Error
**Error**: `TypeError: Invalid URL` or `Failed to obtain OAuth2 token`

**Cause**: The `INFOBIP_BASE_URL` is missing the `https://` protocol.

**Solution**: 
```env
# ❌ Incorrect
INFOBIP_BASE_URL=69kjm8.api-id.infobip.com

# ✅ Correct
INFOBIP_BASE_URL=https://69kjm8.api-id.infobip.com
```

#### 2. Authentication Method Selection
**Issue**: System tries OAuth2 even when you want to use API key.

**Solution**: The system now automatically prefers API key authentication when available, regardless of user role. If you have an API key configured, it will be used for all requests.

#### 3. Testing Configuration
Use the provided test script to verify your configuration:
```bash
node test-infobip.js
```

This script will:
- Display your current environment variables
- Test API key authentication
- Test OAuth2 authentication
- Show detailed error messages

#### 4. Authentication Failures
- Verify API credentials
- Check environment variables
- Ensure proper authentication method

#### 5. Rate Limiting
- Implement exponential backoff
- Monitor API usage
- Contact Infobip support if needed

#### 6. Network Issues
- Check internet connectivity
- Verify Infobip service status
- Review timeout settings

### Support

For additional support:
- [Infobip API Documentation](https://www.infobip.com/docs/essentials/api-essentials/api-authentication)
- [Infobip Support](https://www.infobip.com/support)
- Application logs and error messages
