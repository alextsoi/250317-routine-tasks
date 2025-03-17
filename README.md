# Routine Tasks

A macOS desktop application for managing repeatable TODO lists with custom routines.

## Features

- Create multiple custom routines with repeatable tasks
- No fixed dates for task completion - focus on what's next in your sequence
- Track task completion history
- Simple and intuitive user interface
- Data stored locally on your machine

## Development

This application is built with:
- Electron
- React
- JavaScript

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```

### Building for Production

To build the application for macOS:

```
npm run build
```

The built application will be available in the `dist` directory.

## Data Storage

The application stores data in two main locations:

1. `data/` - Contains JSON files for each routine, with tasks and their details
2. `history/` - Contains JSON files tracking the completion history of tasks in each routine

## License

ISC 