# League of Legends Draft Simulator

## Overview

This is a professional League of Legends champion draft simulator with comprehensive tournament management and user authentication. The application provides an authentic draft phase experience from competitive League of Legends matches, featuring role-based access control, secure team access codes, and complete tournament integration with automatic redirects and detailed results display.

Key features include:
- **User Authentication**: Replit Auth integration with role-based access (admin, moderator, user)
- **Team Access Codes**: Secure UUID-based codes for draft participation
- **Tournament Management**: Complete bracket system with match tracking
- **Draft Sessions**: Realistic pick/ban phases with authentic audio and timers
- **Database Integration**: PostgreSQL with Drizzle ORM for data persistence

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side is built with **React 18** using **TypeScript** and **Vite** as the build tool. The UI leverages **shadcn/ui** components built on top of **Radix UI primitives** for accessible, customizable components. State management is handled through **React Query (TanStack Query)** for server state and standard React hooks for local state. The application uses **Wouter** for lightweight client-side routing and follows a component-based architecture with clear separation between UI components, business logic, and data fetching.

The styling system uses **Tailwind CSS** with a custom design system featuring League of Legends-themed colors and components. The application supports dark mode by default and includes responsive design patterns for various screen sizes.

### Backend Architecture  
The server is built with **Express.js** and TypeScript in an ESM module system with comprehensive authentication and authorization. It follows a RESTful API design with protected endpoints using Replit Auth integration. The server includes:

- **Authentication System**: Replit OpenID Connect integration with session management
- **Authorization Middleware**: Role-based access control (admin, moderator, user permissions)
- **Database Integration**: PostgreSQL with connection pooling and automated data initialization
- **Protected Routes**: Admin/moderator-only endpoints for draft session creation and management

The storage layer implements the `IStorage` interface using `DatabaseStorage` class, providing persistent data storage with automatic champion data loading and user session management.

### Database Schema
The application uses **Drizzle ORM** with PostgreSQL for comprehensive data management. The schema includes:

- **Users table**: Authentication data with role-based access (admin, moderator, user)
- **Sessions table**: Secure session storage for Replit Auth integration
- **Champions table**: Champion metadata with roles, classes, and image URLs
- **Tournaments table**: Tournament management with creator tracking
- **Teams table**: Team information linked to tournaments
- **Matches table**: Match tracking with winner assignment
- **Draft Sessions table**: Complete draft state with team access codes (blueTeamCode, redTeamCode), join status, and creator information

All tables include proper foreign key relationships and use Zod for runtime validation and type inference, ensuring type safety across the application.

### Component Architecture
The frontend features authentication-aware routing and role-based UI components:

- **Authentication Pages**: `Landing` (logged out users), `Home` (authenticated dashboard)
- **Page Components**: `DraftSimulator`, `Tournaments`, and `NotFound` with authentication guards
- **Feature Components**: `ChampionGrid`, `ActionBar`, `DraftHeader`, `FiltersPanel`, `TeamCodesModal`
- **UI Components**: Reusable shadcn/ui components with consistent dark theme
- **Authentication Hooks**: `useAuth` hook for user state and role checking
- **Security Features**: Unauthorized error handling and automatic login redirects
- **Audio System**: Professional League of Legends draft music and sound effects

### State Management Strategy
The application implements authentication-aware state management:

- **Server State**: React Query for champion data, draft sessions, and user authentication with proper cache invalidation
- **Authentication State**: `useAuth` hook managing user sessions with automatic refresh and error handling
- **Local State**: React hooks for UI state, selected champions, filters, timers, and modal visibility
- **Form State**: React Hook Form with Zod validation for secure data input
- **Error Handling**: Comprehensive unauthorized error detection with automatic login redirects

### Development Environment
The development setup includes Vite for fast HMR, TypeScript for type safety, and specialized Replit integrations for cloud development. The build process supports both development and production modes with appropriate optimizations for each environment.

## External Dependencies

### UI and Styling
- **Radix UI**: Comprehensive set of accessible, unstyled UI components
- **shadcn/ui**: Pre-built component library built on Radix UI
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Utility for creating variant-based component APIs

### Data Management
- **TanStack React Query**: Server state management with caching, background updates, and optimistic updates
- **Drizzle ORM**: Type-safe SQL database toolkit with PostgreSQL support
- **Drizzle Kit**: Database migration and introspection tools
- **Zod**: Schema validation and type inference library

### Database and Storage
- **Neon Database**: Serverless PostgreSQL database (via @neondatabase/serverless)
- **PostgreSQL**: Primary database with session storage, user management, and tournament data
- **Session Management**: PostgreSQL-backed sessions via connect-pg-simple for secure authentication
- **Connection Pooling**: Optimized database connections for production scalability

### Development and Build Tools
- **Vite**: Fast build tool and development server with React plugin
- **TypeScript**: Static type checking and enhanced developer experience
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Autoprefixer for vendor prefix handling

### Routing and Navigation
- **Wouter**: Minimalist client-side routing library for React applications

### Utilities and Helpers
- **clsx/twMerge**: Conditional CSS class name utilities
- **date-fns**: Date manipulation and formatting library
- **nanoid**: URL-safe unique ID generation

### Authentication & Security
- **Replit Auth**: OpenID Connect integration for secure user authentication
- **Role-Based Access**: Three-tier system (admin, moderator, user) with appropriate permissions
- **Team Access Codes**: Secure UUID-based codes for draft participation
- **Session Security**: HTTPOnly cookies with secure session management
- **Protected Routes**: Authentication middleware protecting sensitive endpoints
- **Error Handling**: Comprehensive unauthorized access detection and response

### Audio System  
- **Web Audio API**: Professional audio generation for authentic League of Legends experience
- **Real-time Audio**: Epic orchestral draft music with heroic melodies and dynamic progression
- **Sound Effects**: Authentic champion pick/ban sounds with metallic locks, dark tones, and magical hover effects
- **Custom Audio Generator**: Procedurally generated sounds matching LoL's professional tournament atmosphere