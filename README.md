# BeFriends - Social Networking Dashboard

BeFriends is a social networking platform built with React, TypeScript, and Node.js that enables users to connect, interact, and manage their social presence through an intuitive dashboard interface.

## Demo

Frontend: https://be-friends-rho.vercel.app

Backend: https://be-friends.onrender.com/graphql

Unfortunatley, could not deploy the backend using Docker due to time constraints. However, docker-compose is configured and ready to use.

## Features

### Authentication & Security

- JWT-based authentication
- Secure password hashing with bcrypt
- Protected routes and API endpoints
- Rate limiting and security headers
- Password reset functionality (only UI for now)
- Form validation with Zod

### User Management

- User registration and login
- Profile management with avatar upload
- Activity tracking and history
- Last login tracking
- User search functionality

### Social Features

- Friend request system (send/accept/reject)
- Friend list management
- Activity feed with real-time updates
- Real-time notifications
- User presence system

### UI/UX

- Responsive dashboard layout
- Dark/Light theme support
- Internationalization (i18n) support
- Mobile-first design
- Loading states and skeleton screens
- Toast notifications
- Accessible components (ARIA)

## Tech Stack

### Frontend

- React 18+ with TypeScript
- Vite for build tooling
- Apollo Client for GraphQL
- Shadcn UI & Radix UI components
- Tailwind CSS for styling
- React Router v6
- React Hook Form & Zod
- i18next for translations

### Backend

- Node.js with Express
- TypeScript
- Apollo Server for GraphQL
- MongoDB with Mongoose
- JWT for authentication
- WebSocket for real-time features
- Winston for logging

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- MongoDB

### Development Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/befriends.git
cd befriends
```

2. Install dependencies:

```bash
# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../api
npm install
```

3. Environment Setup:

```bash
# Frontend (.env)
VITE_API_URL=http://localhost:4000
VITE_WS_URL=ws://localhost:4000

# Backend (.env)
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://localhost:27017/befriends
JWT_SECRET=your-secret-key
```

4. Start development servers:

```bash
# Start frontend (from client directory)
npm run dev

# Start backend (from api directory)
npm run dev
```

### Docker Setup

The project includes Docker configuration for easy deployment:

```bash
# Start all services
docker-compose up --build
```

## Project Structure

### Frontend

```
client/
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/        # Route components
│   ├── providers/    # Context providers
│   ├── hooks/        # Custom hooks
│   ├── lib/          # Utilities and helpers
│   ├── types/        # TypeScript definitions
│   └── graphql/      # GraphQL queries and mutations
│   └── public/
│       └── locales/  # Internationalization files
```

### Backend

```
api/
├── src/
│   ├── config/       # Configuration files
│   ├── models/       # Database models
│   ├── graphql/      # GraphQL schema and resolvers
│   ├── services/     # Business logic
│   ├── middleware/   # Express middleware
│   └── utils/        # Helper functions
```

## Available Scripts

### Frontend

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

### Backend

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm test            # Run tests
npm run lint         # Run ESLint
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
