# Quiz Game Application

## Overview

This is a full-stack quiz game application built with React, TypeScript, Express, and PostgreSQL. The application allows users to create interactive quizzes, host live game sessions, and participate in real-time multiplayer quiz games. It features a modern web interface for quiz creation and hosting, with mobile-optimized player interfaces for joining games.

## User Preferences

Preferred communication style: Simple, everyday language.
Russian language interface support for quiz content and UI.

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
- **Quiz Constructor** (`/constructor`): Quiz creation and editing interface with visual editor
- **Game Host** (`/host/:gameCode`): Host interface for managing live games
- **Mobile Player** (`/play/:gameCode`): Mobile-optimized player interface
- **Solo Play** (`/solo/:quizId`): Single-player quiz testing mode

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
- **pg**: Standard PostgreSQL client for Node.js

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

### Platform-Agnostic Features
- **Standard PostgreSQL**: Compatible with any PostgreSQL provider (Supabase, Neon, ElephantSQL)
- **Flexible Deployment**: Can be deployed on Vercel, Netlify, Railway, Render, or any Node.js hosting
- **Environment Variables**: Standard NODE_ENV and DATABASE_URL configuration

The application is designed for scalability with the database abstraction layer allowing easy switching between development (in-memory) and production (PostgreSQL) storage implementations. The real-time WebSocket architecture supports multiple concurrent game sessions with proper session isolation and cleanup.

## Migration to External Services (January 2025)

### Changes Made
- **Database**: Migrated from @neondatabase/serverless to standard PostgreSQL (pg package)
- **Configuration**: Removed Replit-specific Vite plugins and dependencies
- **SSL Support**: Added automatic SSL configuration for production PostgreSQL connections
- **Documentation**: Added deployment.md with instructions for external hosting providers

### Recommended External Services
- **Database**: Supabase (free tier: 500MB), Neon, or ElephantSQL
- **Hosting**: Vercel (recommended), Railway, Render, or Netlify
- **Development**: Works with any Node.js environment

The application is now platform-agnostic and can be deployed on any hosting provider that supports Node.js and PostgreSQL.

## Recent Changes (December 2024)

### Advanced Features Added
1. **Solo Play Mode** (`/solo/:quizId`)
   - Single-player quiz testing without requiring other players
   - Complete quiz experience with scoring and results
   - Allows creators to test their quizzes before hosting multiplayer games

2. **Enhanced Question Editor with Tabs**
   - **Form Tab**: Traditional form-based question creation
   - **Visual Tab**: Drag-and-drop visual question editor (website builder style)
   - **Preview Tab**: Real-time question preview with fullscreen mode
   - Support for AI voice generation placeholder (ready for OpenAI TTS integration)

3. **Visual Question Editor**
   - Drag-and-drop interface for creating questions
   - Support for text, images, videos, shapes, and answer buttons
   - Customizable backgrounds (color, image, video)
   - Element styling: fonts, colors, opacity, borders, rotation
   - Template saving and loading system
   - Real-time preview and editing

4. **Template Management System**
   - Personal template creation and storage
   - Template categorization (Basic, Science, Visual, Custom)
   - Template sharing and duplication
   - Usage statistics tracking
   - Template preview and selection interface

5. **Media Support Enhancements**
   - Video background support for questions
   - Audio file upload and management
   - AI voice generation placeholders (for OpenAI TTS)
   - Image handling with drag-and-drop upload

6. **Enhanced Quiz Cards**
   - "Test Solo" button for immediate quiz testing
   - Improved layout with more action options
   - Better visual hierarchy and information display

7. **Russian Language Support**
   - Complete UI localization in Russian
   - Russian content support throughout the application
   - Culturally appropriate interface elements

### Technical Architecture Updates
- Added `/solo/:quizId` route for solo play functionality
- Enhanced component structure with tabbed interfaces
- Implemented drag-and-drop visual editor with React hooks
- Added template management system with local storage
- Improved type safety and error handling
- Enhanced responsive design for mobile and desktop

### User Experience Improvements
- Inline preview functionality in question editor
- Fullscreen preview mode for better question visualization
- Template-based question creation for faster workflow
- Solo testing mode reduces friction for quiz creators
- AI voice integration preparation for accessibility

All features are ready for deployment and testing. The solo play mode provides immediate value for quiz creators, while the visual editor and template system significantly enhance the creation experience.

## Database Integration (December 2024)

### Database Migration Completed
- Successfully migrated from in-memory storage to PostgreSQL database
- All tables created and sample data inserted
- Database connection established and working
- Quiz data is now persistent across server restarts

### Database Schema
- **Users table**: Basic user authentication data
- **Quizzes table**: Quiz metadata with questions stored as JSONB
- **Games table**: Active game sessions with player data
- **Game_answers table**: Individual player responses and scoring

### Technical Implementation
- Added `server/db.ts` with Neon PostgreSQL connection
- Created `DatabaseStorage` class implementing `IStorage` interface
- Updated storage layer to use real database operations
- Sample quiz data successfully inserted and accessible

The application now has full database persistence and is ready for production use.