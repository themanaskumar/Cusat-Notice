# CUSAT Digital Notice Board

A modern digital notice board application for Cochin University of Science and Technology (CUSAT) built with the MERN stack.

## Features

- User Authentication (Students, Faculty, and Administrator)
- Email Verification with OTP
- Faculty Account Verification by Administrator
- Notice Board System with filtering options
- Event Calendar with detailed event information
- Department-wise Notice Management
- File Upload Support for Notices and Events (PDFs, images, documents)
- Secure Email Domain Restriction (@cusat.ac.in)
- Password Reset and Change
- Admin Dashboard with search and filtering capabilities
- Confirmation dialogs for critical actions
- Responsive design for mobile and desktop

## User Roles

### Students
- View notices and events
- Filter notices by department and type
- View event details
- Download attachments from notices and events

### Faculty
- Create and manage notices
- Create and manage events
- Upload files with notices and events (up to 2 files, 5MB each)
- Departmental content management
- Change account password

### Administrators
- Approve/reject faculty verification requests
- User management with search functionality
- Create and manage notices and events
- System-wide content moderation
- View and manage file attachments

## Tech Stack

- Frontend: React.js
- Backend: Node.js with Express
- Database: MongoDB
- Authentication: JWT
- File Storage: Local filesystem
- Email Service: Nodemailer
- UI Framework: Material-UI

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Project Structure

```
cusat-notice/
├── client/                 # Frontend React application
│   ├── public/             # Static files
│   └── src/
│       ├── components/     # React components
│       │   ├── admin/      # Admin-specific components
│       │   ├── auth/       # Authentication components
│       │   ├── events/     # Event-related components
│       │   ├── faculty/    # Faculty-specific components
│       │   ├── layout/     # Layout components (Navbar, Footer)
│       │   ├── notices/    # Notice-related components
│       │   ├── pages/      # Page components
│       │   └── routing/    # Routing components
│       ├── contexts/       # React contexts (Auth, etc.)
│       ├── utils/          # Utility functions
│       └── App.js          # Main application component
├── server/                 # Backend Node.js application
│   ├── uploads/            # Uploaded files storage
│   └── src/
│       ├── controllers/    # Request handlers
│       ├── middleware/     # Express middleware
│       ├── models/         # Mongoose models
│       ├── routes/         # API routes
│       ├── config/         # Configuration files
│       └── utils/          # Utility functions
└── README.md
```

## Setup Instructions

1. Clone the repository
   ```bash
   # Clone the repository using the following link
   https://github.com/themanaskumar/Cusat-Notice.git
   ```
2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. Create a `.env` file in the server directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_uri
   PORT=5000
   BASE_URL=http://localhost:5000
   JWT_SECRET=your_jwt_secret
   SMTP_HOST=your_smtp_host
   SMTP_PORT=your_smtp_port
   SMTP_USER=your_smtp_user
   SMTP_PASS=your_smtp_password
   ```

4. Start the development servers:
   ```bash
   # Start backend server
   cd server
   npm run dev

   # Start frontend server
   cd client
   npm start

   # Both frontend and backend servers should be satrted in seperate terminals
   ```

## API Endpoints

### Authentication
- POST /api/auth/register/student - Register a new student
- POST /api/auth/register/faculty - Register a new faculty member
- POST /api/auth/login - User login
- POST /api/auth/verify-email - Verify email with OTP
- POST /api/auth/resend-verification - Resend verification email
- GET /api/auth/me - Get current authenticated user
- POST /api/auth/forgot-password - Request password reset OTP
- POST /api/auth/reset-password - Reset password with OTP
- POST /api/auth/change-password - Change password (authenticated users)

### Notices
- GET /api/notices - Get all notices with optional filters
- POST /api/notices - Create a new notice with optional file uploads
- GET /api/notices/:id - Get notice details
- PUT /api/notices/:id - Update notice
- DELETE /api/notices/:id - Delete notice

### Events
- GET /api/events - Get all events with optional filters
- POST /api/events - Create a new event with optional file uploads
- GET /api/events/:id - Get event details
- PUT /api/events/:id - Update event
- DELETE /api/events/:id - Delete event

### Admin
- GET /api/admin/pending-faculty - Get pending faculty verification requests
- PUT /api/admin/verify-faculty/:id - Approve faculty verification
- PUT /api/admin/reject-faculty/:id - Reject faculty verification
- GET /api/admin/users - Get all users with search and filter options
- GET /api/admin/faculty - Get all faculty users
- GET /api/admin/students - Get all student users

## File Storage
- Files are stored in the server/uploads directory
- Each file is renamed with a unique identifier to prevent conflicts
- File references are stored in the database along with original filenames
- Files are automatically cleaned up when associated content is deleted

## Current Project Status
- Basic authentication system: ✅ Complete
- User management: ✅ Complete
- Faculty verification: ✅ Complete
- Notice board: ✅ Complete with file uploads
- Event management: ✅ Complete with file uploads
- Admin dashboard: ✅ Complete
- Password reset/change: ✅ Complete

## Features in Development
- Notification system
- Mobile application
- Calendar integration with external calendars
- Advanced search capabilities
- User profile management
- Role-based access control refinements

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 

## Contact me
Contact me on my email: themanaskumar1@gmail.com