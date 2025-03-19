import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet, Text, Platform, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import HomeScreen from './screens/HomeScreen';
import RoutineDetailScreen from './screens/RoutineDetailScreen';
import EditRoutineScreen from './screens/EditRoutineScreen';
import CalendarScreen from './screens/CalendarScreen';
import TaskHistoryScreen from './screens/TaskHistoryScreen';

// Import database
import Database from './database/Database';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [dbInitialized, setDbInitialized] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Initializing database...');
        
        // Initialize the database
        await Database.initDatabase();
        setDbInitialized(true);
        console.log('Database initialized successfully');
      } catch (error) {
        console.error('Failed to initialize database:', error);
        setError(error.message || 'An unknown error occurred');
        
        // Show error alert
        Alert.alert(
          'Database Error',
          'There was a problem initializing the database: ' + (error.message || 'Unknown error'),
          [{ text: 'OK' }]
        );
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Database Error</Text>
        <Text style={styles.errorDetails}>{error}</Text>
        <Text style={styles.errorHelp}>Please restart the application or contact support.</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#6366f1',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={({ navigation }) => ({ 
            title: 'My Routines',
            headerRight: () => (
              <TouchableOpacity
                onPress={() => navigation.navigate('Calendar')}
                style={{ marginRight: 10 }}
              >
                <Ionicons name="calendar-outline" size={24} color="#fff" />
              </TouchableOpacity>
            ),
          })} 
        />
        <Stack.Screen 
          name="RoutineDetail" 
          component={RoutineDetailScreen} 
          options={({ route }) => ({ title: route.params?.name || 'Routine Details' })} 
        />
        <Stack.Screen 
          name="EditRoutine" 
          component={EditRoutineScreen} 
          options={({ route }) => ({ 
            title: route.params?.id ? 'Edit Routine' : 'New Routine'
          })} 
        />
        <Stack.Screen 
          name="Calendar" 
          component={CalendarScreen} 
          options={{ title: 'Calendar View' }} 
        />
        <Stack.Screen 
          name="TaskHistory" 
          component={TaskHistoryScreen} 
          options={({ route }) => ({ title: `${route.params?.taskName || 'Task'} History` })} 
        />
      </Stack.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorDetails: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
  errorHelp: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
}); 