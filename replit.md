# BennesPro - Location de Bennes (Waste Management Platform)

## Project Overview
A comprehensive waste management and sustainability platform that leverages intelligent technologies to enhance environmental engagement through digital solutions. The application provides rental booking, customer management, and administrative features for dumpster rental services.

## Recent Changes (December 30, 2024)
✓ Cleaned repository of deployment files and scripts
✓ Removed all temporary deployment configurations and troubleshooting scripts  
✓ Reset project to clean development state
✓ Application running in development mode on Replit
✓ Fixed missing asset reference causing build errors

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

## Environment Setup

### Required Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/database

# Authentication
JWT_SECRET=your-secure-jwt-secret
SESSION_SECRET=your-secure-session-secret

# Email Service
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_VERIFIED_SENDER_EMAIL=your-verified-email

# Google Maps
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Application
NODE_ENV=development
PORT=5000
REMONDIS_SALES_EMAIL=commercial@remondis.fr
```

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