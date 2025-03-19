import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Database from '../database/Database';
import theme, { commonStyles } from '../constants/theme';

const HomeScreen = ({ navigation }) => {
  const [routines, setRoutines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRoutines = async () => {
    try {
      setIsLoading(true);
      const data = await Database.getRoutines();
      setRoutines(data);
    } catch (error) {
      console.error('Error loading routines:', error);
      Alert.alert('Error', 'Failed to load routines');
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRoutines();
    }, [])
  );

  const handleRoutinePress = (routine) => {
    navigation.navigate('RoutineDetail', { 
      routineId: routine.id,
      routineName: routine.name
    });
  };

  const handleAddRoutine = () => {
    navigation.navigate('EditRoutine');
  };

  const handleCalendarView = () => {
    navigation.navigate('Calendar');
  };

  const renderRoutineItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.routineCard}
      onPress={() => handleRoutinePress(item)}
    >
      <View style={styles.routineContent}>
        <Text style={styles.routineName}>{item.name}</Text>
        <Text style={styles.routineDescription} numberOfLines={2}>
          {item.description || 'No description'}
        </Text>
      </View>
      <Ionicons 
        name="chevron-forward" 
        size={24} 
        color={theme.colors.primary} 
      />
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name="list-outline" 
        size={64} 
        color={theme.colors.textTertiary} 
      />
      <Text style={styles.emptyTitle}>No Routines</Text>
      <Text style={styles.emptyText}>
        Create your first routine to get started
      </Text>
      <TouchableOpacity
        style={[commonStyles.buttonPrimary, styles.createButton]}
        onPress={handleAddRoutine}
      >
        <Text style={commonStyles.buttonText}>Create New Routine</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={commonStyles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={routines}
          renderItem={renderRoutineItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyList}
        />
      )}

      {routines.length > 0 && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddRoutine}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: theme.spacing.md,
    flexGrow: 1,
  },
  routineCard: {
    ...commonStyles.listItem,
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  routineContent: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  routineName: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  routineDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  createButton: {
    width: '100%',
    marginTop: theme.spacing.md,
  },
  addButton: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    right: theme.spacing.xl,
    backgroundColor: theme.colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
  },
});

export default HomeScreen; 