# IP to Country & Time Lookup

[![CI](https://github.com/EranMaron/ip-to-country/actions/workflows/ci.yml/badge.svg)](https://github.com/EranMaron/ip-to-country/actions/workflows/ci.yml)

A simple React application that lets you look up country information and local time for multiple IP addresses at once. Built with React, TypeScript, and Vite.

## What does it do?

This app allows you to:
- Enter multiple IPv4 or IPv6 addresses
- Get country information with flag for each IP
- See real-time local time based on the IP's timezone
- Sync all IPs at once or update them individually
- Add and remove IP entries as needed

## Getting Started

1. Clone the repo
```bash
git clone <your-repo-url>
cd ip-to-country
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

The app should now be running at http://localhost:5173

## Build for Production

To create a production build:
```bash
npm run build
```

The built files will be in the `dist` directory. You can preview the production build with:
```bash
npm run preview
```

## Good to Know

- The app uses the free IP-API service (http://ip-api.com) which has some rate limits
- Country flags are loaded from flagcdn.com
- Time updates every second, but only when there's at least one valid IP with timezone info
- Both IPv4 and IPv6 addresses are supported
- The app doesn't store any data - everything is in-memory only

## Assumptions & Limitations

- The IP-API service is assumed to be available and working
- No authentication is required to use the service
- The service might have rate limits that could affect functionality
- Internet connection is required for IP lookups and flag images
- The app assumes the user's browser supports modern JavaScript features
- Time is displayed in 24-hour format

## Development

The project uses:
- React 19
- TypeScript
- Vite
- React Hook Form for form handling
- CSS Modules for styling

To run linting:
```bash
npm run lint
```

To run type checking:
```bash
npm run type-check
```

### Testing

The project uses Vitest for testing. To run tests:

```bash
# Run tests in watch mode
npm test

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

Coverage thresholds are set to 80% for:
- Branches
- Functions
- Lines
- Statements

## API Notes

The app uses two endpoints from IP-API:
- Single IP lookup: http://ip-api.com/json/{ip}
- Batch IP lookup: http://ip-api.com/batch

Both endpoints return country, country code, and timezone information.
