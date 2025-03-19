import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  ScrollView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Database from '../database/Database';
import theme, { commonStyles } from '../constants/theme';

// Helper function to generate days for a given month
const getDaysInMonth = (month, year) => {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  
  // Determine the number of days from previous month to show
  const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Determine the number of days from next month to show
  const totalDaysToShow = 42; // 6 rows of 7 days
  const daysFromNextMonth = totalDaysToShow - (firstDayOfWeek + daysInMonth);
  
  const days = [];
  
  // Add days from previous month
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevMonthYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = new Date(prevMonthYear, prevMonth + 1, 0).getDate();
  
  for (let i = 0; i < firstDayOfWeek; i++) {
    const day = daysInPrevMonth - firstDayOfWeek + i + 1;
    days.push({
      date: new Date(prevMonthYear, prevMonth, day),
      day,
      month: prevMonth,
      year: prevMonthYear,
      isCurrentMonth: false,
    });
  }
  
  // Add days from current month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: new Date(year, month, i),
      day: i,
      month,
      year,
      isCurrentMonth: true,
    });
  }
  
  // Add days from next month
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextMonthYear = month === 11 ? year + 1 : year;
  
  for (let i = 1; i <= daysFromNextMonth; i++) {
    days.push({
      date: new Date(nextMonthYear, nextMonth, i),
      day: i,
      month: nextMonth,
      year: nextMonthYear,
      isCurrentMonth: false,
    });
  }
  
  return days;
};

const CalendarScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [days, setDays] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDateCompletions, setSelectedDateCompletions] = useState([]);
  
  const loadTaskHistories = useCallback(async () => {
    try {
      setIsLoading(true);
      const histories = await Database.getAllTaskHistories();
      setCompletions(histories);
      
      // Generate calendar days
      const calendarDays = getDaysInMonth(selectedMonth, selectedYear);
      setDays(calendarDays);
    } catch (error) {
      console.error('Error loading task histories:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, selectedYear]);
  
  useFocusEffect(
    useCallback(() => {
      loadTaskHistories();
    }, [loadTaskHistories])
  );
  
  // Get completions for a specific date
  const getCompletionsForDate = (date) => {
    // Create date string in format YYYY-MM-DD without time zone influence
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    return completions.filter(completion => {
      // Extract only the date part from completedAt
      const completionDate = completion.completedAt.substring(0, 10);
      return completionDate === dateString;
    });
  };
  
  const handleDayPress = (day) => {
    const selectedDate = day.date;
    setSelectedDate(selectedDate);
    
    const dateCompletions = getCompletionsForDate(selectedDate);
    
    // Group completions by routine
    const routineCompletions = {};
    dateCompletions.forEach(completion => {
      if (!routineCompletions[completion.routineId]) {
        routineCompletions[completion.routineId] = {
          routineId: completion.routineId,
          routineName: completion.routineName,
          completions: []
        };
      }
      routineCompletions[completion.routineId].completions.push(completion);
    });
    
    setSelectedDateCompletions(Object.values(routineCompletions));
    setIsModalVisible(true);
  };
  
  const handlePreviousMonth = () => {
    setSelectedMonth(prev => {
      if (prev === 0) {
        setSelectedYear(prevYear => prevYear - 1);
        return 11;
      }
      return prev - 1;
    });
  };
  
  const handleNextMonth = () => {
    setSelectedMonth(prev => {
      if (prev === 11) {
        setSelectedYear(prevYear => prevYear + 1);
        return 0;
      }
      return prev + 1;
    });
  };
  
  const formatDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };
  
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };
  
  const renderDayItem = ({ item }) => {
    const today = new Date();
    const isToday = 
      item.day === today.getDate() && 
      item.month === today.getMonth() && 
      item.year === today.getFullYear();
    
    const dayCompletions = getCompletionsForDate(item.date);
    const hasCompletions = dayCompletions.length > 0;
    
    return (
      <TouchableOpacity
        style={[
          styles.dayCell,
          !item.isCurrentMonth && styles.otherMonthDay,
          isToday && styles.today,
          hasCompletions && styles.hasCompletions
        ]}
        onPress={() => handleDayPress(item)}
      >
        <Text style={[
          styles.dayNumber,
          !item.isCurrentMonth && styles.otherMonthText,
          isToday && styles.todayText
        ]}>
          {item.day}
        </Text>
        
        {hasCompletions && (
          <View style={styles.completionIndicator}>
            <Text style={styles.completionCount}>{dayCompletions.length}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <View style={commonStyles.container}>
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={handlePreviousMonth}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.monthYear}>
          {monthNames[selectedMonth]} {selectedYear}
        </Text>
        <TouchableOpacity onPress={handleNextMonth}>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.daysOfWeek}>
        {dayNames.map((day, index) => (
          <Text key={index} style={styles.dayName}>
            {day}
          </Text>
        ))}
      </View>
      
      <FlatList
        data={days}
        renderItem={renderDayItem}
        keyExtractor={(item, index) => `${item.year}-${item.month}-${item.day}-${index}`}
        numColumns={7}
        scrollEnabled={false}
      />
      
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedDate ? formatDate(selectedDate) : ''}
              </Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {selectedDateCompletions.length === 0 ? (
                <View style={styles.emptyCompletions}>
                  <Ionicons name="calendar-outline" size={48} color={theme.colors.textTertiary} />
                  <Text style={styles.emptyTitle}>No completions</Text>
                  <Text style={styles.emptyText}>No tasks completed on this day</Text>
                </View>
              ) : (
                selectedDateCompletions.map((routine, index) => (
                  <View key={index} style={styles.routineSection}>
                    <Text style={styles.routineName}>{routine.routineName}</Text>
                    
                    {routine.completions.map((completion, i) => (
                      <View key={i} style={styles.completionItem}>
                        <View style={styles.completionInfo}>
                          <Ionicons 
                            name="checkmark-circle" 
                            size={18} 
                            color={theme.colors.success} 
                            style={styles.completionIcon}
                          />
                          <Text style={styles.taskName}>
                            {completion.taskName || 'Unknown Task'}
                          </Text>
                        </View>
                        <Text style={styles.completionTime}>
                          {formatTime(completion.completedAt)}
                        </Text>
                      </View>
                    ))}
                  </View>
                ))
              )}
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={commonStyles.buttonPrimary}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={commonStyles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.card,
    ...theme.shadows.sm,
  },
  monthYear: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
  },
  daysOfWeek: {
    flexDirection: 'row',
    backgroundColor: theme.colors.secondary,
    padding: theme.spacing.sm,
  },
  dayName: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '500',
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
    position: 'relative',
  },
  dayNumber: {
    fontSize: theme.fontSize.md,
    fontWeight: '500',
    color: theme.colors.text,
  },
  otherMonthDay: {
    backgroundColor: theme.colors.secondary,
  },
  otherMonthText: {
    color: theme.colors.textTertiary,
  },
  today: {
    backgroundColor: theme.colors.primary + '20',
  },
  todayText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  hasCompletions: {
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.success,
  },
  completionIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: theme.colors.success,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completionCount: {
    color: 'white',
    fontSize: theme.fontSize.xs,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
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
    maxHeight: 400,
  },
  modalFooter: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    alignItems: 'center',
  },
  routineSection: {
    marginBottom: theme.spacing.lg,
  },
  routineName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  completionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  completionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completionIcon: {
    marginRight: theme.spacing.sm,
  },
  taskName: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  completionTime: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  emptyCompletions: {
    padding: theme.spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '500',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default CalendarScreen; 