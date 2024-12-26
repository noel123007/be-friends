# BeFriends - A Social Networking Dashboard

## Project Overview

BeFriends is a simple social platform that enables users to connect, interact and manage using a dashboard interface. The application combines social networking features with personal activity tracking and real-time communications. Use this as a guide to build the backend for the BeFriends project.

### Core Purpose

- Enable users to build and manage their social connections
- Provide real-time interaction through chat and notifications
- Track and display user activities and engagements
- Offer administrative tools for platform management

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js with TypeScript
- **API**: GraphQL with Apollo Server
- **Database**: MongoDB with Mongoose ODM
- **Caching**: Redis
- **Authentication**: JWT, OAuth2.0
- **Testing**: Jest, Supertest
- **Documentation**: GraphQL Playground
- **Logging**: Winston/Pino
- **CI/CD**: GitHub Actions
- **Containerization**: Docker
- **Code Quality**: ESLint, Prettier
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Zod
- **Real-time**: WebSocket (Socket.io)

## Project Setup Instructions

1. Initial Setup

   ````bash
   # Initialize project with TypeScript template
   pnpm create vite-express dashboard-api --template typescript
   cd dashboard-api
   pnpm install

   # Alternative: Use express-generator-typescript
   pnpm dlx express-generator-typescript dashboard-api
   ```3. Initial Dependencies
   ```bash
   # Core dependencies
   pnpm add express apollo-server-express graphql mongoose winston \
         jsonwebtoken bcryptjs zod cors helmet socket.io redis

   # Development dependencies
   pnpm add -D typescript @types/express @types/node ts-node-dev \
           jest @types/jest ts-jest supertest @types/supertest \
           eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin \
           prettier eslint-config-prettier eslint-plugin-prettier \
           husky lint-staged
   ````

2. Package.json Scripts

   ```json
   {
     "scripts": {
       "dev": "ts-node-dev --respawn --transpile-only src/app.ts",
       "build": "tsc",
       "start": "node dist/app.js",
       "test": "jest",
       "test:watch": "jest --watch",
       "lint": "eslint . --ext .ts",
       "lint:fix": "eslint . --ext .ts --fix",
       "format": "prettier --write \"src/**/*.ts\"",
       "prepare": "husky install"
     }
   }
   ```

3. Environment Setup

   ```bash
   # Create environment files
   cp .env.example .env

   # Environment variables content
   cat << EOF > .env.example
   NODE_ENV=development
   PORT=4000
   MONGODB_URI=mongodb://localhost:27017/dashboard
   REDIS_URI=redis://localhost:6379
   JWT_SECRET=your-secret-key
   JWT_REFRESH_SECRET=your-refresh-secret
   CORS_ORIGIN=http://localhost:3000
   EOF
   ```

4. Docker Setup

   ```bash
   # Create Docker files
   cat << EOF > Dockerfile
   FROM node:20-alpine AS builder

   WORKDIR /app

   COPY package.json pnpm-lock.yaml ./
   RUN corepack enable && corepack prepare pnpm@latest --activate
   RUN pnpm install --frozen-lockfile

   COPY . .
   RUN pnpm build

   FROM node:20-alpine

   WORKDIR /app

   COPY --from=builder /app/dist ./dist
   COPY --from=builder /app/package.json ./
   COPY --from=builder /app/pnpm-lock.yaml ./

   RUN corepack enable && corepack prepare pnpm@latest --activate
   RUN pnpm install --prod --frozen-lockfile

   EXPOSE 4000

   CMD ["node", "dist/app.js"]
   EOF

   # Create docker-compose file
   cat << EOF > docker-compose.yml
   version: '3.8'

   services:
     api:
       build: .
       ports:
         - "4000:4000"
       environment:
         - NODE_ENV=development
         - MONGODB_URI=mongodb://mongo:27017/dashboard
         - REDIS_URI=redis://redis:6379
       depends_on:
         - mongo
         - redis

     mongo:
       image: mongo:latest
       ports:
         - "27017:27017"
       volumes:
         - mongodb_data:/data/db

     redis:
       image: redis:alpine
       ports:
         - "6379:6379"
       volumes:
         - redis_data:/data

   volumes:
     mongodb_data:
     redis_data:
   EOF
   ```

5. Development Setup

   ```bash
   # Initialize Git repository
   git init

   # Setup Husky
   pnpm dlx husky-init && pnpm install
   pnpm husky add .husky/pre-commit "pnpm lint-staged"

   # Create lint-staged config
   cat << EOF > .lintstagedrc
   {
     "*.ts": [
       "eslint --fix",
       "prettier --write"
     ]
   }
   EOF

   # Create .gitignore
   cat << EOF > .gitignore
   node_modules
   dist
   .env
   coverage
   .DS_Store
   EOF
   ```

6. Development Workflow

   ```bash
   # Start development server
   pnpm dev

   # Run tests
   pnpm test

   # Build for production
   pnpm build

   # Start production server
   pnpm start

   # Run linting
   pnpm lint

   # Format code
   pnpm format

   # Start with Docker
   docker-compose up --build
   ```

## Core Architecture

- Implement a Node.js/Express backend following clean architecture principles
- Use TypeScript for type safety and better developer experience
- Implement GraphQL API with Apollo Server instead of REST
- Follow SOLID principles
- Use environment variables for configuration management
- Implement comprehensive logging using Winston or Pino
- Document all implemented GraphQL types, queries, mutations, and subscriptions

## Authentication & Security

1. User Authentication System

   - Implement JWT-based authentication with refresh token rotation
   - Add OAuth2.0 support for Google login(last priority)
   - Implement two-factor authentication using TOTP (last priority)
   - Add password reset functionality with secure tokens
   - Enforce strong password policies

2. Security Measures
   - Implement rate limiting for all API endpoints
   - Use bcrypt for password hashing
   - Add CORS configuration
   - Implement request validation using Zod
   - Add security headers (helmet)

## Database Design

1. Core Schema

   - Users (profile, authentication, roles)
   - Activities (user actions, timestamps)
   - Friends (relationships, requests)
   - Notifications
   - Chat messages
   - User sessions
   - Audit logs

2. Database Requirements
   - Use MongoDB with Mongoose as ORM
   - Add database indexing for performance
   - Implement soft deletes

## Core Features Implementation

1. User Management

   - Registration with email verification
   - Profile management with avatar upload
   - Last login tracking
   - User search functionality
   - Role-based access control (RBAC)

2. Friend System

   - Friend request sending/accepting
   - Friend list management
   - Friend activity feed

3. Notification System

   - Real-time notifications using WebSocket/Polling (whichever is easier)
   - Notification preferences
   - Notification read/unread status
   - Notification types (friend requests, system alerts, etc.)

4. Admin Features
   - User management dashboard

## Performance & Scaling

1. Caching Strategy

   - Implement Redis for caching
   - Cache frequently accessed data
   - Implement cache invalidation strategies

2. Performance Optimization
   - Implement database query optimization
   - Add pagination for list queries
   - Implement data compression

## Testing & Quality Assurance

1. Testing Requirements

   - Unit tests with Jest
   - Integration tests for API endpoints
   - E2E tests for critical flows
   - Test coverage minimum 80%

2. Code Quality
   - ESLint configuration
   - Prettier for code formatting

## Deployment & DevOps

1. Docker Configuration

   - Multi-stage Dockerfile
   - Docker Compose for local development
   - Container health checks
   - Environment-specific configurations

2. CI/CD Pipeline
   - GitHub Actions workflow
   - Automated deployment

## Documentation

1. Required Documentation

   - API documentation using GraphQL Playground
   - Setup instructions
   - Environment configuration guide
   - Database schema documentation
   - Deployment guide

2. Code Documentation
   - README file at the root of the project
   - Architecture decision records (ADRs)
   - GraphQL schema documentation
