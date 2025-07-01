# BennesPro - Location de Bennes (Waste Management Platform)

## Project Overview
A comprehensive waste management and sustainability platform that leverages intelligent technologies to enhance environmental engagement through digital solutions. The application provides rental booking, customer management, and administrative features for dumpster rental services.

## Recent Changes (January 1, 2025)

### ✅ PRODUCTION DEPLOYMENT READY (January 1, 2025)
✓ Complete production deployment system created
✓ Single-command deployment script (deploy-production.sh) 
✓ Automated build, transfer, and VPS configuration
✓ Full stack setup: Node.js, Nginx, PostgreSQL, PM2, SSL
✓ Database export and validation scripts included
✓ Production-ready with monitoring and auto-restart
✓ Target: VPS 162.19.67.3 with domain purpleguy.world

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
- User is frustrated with complex deployment failures - wants simple, working solutions

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
- User wants actual BennesPro application deployed, not generic placeholders
- Database configured: username: remondis_db, password: Remondis60110$
- Target deployment: VPS 162.19.67.3 with domain purpleguy.world