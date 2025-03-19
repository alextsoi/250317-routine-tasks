# Routine Tasks Mobile App

A mobile application for managing and tracking your daily routines and tasks, built with React Native and Expo.

## Current State

This project is a conversion of the desktop Electron application to a mobile app. The mobile app includes the following features:

- Create and manage routines with multiple tasks
- Mark tasks as complete
- View task completion history
- Calendar view to visualize completed tasks
- SQLite database for local data storage

The app has been set up with the following structure:

```
mobile-app/
├── assets/                # App icons and images
├── constants/
│   └── theme.js           # Theme definitions and common styles
├── database/
│   └── Database.js        # SQLite database operations
├── screens/
│   ├── HomeScreen.jsx     # Main routine list screen
│   ├── RoutineDetailScreen.jsx  # Routine details and tasks
│   ├── EditRoutineScreen.jsx    # Add/edit routines and tasks
│   ├── TaskHistoryScreen.jsx    # View task completion history
│   └── CalendarScreen.jsx       # Calendar view of completions
├── App.js                 # Main application and navigation setup
├── app.json               # Expo configuration
└── package.json           # Dependencies and scripts
```

## Features

- Create and manage routines with multiple tasks
- Mark tasks as complete
- View task completion history
- Calendar view to visualize completed tasks
- Simple and intuitive interface
- Local SQLite database for data persistence

## Screenshots

(Screenshots will be added once the app is built)

## Tech Stack

- React Native / Expo
- SQLite for local database
- React Navigation for routing
- Custom UI components
- Expo Vector Icons

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- iOS Simulator (for Mac users) or Android Emulator
- Physical device with Expo Go app (optional)

### Installation

1. Navigate to the mobile app directory
```bash
cd mobile-app
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm start
# or
yarn start
```

4. Run on a simulator or device
   - For iOS (Mac only): Press `i` in the terminal or click "Run on iOS simulator" in the Expo dev tools
   - For Android: Press `a` in the terminal or click "Run on Android device/emulator" in the Expo dev tools
   - On physical device: Scan the QR code using the Expo Go app

## Next Steps

- Add placeholder icons and splash screen in the assets directory
- Optimize database operations for better performance
- Enhance UI/UX with animations and transitions
- Add dark mode support
- Implement data backup and restore options

## Usage

### Creating a Routine

1. Open the app
2. Tap the "+" button on the home screen
3. Enter a name and description for your routine
4. Add tasks by clicking the "Add Task" button
5. Save your routine

### Completing Tasks

1. Open a routine from the home screen
2. Tap the "Complete" button next to a task
3. The task will be marked as completed for the current day

### Viewing Task History

1. Open a routine
2. Tap the "History" button next to a task
3. View all the times the task has been completed

### Calendar View

1. Tap the "Calendar" button on the home screen
2. Navigate between months
3. Days with completed tasks will be highlighted
4. Tap on a day to see which tasks were completed on that day

## Data Storage

All data is stored locally on your device using SQLite. No data is sent to external servers.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Expo](https://expo.dev/) for the fantastic React Native development platform
- [React Navigation](https://reactnavigation.org/) for navigation solutions
- [SQLite](https://www.sqlite.org/) for local data storage
