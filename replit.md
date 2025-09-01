# Forge - Fitness Tracking System

## Overview

This is a full-stack fitness tracking web application built with Next.js and Supabase. The system allows users to manage their workout routines, track exercise progress, and monitor fitness sessions. The application is designed as a comprehensive fitness management tool with support for exercise libraries, workout planning, and session tracking.

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 14 with TypeScript and App Router
- **UI Library**: Custom components with Tailwind CSS
- **State Management**: React hooks with custom state management
- **Authentication**: Supabase Auth with protected routes
- **Form Management**: Custom form components with validation
- **Testing**: Playwright for end-to-end testing

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Next.js API routes
- **Database**: PostgreSQL with Supabase
- **Authentication**: Supabase Auth with middleware protection
- **ORM**: Supabase client for database operations
- **Development**: Hot reload with Next.js development server

## Database Design

The system uses PostgreSQL with the following main tables:
- **users**: User authentication and profiles
- **exercises**: Exercise library with categories and muscle groups
- **workouts**: Workout templates and routines
- **sessions**: Individual workout sessions
- **sets**: Exercise sets within sessions

## Key Components

### Frontend Components
- **Dashboard**: Main fitness tracking interface with statistics and recent activity
- **Exercises**: Exercise library management with filtering and CRUD operations
- **Workouts**: Workout template creation and management
- **Sessions**: Active workout tracking and session history
- **Sidebar**: Navigation with user profile and menu structure
- **UI Components**: Reusable components for consistent design

### Backend Components
- **Services**: Exercise, workout, and session service layers
- **API Routes**: RESTful endpoints for all CRUD operations
- **Middleware**: Authentication and route protection
- **Validations**: Input validation for all data operations
- **Error Handling**: Centralized error handling and user feedback

## Data Flow

1. **Client Requests**: Next.js frontend makes API calls to internal API routes
2. **API Processing**: Next.js API routes handle requests with validation
3. **Data Storage**: Supabase client manages PostgreSQL database operations
4. **Response**: JSON responses sent back to frontend
5. **UI Updates**: React state management handles UI updates and user feedback

The application supports real-time filtering, search functionality, and optimistic updates for better user experience.

## External Dependencies

### Database
- **Supabase**: Backend-as-a-Service with PostgreSQL
- **Supabase Auth**: Authentication and user management

### UI/UX Libraries
- **Tailwind CSS**: Utility-first CSS framework
- **Custom Components**: Built-in UI component library

### Development Tools
- **Next.js**: React framework with built-in optimization
- **TypeScript**: Static type checking
- **Playwright**: End-to-end testing framework
- **Replit**: Development environment integration

## Deployment Strategy

The application is configured for deployment on Replit with the following setup:
- **Development**: `npm run dev` - Runs Next.js development server with hot reload
- **Build**: `npm run build` - Creates optimized production build
- **Production**: `npm run start` - Serves production build
- **Testing**: `npm run test` - Runs Playwright test suite
- **Database**: Configured for Supabase with environment-based connection

The build process creates a `.next` directory with the compiled application. The application is designed to run on port 3000 with automatic scaling support.

## Features

- **Exercise Management**: Create, edit, and organize exercise library
- **Workout Planning**: Build custom workout routines
- **Session Tracking**: Log workouts with sets, reps, and weights
- **Progress Monitoring**: Track fitness progress over time
- **User Authentication**: Secure user accounts and data
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Live data synchronization

## Changelog

- **Initial Setup**: Next.js application with Supabase integration
- **Authentication**: User registration and login system
- **Exercise System**: Exercise library with CRUD operations
- **Workout Management**: Workout template creation and management
- **Session Tracking**: Active workout logging and history
- **Testing Suite**: Comprehensive Playwright test coverage

## User Preferences

Preferred communication style: Simple, everyday language.

Forge - Fitness Tracking System - Replit