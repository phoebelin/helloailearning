/**
 * Utility functions for tracking completed activities
 * Stores completed activity IDs in localStorage
 */

const COMPLETED_ACTIVITIES_KEY = 'completed-activities';

export interface CompletedActivity {
  id: string;
  completedAt: number;
}

/**
 * Get all completed activities
 */
export function getCompletedActivities(): CompletedActivity[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(COMPLETED_ACTIVITIES_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Failed to load completed activities from localStorage:', error);
    return [];
  }
}

/**
 * Get the count of completed activities
 */
export function getCompletedActivitiesCount(): number {
  return getCompletedActivities().length;
}

/**
 * Mark an activity as completed
 * @param activityId - Unique identifier for the activity (e.g., 'how-machines-learn')
 */
export function markActivityAsCompleted(activityId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const completed = getCompletedActivities();
    
    // Check if already completed to avoid duplicates
    if (completed.some(activity => activity.id === activityId)) {
      return;
    }
    
    const newActivity: CompletedActivity = {
      id: activityId,
      completedAt: Date.now(),
    };
    
    const updated = [...completed, newActivity];
    localStorage.setItem(COMPLETED_ACTIVITIES_KEY, JSON.stringify(updated));
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('activity-completed', { detail: { activityId } }));
  } catch (error) {
    console.warn('Failed to save completed activity to localStorage:', error);
  }
}

/**
 * Check if an activity is completed
 */
export function isActivityCompleted(activityId: string): boolean {
  return getCompletedActivities().some(activity => activity.id === activityId);
}

/**
 * Clear all completed activities (useful for testing/reset)
 */
export function clearCompletedActivities(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(COMPLETED_ACTIVITIES_KEY);
}

