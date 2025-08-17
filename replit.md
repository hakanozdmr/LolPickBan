# League of Legends Draft Simulator

## Overview

This is a League of Legends champion draft simulator built as a full-stack web application. The application simulates the draft phase experience from competitive League of Legends matches, allowing users to practice pick/ban strategies in a realistic environment. The simulator includes champion filtering, draft phase progression, team-based selections, and real-time state management for both picks and bans across blue and red teams.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side is built with **React 18** using **TypeScript** and **Vite** as the build tool. The UI leverages **shadcn/ui** components built on top of **Radix UI primitives** for accessible, customizable components. State management is handled through **React Query (TanStack Query)** for server state and standard React hooks for local state. The application uses **Wouter** for lightweight client-side routing and follows a component-based architecture with clear separation between UI components, business logic, and data fetching.

The styling system uses **Tailwind CSS** with a custom design system featuring League of Legends-themed colors and components. The application supports dark mode by default and includes responsive design patterns for various screen sizes.

### Backend Architecture  
The server is built with **Express.js** and TypeScript in an ESM module system. It follows a RESTful API design pattern with endpoints for champion data retrieval and draft session management. The server includes middleware for request logging, JSON parsing, and error handling. The architecture separates concerns with dedicated modules for routing, storage, and development tooling.

The storage layer uses an abstraction pattern (`IStorage` interface) currently implemented as an in-memory storage solution (`MemStorage`) that loads champion data from JSON files. This design allows for easy migration to database storage in the future.

### Database Schema
The application defines database schemas using **Drizzle ORM** with PostgreSQL as the target database. The schema includes:

- **Champions table**: Stores champion metadata including ID, name, title, roles, classes, and image URLs
- **Draft Sessions table**: Tracks draft state including current phase, active team, timer, and arrays of picked/banned champions for both teams

The schema uses Zod for runtime validation and type inference, ensuring type safety between the database layer and application logic.

### Component Architecture
The frontend is organized into several key component categories:

- **Page Components**: Main route handlers like `DraftSimulator` and `NotFound`
- **Feature Components**: Complex business logic components like `ChampionGrid`, `ActionBar`, `DraftHeader`, and `FiltersPanel`
- **UI Components**: Reusable shadcn/ui components in the `/ui` directory
- **Hooks**: Custom React hooks for mobile detection and toast notifications

### State Management Strategy
The application uses a hybrid state management approach:

- **Server State**: Managed by React Query for champion data and draft sessions with optimistic updates and cache management
- **Local State**: React hooks for UI state like selected champions, filters, and timers
- **Form State**: React Hook Form with Zod validation for any form interactions

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
- **PostgreSQL**: Primary database system using connection pooling and serverless architecture

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