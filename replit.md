# Quiz Game Application

## Overview

This is a full-stack quiz game application built with React, TypeScript, Express, and PostgreSQL. The application allows users to create interactive quizzes, host live game sessions, and participate in real-time multiplayer quiz games. It features a modern web interface for quiz creation and hosting, with mobile-optimized player interfaces for joining games.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack React Query for server state, React hooks for local state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and bundling
- **UI Components**: Radix UI primitives with custom shadcn/ui styling

### Backend Architecture
- **Runtime**: Node.js with Express server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time Communication**: WebSockets for live game sessions
- **Session Management**: Connect-pg-simple for PostgreSQL session storage

### Key Design Decisions
- **Monorepo Structure**: Single repository with `client/`, `server/`, and `shared/` directories
- **TypeScript Throughout**: Full type safety across frontend, backend, and shared code
- **Real-time Games**: WebSocket-based architecture for live multiplayer quiz sessions
- **Mobile-First Player Experience**: Responsive design optimized for mobile devices
- **Component-Based UI**: Reusable components following shadcn/ui patterns

## Key Components

### Database Schema (`shared/schema.ts`)
- **Users**: Basic user authentication and management
- **Quizzes**: Quiz metadata, questions stored as JSONB
- **Games**: Active game sessions with player data
- **Game Answers**: Individual player responses and scoring

### Frontend Pages
- **Home** (`/`): Quiz library, game creation, and join interface
- **Quiz Constructor** (`/constructor`): Quiz creation and editing interface
- **Game Host** (`/host/:gameCode`): Host interface for managing live games
- **Mobile Player** (`/play/:gameCode`): Mobile-optimized player interface

### Backend Services
- **Storage Layer**: Abstracted storage interface with in-memory implementation
- **WebSocket Server**: Real-time communication for game sessions
- **Express Routes**: RESTful API for quiz and game management

## Data Flow

### Quiz Creation Flow
1. User creates quiz through constructor interface
2. Quiz data validated and stored in PostgreSQL
3. Questions stored as JSONB for flexibility
4. Quiz becomes available for hosting games

### Game Session Flow
1. Host creates game session from existing quiz
2. Game code generated and WebSocket server initialized
3. Players join using game code via mobile interface
4. Real-time updates broadcast to all connected clients
5. Game progression managed through WebSocket messages
6. Answers and scores tracked in database

### Real-time Communication
- WebSocket connections managed per game session
- Message types: join_game, start_game, submit_answer, player_updates
- Broadcast system for synchronized game state
- Automatic cleanup of disconnected players

## External Dependencies

### Core Framework Dependencies
- **React & TypeScript**: Frontend framework and type system
- **Express**: Backend web server framework
- **Drizzle ORM**: Type-safe database operations
- **@neondatabase/serverless**: PostgreSQL client for serverless environments

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **shadcn/ui**: Pre-built component library
- **Lucide React**: Icon library

### Real-time and State Management
- **WebSocket (ws)**: Real-time communication
- **TanStack React Query**: Server state management
- **React Hook Form**: Form handling and validation

## Deployment Strategy

### Development Environment
- **Vite Dev Server**: Hot module replacement for frontend
- **tsx**: TypeScript execution for backend development
- **Concurrent Development**: Frontend and backend run simultaneously

### Production Build
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations for schema management
- **Environment Variables**: DATABASE_URL for PostgreSQL connection

### Replit-Specific Features
- **Replit Vite Plugins**: Runtime error overlay and cartographer
- **Development Banner**: Automatic replit dev environment detection
- **Hot Reload**: Integrated development experience

The application is designed for scalability with the database abstraction layer allowing easy switching between development (in-memory) and production (PostgreSQL) storage implementations. The real-time WebSocket architecture supports multiple concurrent game sessions with proper session isolation and cleanup.