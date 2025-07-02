# BennesPro - Location de Bennes (Waste Management Platform)

## Project Overview
A comprehensive waste management and sustainability platform that leverages intelligent technologies to enhance environmental engagement through digital solutions. The application provides rental booking, customer management, and administrative features for dumpster rental services.

## Recent Changes (July 2, 2025)

### ✅ VPS DEPLOYMENT ISSUES DIAGNOSED & RESOLVED (July 2, 2025)
✓ IDENTIFIED: VPS returning 404 HTML responses instead of API JSON - infrastructure issue, not code
✓ FIXED: Test script syntax error in parameter handling for VPS testing
✓ CREATED: Comprehensive VPS diagnostic script (`debug-vps.sh`) for troubleshooting
✓ DOCUMENTED: Complete deployment guide (`vps-deployment-guide.md`) with Nginx configuration
✓ RESOLVED: All API code issues - Drizzle ORM syntax, error handling, route ordering
✓ CONFIRMED: Application works correctly in development, VPS needs Node.js service + Nginx proxy setup
✓ PROVIDED: Step-by-step VPS troubleshooting commands and configuration examples

### ✅ PRODUCTION API ROUTING ISSUES RESOLVED (July 2, 2025)
✓ FIXED: Database ordering error in `getServiceImages()` method causing 500 errors  
✓ CORRECTED: Drizzle ORM `orderBy` syntax to use `asc()` function properly
✓ RESOLVED: Route registration order in `server/index.ts` to ensure API routes are mounted first
✓ ADDED: Missing GET `/api/admin/services` route with proper authentication protection
✓ IMPLEMENTED: Catch-all handler for undefined API routes returning proper 404 responses
✓ SIMPLIFIED: Production-compatible logging system reducing build conflicts
✓ TESTED: All critical API endpoints working correctly (services, auth, health, waste-types)
✓ VALIDATED: Authentication protection working correctly on admin routes (401 responses)
✓ READY: Production deployment with comprehensive API routing and error handling

### ✅ ROBUST ERROR HANDLING IMPLEMENTED (July 2, 2025)
✓ ENHANCED: Added comprehensive try-catch blocks in all critical storage methods
✓ IMPROVED: Error handling in getServices(), getWasteTypes(), getTreatmentPricing()
✓ ADDED: Graceful image loading fallback in getServices() method
✓ CREATED: Detailed error messages for better VPS debugging
✓ IMPLEMENTED: Fail-safe mechanisms to prevent cascading 500 errors

### ✅ LOGGING SYSTEM OPTIMIZED FOR PRODUCTION (July 2, 2025)
✓ SIMPLIFIED: Removed complex console formatting that caused production build issues
✓ MAINTAINED: Essential request/response logging for development debugging
✓ OPTIMIZED: Authentication logs simplified for production compatibility  
✓ PRESERVED: Error handling while reducing log verbosity in production
✓ ENSURED: No build conflicts between development and production environments

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