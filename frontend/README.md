# Resume AI

Resume AI is a web application that helps users upload, parse, analyze, and optimize their resumes using AI technology.

## Features

- User authentication with JWT
- Resume upload (PDF/DOCX)
- Resume parsing and content extraction
- AI-powered resume analysis
- User profile management
- Admin dashboard for user management and system logs

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Authentication**: JWT (Access & Refresh Tokens)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/resume-ai.git
   cd resume-ai
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Create a `.env.local` file based on `.env.example`:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

4. Update the environment variables in `.env.local` with your configuration.

5. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

- `NEXT_PUBLIC_API_URL`: URL of the backend API
- `NEXT_PUBLIC_AUTH_ENABLED`: Enable/disable authentication (true/false)
- `NEXT_PUBLIC_ENABLE_ADMIN_FEATURES`: Enable/disable admin features (true/false)

## Docker

You can also run the application using Docker:

\`\`\`bash
docker-compose up -d
\`\`\`

## API Endpoints

The application interacts with the following API endpoints:

### Authentication
- `POST /api/auth/register/` - Register user
- `POST /api/auth/token/` - Obtain access and refresh tokens
- `POST /api/auth/token/refresh/` - Refresh access token

### User Profile
- `GET /api/profiles/me/` - Get current user's profile
- `PUT/PATCH /api/profiles/update_me/` - Update current user's profile

### Resumes
- `POST /api/resumes/upload/` - Upload a resume file
- `GET /api/resumes/` - List my uploaded resumes
- `GET /api/resumes/{resume_id}/content/` - Get parsed resume content
- `POST /api/resumes/{resume_id}/parse/` - Parse resume file
- `POST /api/resumes/{resume_id}/analyze/` - Analyze parsed resume

### Admin Endpoints (Optional)
- `GET /api/users/` - List users (Admin)
- `GET /api/users/{id}/` - Retrieve user by ID (Admin)
- `PATCH /api/users/{id}/` - Partially update user (Admin)
- `DELETE /api/users/{id}/` - Delete user (Admin)
- `GET /api/analytics/logs/` - View system logs (Admin)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
