import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  Platform
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Database from '../database/Database';
import theme, { commonStyles } from '../constants/theme';

const TaskHistoryScreen = ({ route, navigation }) => {
  const { routineId, taskId, taskName } = route.params;
  const [completions, setCompletions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const loadTaskHistory = async () => {
    try {
      setIsLoading(true);
      const history = await Database.getTaskHistory(routineId);
      const taskCompletions = history.filter(item => item.taskId === taskId);
      setCompletions(taskCompletions);
    } catch (error) {
      console.error('Error loading task history:', error);
      Alert.alert('Error', 'Failed to load task history');
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTaskHistory();
    }, [routineId, taskId])
  );

  const handleDeleteCompletion = (completion) => {
    Alert.alert(
      'Delete Record',
      'Are you sure you want to delete this completion record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await Database.deleteTaskCompletion(
                routineId, 
                taskId, 
                completion.completedAt
              );
              loadTaskHistory();
            } catch (error) {
              console.error('Error deleting completion:', error);
              Alert.alert('Error', 'Failed to delete completion record');
            }
          }
        }
      ]
    );
  };

  const handleAddCompletion = () => {
    setSelectedDate(new Date());
    if (Platform.OS === 'ios') {
      setModalVisible(true);
    } else {
      setShowDatePicker(true);
    }
  };

  const handleDateChange = (event, date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (date) {
        setSelectedDate(date);
        // For Android, we show confirmation directly after date selection
        confirmAddCompletion(date);
      }
    } else {
      // For iOS, we just update the date in the modal
      setSelectedDate(date || selectedDate);
    }
  };

  const confirmAddCompletion = async (dateToUse = selectedDate) => {
    try {
      await Database.completeTaskWithDate(routineId, taskId, dateToUse);
      setModalVisible(false);
      loadTaskHistory();
      Alert.alert('Success', 'Task completion added successfully');
    } catch (error) {
      console.error('Error adding completion:', error);
      Alert.alert('Error', 'Failed to add completion record');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderCompletionItem = ({ item }) => (
    <View style={styles.completionItem}>
      <View style={styles.completionInfo}>
        <Ionicons 
          name="checkmark-circle" 
          size={20} 
          color={theme.colors.success} 
          style={styles.icon}
        />
        <Text style={styles.completionDate}>
          {formatDate(item.completedAt)}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteCompletion(item)}
      >
        <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name="time-outline" 
        size={64} 
        color={theme.colors.textTertiary} 
      />
      <Text style={styles.emptyTitle}>No History</Text>
      <Text style={styles.emptyText}>
        This task hasn't been completed yet
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={commonStyles.containerPadded}>
      <View style={styles.header}>
        <Text style={styles.taskNameTitle}>{taskName}</Text>
        <View style={styles.completionCount}>
          <Text style={styles.countText}>
            Completed {completions.length} {completions.length === 1 ? 'time' : 'times'}
          </Text>
        </View>
      </View>

      <FlatList
        data={completions}
        renderItem={renderCompletionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyList}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddCompletion}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      {/* Date Picker Modal for iOS */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Select Completion Date</Text>
            
            <DateTimePicker
              value={selectedDate}
              mode="datetime"
              display="spinner"
              onChange={handleDateChange}
              style={styles.datePicker}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => confirmAddCompletion()}
              >
                <Text style={styles.buttonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Date Picker for Android */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="datetime"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  taskNameTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  completionCount: {
    backgroundColor: theme.colors.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  countText: {
    color: 'white',
    fontWeight: '500',
    fontSize: theme.fontSize.sm,
  },
  listContainer: {
    flexGrow: 1,
  },
  completionItem: {
    ...commonStyles.card,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  completionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  completionDate: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  deleteButton: {
    padding: theme.spacing.sm,
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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    ...theme.shadows.lg,
  },
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  datePicker: {
    width: '100%',
    height: 200,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: theme.spacing.lg,
  },
  modalButton: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    minWidth: '45%',
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: theme.colors.primary,
  },
  cancelButton: {
    backgroundColor: theme.colors.textTertiary,
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
  },
});

export default TaskHistoryScreen; 