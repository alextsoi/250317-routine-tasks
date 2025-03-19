import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Database from '../database/Database';
import theme, { commonStyles } from '../constants/theme';

const EditRoutineScreen = ({ route, navigation }) => {
  const { routineId, routine: routineData } = route.params || {};
  const [isLoading, setIsLoading] = useState(!!routineId);
  const [routine, setRoutine] = useState({
    name: '',
    description: '',
    tasks: []
  });
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [currentTask, setCurrentTask] = useState({
    id: null,
    name: '',
    description: ''
  });
  const [editingTaskIndex, setEditingTaskIndex] = useState(-1);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (routineId) {
      loadRoutine();
    }
  }, [routineId]);

  const loadRoutine = async () => {
    try {
      setIsLoading(true);
      const data = await Database.getRoutine(routineId);
      if (data) {
        setRoutine({
          id: data.id,
          name: data.name,
          description: data.description || '',
          tasks: data.tasks || []
        });
      } else {
        Alert.alert('Error', 'Routine not found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading routine:', error);
      Alert.alert('Error', 'Failed to load routine details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRoutine = async () => {
    if (!routine.name.trim()) {
      Alert.alert('Error', 'Please enter a routine name');
      return;
    }

    try {
      setIsSaving(true);
      const routineToSave = {
        ...routine,
        id: routine.id || Date.now().toString()
      };

      await Database.saveRoutine(routineToSave);
      console.log('Routine saved:', routineToSave);
      navigation.goBack();
    } catch (error) {
      console.error('Error saving routine:', error);
      Alert.alert('Error', 'Failed to save routine');
    } finally {
      setIsSaving(false);
    }
  };

  const openAddTaskModal = () => {
    setCurrentTask({ id: null, name: '', description: '' });
    setEditingTaskIndex(-1);
    setIsTaskModalVisible(true);
  };

  const openEditTaskModal = (task, index) => {
    setCurrentTask({ ...task });
    setEditingTaskIndex(index);
    setIsTaskModalVisible(true);
  };

  const handleSaveTask = () => {
    if (!currentTask.name.trim()) {
      Alert.alert('Error', 'Please enter a task name');
      return;
    }

    const updatedTasks = [...routine.tasks];
    const taskToSave = {
      ...currentTask,
      id: currentTask.id || Date.now().toString()
    };

    if (editingTaskIndex >= 0) {
      // Update existing task
      updatedTasks[editingTaskIndex] = taskToSave;
    } else {
      // Add new task
      updatedTasks.push(taskToSave);
    }

    setRoutine({ ...routine, tasks: updatedTasks });
    setIsTaskModalVisible(false);
  };

  const handleDeleteTask = (index) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedTasks = [...routine.tasks];
            updatedTasks.splice(index, 1);
            setRoutine({ ...routine, tasks: updatedTasks });
          }
        }
      ]
    );
  };

  const moveTask = (index, direction) => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === routine.tasks.length - 1)
    ) {
      return;
    }

    const updatedTasks = [...routine.tasks];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = updatedTasks[index];
    updatedTasks[index] = updatedTasks[newIndex];
    updatedTasks[newIndex] = temp;
    setRoutine({ ...routine, tasks: updatedTasks });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <View style={commonStyles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Routine Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Routine Information</Text>
            <View style={styles.formGroup}>
              <Text style={commonStyles.inputLabel}>Name</Text>
              <TextInput
                style={commonStyles.input}
                value={routine.name}
                onChangeText={(text) => setRoutine({ ...routine, name: text })}
                placeholder="Enter routine name"
                placeholderTextColor={theme.colors.textTertiary}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={commonStyles.inputLabel}>Description</Text>
              <TextInput
                style={[commonStyles.input, { height: 80 }]}
                value={routine.description}
                onChangeText={(text) => setRoutine({ ...routine, description: text })}
                placeholder="Enter routine description (optional)"
                placeholderTextColor={theme.colors.textTertiary}
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Tasks Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tasks</Text>
              <TouchableOpacity
                style={styles.addTaskButton}
                onPress={openAddTaskModal}
              >
                <Ionicons name="add" size={20} color="white" />
                <Text style={styles.addTaskButtonText}>Add Task</Text>
              </TouchableOpacity>
            </View>

            {routine.tasks.length === 0 ? (
              <View style={styles.emptyTasksContainer}>
                <Ionicons name="list-outline" size={48} color={theme.colors.textTertiary} />
                <Text style={styles.emptyTasksText}>No tasks added yet</Text>
                <Text style={styles.emptyTasksSubtext}>Add some tasks to your routine</Text>
              </View>
            ) : (
              routine.tasks.map((task, index) => (
                <View key={task.id || index} style={styles.taskItem}>
                  <View style={styles.taskNumberContainer}>
                    <Text style={styles.taskNumber}>{index + 1}</Text>
                  </View>
                  <View style={styles.taskContent}>
                    <Text style={styles.taskName}>{task.name}</Text>
                    {task.description ? (
                      <Text style={styles.taskDescription}>{task.description}</Text>
                    ) : null}
                  </View>
                  <View style={styles.taskActions}>
                    <TouchableOpacity
                      style={styles.taskButton}
                      onPress={() => moveTask(index, 'up')}
                      disabled={index === 0}
                    >
                      <Ionicons 
                        name="chevron-up" 
                        size={18} 
                        color={index === 0 ? theme.colors.textTertiary : theme.colors.text} 
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.taskButton}
                      onPress={() => moveTask(index, 'down')}
                      disabled={index === routine.tasks.length - 1}
                    >
                      <Ionicons 
                        name="chevron-down" 
                        size={18} 
                        color={index === routine.tasks.length - 1 ? theme.colors.textTertiary : theme.colors.text} 
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.taskButton}
                      onPress={() => openEditTaskModal(task, index)}
                    >
                      <Ionicons name="pencil" size={18} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.taskButton}
                      onPress={() => handleDeleteTask(index)}
                    >
                      <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveRoutine}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="white" />
                <Text style={styles.saveButtonText}>Save Routine</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>

        {/* Task Modal */}
        <Modal
          visible={isTaskModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setIsTaskModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingTaskIndex >= 0 ? 'Edit Task' : 'Add Task'}
                </Text>
                <TouchableOpacity
                  onPress={() => setIsTaskModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
              <View style={styles.modalBody}>
                <View style={styles.formGroup}>
                  <Text style={commonStyles.inputLabel}>Task Name</Text>
                  <TextInput
                    style={commonStyles.input}
                    value={currentTask.name}
                    onChangeText={(text) => setCurrentTask({ ...currentTask, name: text })}
                    placeholder="Enter task name"
                    placeholderTextColor={theme.colors.textTertiary}
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={commonStyles.inputLabel}>Description (Optional)</Text>
                  <TextInput
                    style={[commonStyles.input, { height: 80 }]}
                    value={currentTask.description}
                    onChangeText={(text) => setCurrentTask({ ...currentTask, description: text })}
                    placeholder="Enter task description"
                    placeholderTextColor={theme.colors.textTertiary}
                    multiline
                    textAlignVertical="top"
                  />
                </View>
              </View>
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[commonStyles.buttonSecondary, styles.modalButton]}
                  onPress={() => setIsTaskModalVisible(false)}
                >
                  <Text style={commonStyles.buttonTextDark}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[commonStyles.buttonPrimary, styles.modalButton]}
                  onPress={handleSaveTask}
                >
                  <Text style={commonStyles.buttonText}>Save Task</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    padding: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  formGroup: {
    marginBottom: theme.spacing.md,
  },
  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  addTaskButtonText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: theme.spacing.xs,
  },
  taskItem: {
    ...commonStyles.card,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  taskNumberContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  taskNumber: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: theme.fontSize.sm,
  },
  taskContent: {
    flex: 1,
  },
  taskName: {
    fontSize: theme.fontSize.md,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  taskDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  taskActions: {
    flexDirection: 'row',
  },
  taskButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.xs,
  },
  saveButton: {
    ...commonStyles.buttonPrimary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
    marginVertical: theme.spacing.xl,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: theme.fontSize.md,
    marginLeft: theme.spacing.sm,
  },
  emptyTasksContainer: {
    padding: theme.spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  emptyTasksText: {
    fontSize: theme.fontSize.lg,
    fontWeight: '500',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  emptyTasksSubtext: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
  },
  modalBody: {
    padding: theme.spacing.md,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  modalButton: {
    minWidth: 100,
    marginLeft: theme.spacing.md,
  },
});

export default EditRoutineScreen; 