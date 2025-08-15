# Boilerplat Nest - Modular NestJS Application

A clean, modular NestJS application with PostgreSQL, TypeORM, JWT authentication, and Swagger documentation.

## Features

- **Modular Architecture**: Clean separation of concerns with feature-based modules
- **PostgreSQL Database**: TypeORM integration with PostgreSQL
- **JWT Authentication**: Secure authentication with JWT tokens
- **Role-Based Access Control**: Four distinct roles (admin, audit, requestor, approver)
- **Menu Management**: Dynamic menu system based on user roles
- **Infobip Integration**: Email and WhatsApp messaging with multiple authentication methods
- **Swagger Documentation**: Auto-generated API documentation
- **Validation**: Request validation using class-validator
- **Error Handling**: Comprehensive error handling and responses
- **TypeScript**: Full TypeScript support with strict typing

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd boilerplat-nest
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```env
NODE_ENV=development
PORT=3000

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=boilerplat_nest
DATABASE_SYNCHRONIZE=true
DATABASE_LOGGING=true

JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

BCRYPT_SALT_ROUNDS=12

# Infobip Configuration
INFOBIP_BASE_URL=https://api.infobip.com
INFOBIP_API_KEY=your-infobip-api-key-here
INFOBIP_USERNAME=your-infobip-username
INFOBIP_PASSWORD=your-infobip-password
INFOBIP_WHATSAPP_SENDER=your-whatsapp-sender-number
INFOBIP_TIMEOUT=30000
INFOBIP_RETRIES=3
```

5. Create PostgreSQL database:
```sql
CREATE DATABASE boilerplat_nest;
```

6. Run the application:
```bash
npm run start:dev
```

## API Documentation

Once the application is running, you can access the Swagger documentation at:
```
http://localhost:3000/api/docs
```

## Available Scripts

- `npm run start:dev` - Start development server with hot reload
- `npm run build` - Build the application
- `npm run start:prod` - Start production server
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run seed` - Run database seeders
- `npm run seed:refresh` - Clear all data and re-run seeders

## Project Structure

```
src/
├── common/                 # Shared utilities and common code
│   ├── decorators/        # Custom decorators
│   ├── dto/              # Common DTOs
│   ├── entities/         # Base entities
│   └── guards/           # Authentication guards
├── config/               # Configuration files
│   ├── database.config.ts
│   └── jwt.config.ts
├── modules/              # Feature modules
│   ├── auth/            # Authentication module
│   │   ├── controllers/
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── services/
│   │   └── strategies/
│   ├── users/           # Users module
│   │   ├── controllers/
│   │   ├── dto/
│   │   ├── entities/
│   │   └── services/
│   ├── menus/           # Menus module
│   │   ├── controllers/
│   │   ├── dto/
│   │   ├── entities/
│   │   └── services/
│   └── roles/           # Roles module
│       ├── controllers/
│       ├── dto/
│       ├── entities/
│       └── services/
│   └── infobip/         # Infobip integration module
│       ├── controllers/
│       ├── dto/
│       └── services/
├── database/            # Database related files
│   └── seeders/        # Database seeders
├── app.module.ts         # Main application module
└── main.ts              # Application entry point
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login

### Users
- `GET /api/v1/users` - Get all users (paginated, Admin only)
- `GET /api/v1/users/profile` - Get current user profile
- `GET /api/v1/users/:id` - Get user by ID (Admin only)
- `PUT /api/v1/users/profile` - Update current user profile
- `PUT /api/v1/users/:id/deactivate` - Deactivate user (Admin only)
- `GET /api/v1/users/:id/roles` - Get user roles (Admin only)
- `POST /api/v1/users/:id/roles` - Assign roles to user (Admin only)
- `POST /api/v1/users/:id/roles/:roleId` - Add role to user (Admin only)
- `DELETE /api/v1/users/:id/roles/:roleId` - Remove role from user (Admin only)

### Roles (Admin Only)
- `GET /api/v1/roles` - Get all roles with pagination
- `GET /api/v1/roles/active` - Get all active roles
- `GET /api/v1/roles/:id` - Get role by ID
- `POST /api/v1/roles` - Create new role
- `PUT /api/v1/roles/:id` - Update role
- `PUT /api/v1/roles/:id/toggle` - Toggle role active status
- `DELETE /api/v1/roles/:id` - Delete role

### Menus (Role-Based)
- `GET /api/v1/menus/user` - Get user menus based on roles
- `GET /api/v1/menus/tree` - Get menu tree structure
- `GET /api/v1/menus` - Get all menus (Admin only)
- `GET /api/v1/menus/:id` - Get menu by ID (Admin only)
- `POST /api/v1/menus` - Create new menu (Admin only)
- `PUT /api/v1/menus/:id` - Update menu (Admin only)
- `PUT /api/v1/menus/:id/toggle` - Toggle menu active status (Admin only)
- `DELETE /api/v1/menus/:id` - Delete menu (Admin only)

### Infobip Integration
- `POST /api/v1/infobip/email/send` - Send email (admin, requestor, approver)
- `POST /api/v1/infobip/email/send/bulk` - Send bulk emails (admin)
- `POST /api/v1/infobip/email/validate` - Validate email address (admin, audit)
- `GET /api/v1/infobip/email/reports` - Get email reports (admin, audit)
- `GET /api/v1/infobip/email/reports/:messageId` - Get specific email report (admin, audit)
- `POST /api/v1/infobip/whatsapp/send` - Send WhatsApp message (admin, requestor, approver)
- `POST /api/v1/infobip/whatsapp/send/text` - Send WhatsApp text message (admin, requestor, approver)
- `POST /api/v1/infobip/whatsapp/send/media` - Send WhatsApp media message (admin, requestor, approver)
- `POST /api/v1/infobip/whatsapp/send/location` - Send WhatsApp location message (admin, requestor, approver)
- `POST /api/v1/infobip/whatsapp/send/contact` - Send WhatsApp contact message (admin, requestor, approver)
- `POST /api/v1/infobip/whatsapp/send/template` - Send WhatsApp template message (admin, requestor, approver)
- `GET /api/v1/infobip/whatsapp/templates` - Get WhatsApp templates (admin, audit)
- `GET /api/v1/infobip/whatsapp/reports` - Get WhatsApp reports (admin, audit)
- `GET /api/v1/infobip/whatsapp/reports/:messageId` - Get specific WhatsApp report (admin, audit)

## Database Migrations

To run migrations:
```bash
npm run migration:run
```

To generate a new migration:
```bash
npm run migration:generate -- src/database/migrations/MigrationName
```

## Role-Based Access Control

The application supports four distinct roles with different permissions:

- **Admin**: Full access to all features and system management
- **Audit**: Read-only access to system logs, reports, and user activity
- **Requestor**: Ability to create and submit requests
- **Approver**: Ability to approve or reject requests

### Seeded Users

The following users are automatically created with their respective roles:

| Email | Username | Password | PIN | Phone | Role | Description |
|-------|----------|----------|-----|-------|------|-------------|
| `admin@example.com` | `admin` | `admin123` | `1234567890` | `09123456789` | Admin | Full system access |
| `audit@example.com` | `audit` | `audit123` | `1234567890` | `091234567891` | Audit | Read-only access to logs and reports |
| `requestor@example.com` | `requestor` | `requestor123` | `1234567890` | `091234567892` | Requestor | Can create and submit requests |
| `approver@example.com` | `approver` | `approver123` | `1234567890` | `091234567893` | Approver | Can approve or reject requests |
| `multi@example.com` | `multi` | `multi123` | `1234567890` | `091234567894` | Requestor + Approver | Has both requestor and approver roles |

## Security Features

- JWT token-based authentication
- Password, PIN, email, and phone hashing with bcrypt
- Role-based access control (RBAC)
- Request validation and sanitization
- CORS enabled
- Environment-based configuration
- Infobip integration with multiple authentication methods (API Key, OAuth2, Basic Auth, IBSSO)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
