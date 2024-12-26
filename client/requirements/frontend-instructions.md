# BeFriends - A Social Networking Dashboard

## Project Overview

BeFriends is a simple social platform that enables users to connect, interact and manage using a dashboard interface. The application combines social networking features with personal activity tracking and real-time communications. Use this as a guide to build the frontend for the BeFriends project.

### Core Purpose

- Enable users to build and manage their social connections
- Provide real-time interaction through chat and notifications
- Track and display user activities and engagements
- Offer administrative tools for platform management

## Tech Stack

- **Framework**: React 18+ with Vite
- **Language**: TypeScript 5+
- **API Client**: GraphQL with Apollo Client
- **UI Components**: Shadcn UI, Radix UI
- **Styling**: Tailwind CSS, Tailwind Aria
- **Forms**: React Hook Form, Zod
- **State Management**: TanStack Query, Zustand
- **Routing**: React Router v6
- **Testing**: Vitest, Testing Library
- **Documentation**: Storybook
- **Code Quality**: ESLint, Prettier
- **Performance**: Lighthouse
- **Build Tool**: Vite
- **Package Manager**: pnpm

## Feature Implementation Guide

### 1. Authentication System

- Implement JWT-based auth flow
- Create protected route wrapper
- Add social login integration
- Implement session management
- Add password reset flow
- Handle token refresh

### 2. Dashboard Layout

- Create responsive dashboard shell
- Implement sidebar navigation
- Add header with user menu
- Create mobile navigation drawer
- Add breadcrumb navigation
- Implement theme switcher

### 3. Core Features

1. User Profile

   - Profile viewing/editing
   - Avatar upload with preview
   - Settings management
   - Activity history

2. Friends System

   - Friend search
   - Friend requests
   - Friends list
   - Block/unblock functionality

3. Notification Center

   - Real-time notifications
   - Notification preferences
   - Mark as read/unread
   - Notification filters

4. Chat System

   - Real-time messaging
   - Online status
   - Message history
   - Typing indicators

5. Theme
   - Light/dark mode implementation
   - Local storage persistence

### 4. Performance Optimization

- Implement route-based code splitting
- Add lazy loading for components
- Optimize bundle size
- Add loading states
- Implement infinite scrolling
- Add skeleton loading

### 5. Error Handling

- Create error boundaries
- Implement toast notifications
- Add form validation
- Handle API errors
- Add offline support

## Testing Requirements

1. Unit Tests

   - Component testing
   - Hook testing
   - Utility function testing

2. Integration Tests

   - Route navigation
   - Form submissions
   - API interactions

3. E2E Tests
   - Authentication flows
   - Critical user journeys

## Build & Deployment

- Configure build optimization
- Set up CI/CD with GitHub Actions
- Configure static hosting
- Add environment variables

## Documentation

- Add component documentation
- Create setup guide
- Add API integration docs
- Document state management
- Add testing guide

## Best Practices

1. Code Quality

   - Follow TypeScript guidelines
   - Use proper error handling
   - Implement proper loading states
   - Follow accessibility guidelines

2. Performance

   - Use proper code splitting
   - Implement caching strategies
   - Optimize bundle size

3. Security

   - Add rate limiting
   - Handle sensitive data

4. Accessibility
   - Maintain ARIA labels
   - Ensure keyboard navigation

## Integration Points with Backend

1. GraphQL Integration

   - Share types between frontend and backend
   - Handle real-time subscriptions
   - Implement proper error handling
   - Add request caching

2. Authentication Flow

   - Coordinate JWT handling
   - Share session management
   - Handle token refresh
   - Manage social login flow

3. Real-time Features
   - WebSocket connection management
   - Handle reconnection logic
   - Implement presence system
   - Manage subscription cleanup
