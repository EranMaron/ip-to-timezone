# IP to Country & Time Lookup

[![CI](https://github.com/EranMaron/ip-to-timezone/actions/workflows/ci.yml/badge.svg)](https://github.com/EranMaron/ip-to-timezone/actions/workflows/ci.yml)

A simple React application that lets you look up country information and local time for multiple IP addresses at once.

## Quick Start

```bash
# Clone the repository
git clone https://github.com/EranMaron/ip-to-timezone.git

# Navigate to project directory
cd ip-to-timezone

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## Features

- Enter multiple IPv4 or IPv6 addresses
- Get country information with flag for each IP
- See real-time local time based on the IP's timezone
- Sync all IPs at once or update them individually
- Add and remove IP entries as needed
- Automatically saves your IP list to localStorage for persistence

## Development

```bash
# Tests
npm test                  # Run tests
npm run test:coverage     # Coverage report

# Quality
npm run type-check        # TypeScript
npm run lint             # ESLint
```

## Known Limitations

- IP-API service has rate limits (free tier)
- No handling of daylight saving time changes
- Time displayed in 24-hour format only

## Tech Stack

- React + TypeScript
- Vite + Vitest
- React Hook Form
- CSS Modules
- GitHub Actions CI/CD
