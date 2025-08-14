# Boilerplat Nest - Modular NestJS Application

A clean, modular NestJS application with PostgreSQL, TypeORM, JWT authentication, and Swagger documentation.

## Features

- **Modular Architecture**: Clean separation of concerns with feature-based modules
- **PostgreSQL Database**: TypeORM integration with PostgreSQL
- **JWT Authentication**: Secure authentication with JWT tokens
- **Role-Based Access Control**: Four distinct roles (admin, audit, requestor, approver)
- **Menu Management**: Dynamic menu system based on user roles
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

| Email | Password | Role | Description |
|-------|----------|------|-------------|
| `admin@example.com` | `admin123` | Admin | Full system access |
| `audit@example.com` | `audit123` | Audit | Read-only access to logs and reports |
| `requestor@example.com` | `requestor123` | Requestor | Can create and submit requests |
| `approver@example.com` | `approver123` | Approver | Can approve or reject requests |
| `multi@example.com` | `multi123` | Requestor + Approver | Has both requestor and approver roles |

## Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Request validation and sanitization
- CORS enabled
- Environment-based configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
