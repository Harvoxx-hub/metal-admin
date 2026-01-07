# Metal Admin Dashboard

A clean, minimal admin dashboard for managing the Metal social networking platform. Built with Next.js 14 (App Router), TypeScript, and Tailwind CSS.

## Features

### MVP Implementation

- **Dashboard Overview**: Metrics cards, activity charts, and recent activities
- **User Management**: User list with search, filters, and detailed user profiles
- **Thoughts Management**: Thought moderation with filtering, search, and delete functionality
- **Authentication UI**: Login and signup pages (ready for backend integration)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── dashboard/       # Dashboard overview page
│   ├── users/          # User management page
│   ├── thoughts/       # Thoughts management page
│   ├── login/          # Login page
│   ├── signup/         # Signup page
│   ├── layout.tsx      # Root layout
│   └── globals.css     # Global styles
├── components/
│   ├── Sidebar.tsx     # Navigation sidebar
│   └── Header.tsx      # Page header component
└── lib/
    └── mockData.ts     # Mock data and API functions
```

## Design

- **Color Scheme**: Black and white only (black text on white background)
- **Style**: Simple, straightforward, minimal
- **Responsive**: Works on mobile, tablet, and desktop

## Backend Integration

The project currently uses mock data. To integrate with your backend API:

1. Update the functions in `lib/mockData.ts` to call your actual API endpoints
2. Replace mock API calls with real HTTP requests (using `fetch` or a library like `axios`)
3. Update data types to match your API response structure

## Technology Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: Chart visualization library

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Next Steps

- Integrate authentication with backend
- Connect API endpoints for data fetching
- Add error handling and loading states
- Implement additional features from FEATURES.md



# metal-admin
