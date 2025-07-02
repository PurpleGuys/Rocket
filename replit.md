# BennesPro - Location de Bennes (Waste Management Platform)

## Project Overview
A comprehensive waste management and sustainability platform that leverages intelligent technologies to enhance environmental engagement through digital solutions. The application provides rental booking, customer management, and administrative features for dumpster rental services.

## Recent Changes (January 2, 2025)

### ✅ COMPREHENSIVE LOGGING SYSTEM IMPLEMENTED (January 2, 2025)
✓ ENHANCED: Complete startup logging with environment variables check
✓ ADDED: Detailed database connection logs with security masking
✓ IMPLEMENTED: Rich authentication logging with color coding
✓ CREATED: Request/response tracking with unique IDs
✓ UPGRADED: Global error handler with comprehensive debugging info
✓ ADDED: Performance monitoring (memory usage, slow requests)
✓ CONFIGURED: Multi-level logging (INFO, SUCCESS, WARN, ERROR, DEBUG)

### ✅ PRODUCTION BUILD CONFIGURATION FIXED (January 2, 2025)
✓ FIXED: Server static file serving paths to match Vite build output (`dist/public/`)
✓ CORRECTED: Production server now serves files from correct `dist/public/index.html` location
✓ UPDATED: Development fallback paths for consistency with production structure
✓ RESOLVED: ENOENT error when running production build (`npm run build && npm start`)
✓ TESTED: Production server successfully starts and serves static files

### ✅ REPOSITORY CLEANUP - DEVELOPMENT ENVIRONMENT RESTORED (January 2, 2025)
✓ CLEANED UP: Removed all deployment scripts and Docker files from development repository
✓ REMOVED: All shell scripts (*.sh files) that were cluttering the development environment
✓ DELETED: Docker configuration files (Dockerfile, docker-compose.yml, nginx.conf)
✓ CLEANED: Production artifacts and monitoring configurations
✓ RESTORED: Clean development environment focused on core BennesPro application
✓ MAINTAINED: Core application code (client/, server/, shared/) and configuration files
✓ UPDATED: Documentation to reflect clean development state

## Project Architecture

### Frontend
- **Framework**: React with Vite build system
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state
- **UI Components**: Shadcn/ui with Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **Features**: 
  - Customer dashboard with Google Maps integration
  - Service booking and pricing calculator
  - Multi-role authentication (customers/admin)
  - Responsive design with dark mode support

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT with session management
- **Email Service**: SendGrid integration
- **File Handling**: Multer for document uploads
- **API**: RESTful endpoints with comprehensive error handling

### Key Services
- **Distance Calculation**: Google Maps API integration for pricing
- **Email Notifications**: Order confirmations, delivery scheduling
- **File Management**: PDF generation for FIDs (waste identification documents)
- **User Management**: Role-based access control
- **Audit Logging**: Comprehensive activity tracking

## User Preferences
- Development approach: Full-stack development with focus on clean, maintainable code
- Code style: TypeScript with modern ES modules
- Testing: Comprehensive validation and error handling
- Security: Environment-based secrets management and secure defaults

## Development Environment

### Clean Development Setup
The repository now maintains a clean development environment focused on the core BennesPro application:

**🖥️ Frontend (React + Vite):**
- React with TypeScript for type safety
- Wouter for lightweight routing
- TanStack React Query for server state management
- Shadcn/ui components with Tailwind CSS
- React Hook Form with Zod validation

**⚙️ Backend (Node.js + Express):**
- Express.js server with TypeScript
- Drizzle ORM with PostgreSQL database
- JWT authentication with session management
- SendGrid integration for email services
- File upload handling with Multer

**🗄️ Database (PostgreSQL):**
- Comprehensive schema for waste management operations
- User management with role-based access control
- Order processing and status tracking
- Service catalog and pricing management
- Audit logging and email tracking

## Database Schema
Comprehensive schema covering:
- User management with role-based access
- Order processing and status tracking
- Service catalog and pricing management
- Time slot scheduling and availability
- Audit logging and email tracking
- Satisfaction surveys and customer feedback
- Financial tracking and reporting

## Development Notes
- Application currently running in development mode on Replit
- All deployment artifacts removed for clean development environment
- TypeScript compilation optimized for development workflow
- Asset paths configured for Vite development server