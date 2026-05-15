# Field App - Frontend

React + Vite + TypeScript frontend application for the Field App project.

## Features

- ✅ React 18 with TypeScript
- ✅ Vite for fast development and optimized builds
- ✅ Redux Toolkit for state management
- ✅ React Router for navigation
- ✅ React Hook Form for form handling
- ✅ Zod for schema validation
- ✅ Axios for API requests
- ✅ Bootstrap for responsive design
- ✅ ESLint and TypeScript for code quality

## Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── common/          # Reusable UI components (Button, Input, Card)
│   │   ├── layout/          # Layout components (Layout, Navigation, Sidebar)
│   │   └── ProtectedRoute.tsx
│   ├── pages/               # Page components
│   │   ├── Login/
│   │   ├── Dashboard/
│   │   ├── PTP/
│   │   ├── CrewSignIn/
│   │   └── NotFound/
│   ├── services/            # API and external services
│   │   └── api.ts           # API client
│   ├── store/               # Redux store
│   │   ├── index.ts         # Store configuration
│   │   ├── authSlice.ts     # Auth state
│   │   └── ptpSlice.ts      # PTP state
│   ├── types/               # TypeScript types and interfaces
│   ├── styles/              # Global styles
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Utility functions
│   ├── App.tsx              # Root component
│   └── main.tsx             # Entry point
├── public/                  # Static assets
├── index.html               # HTML template
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── eslint.config.js         # ESLint configuration
├── package.json             # Dependencies and scripts
└── README.md                # This file
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- Backend API running on `http://localhost:3000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```env
VITE_API_URL=http://localhost:3000
```

### Development

Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

Build for production:
```bash
npm run build
```

The production build will be in the `dist/` directory.

### Preview

Preview the production build locally:
```bash
npm run preview
```

### Linting

Check for code quality issues:
```bash
npm run lint
```

### Type Checking

Run TypeScript type checking:
```bash
npm run type-check
```

### Testing

Run tests:
```bash
npm run test
```

Run tests with UI:
```bash
npm run test:ui
```

Generate coverage report:
```bash
npm run test:coverage
```

### Formatting

Format code with Prettier:
```bash
npm run format
```

## API Integration

The frontend communicates with the backend API using the Axios client in `src/services/api.ts`.

### API Response Format

All API responses follow this format:
```typescript
{
  success: boolean
  status: number
  data?: T
  message?: string
  errors?: Record<string, string[]>
}
```

### Authentication

The app uses JWT tokens for authentication:
- Access token is stored in Redux store and localStorage
- Refresh token is handled automatically on 401 responses
- Add bearer token to all requests via request interceptor

## State Management

Redux Toolkit is used for state management with two main slices:

### Auth Slice (`src/store/authSlice.ts`)
- Manages user authentication state
- Stores user data, access token, and refresh token
- Handles login/logout/token refresh

### PTP Slice (`src/store/ptpSlice.ts`)
- Manages Pre-Task Plan state
- Handles CRUD operations for PTPs
- Manages filters and pagination

## Components

### Common Components
- **Button**: Reusable button component with variants and sizes
- **Input**: Reusable input component with validation
- **Card**: Reusable card component with header/footer

### Layout Components
- **Layout**: Main app layout with sidebar and main content
- **Navigation**: Top navigation bar with user info and logout
- **Sidebar**: Left sidebar with navigation links
- **ProtectedRoute**: Route wrapper for authentication

### Pages
- **Login**: User authentication page
- **Dashboard**: Main dashboard with stats and quick actions
- **PTP**: Pre-Task Plan list and form pages
- **CrewSignIn**: Crew sign-in page (stub)
- **NotFound**: 404 page

## Styling

- CSS Modules for component-scoped styles
- Global styles in `src/styles/globals.css`
- CSS variables for design system values
- Bootstrap utility classes
- Responsive design with mobile-first approach

## Environment Variables

```env
# API Configuration
VITE_API_URL=http://localhost:3000

# Application Settings
VITE_APP_NAME=Field App
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_DEBUG=false
VITE_ENABLE_ANALYTICS=false

# Theme Configuration
VITE_PRIMARY_COLOR=#007bff
VITE_SECONDARY_COLOR=#6c757d
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add new feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit a pull request

## License

Proprietary - Barton Malow Co.

## Support

For issues or questions, contact the development team.
