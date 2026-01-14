// Browser notification utilities for night mode

export type NotificationPermission = 'granted' | 'denied' | 'default';

/**
 * Check if the browser supports notifications
 */
export function isNotificationSupported(): boolean {
  return 'Notification' in window;
}

/**
 * Get the current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied';
  
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  
  const permission = await Notification.requestPermission();
  return permission;
}

/**
 * Send a notification when night mode starts
 */
export function sendNightModeNotification(): void {
  if (!isNotificationSupported()) return;
  if (Notification.permission !== 'granted') return;
  
  const notification = new Notification('🌙 夜モード開始', {
    body: '寝る準備を始める時間です。',
    icon: '/favicon.ico',
    tag: 'night-mode-start', // Prevents duplicate notifications
    requireInteraction: false,
  });
  
  // Auto-close after 5 seconds
  setTimeout(() => notification.close(), 5000);
  
  // Focus the app when clicked
  notification.onclick = () => {
    window.focus();
    notification.close();
  };
}

/**
 * Check if notification was already sent for today
 */
export function wasNotificationSentToday(): boolean {
  const lastSent = localStorage.getItem('nightModeNotificationDate');
  const today = new Date().toISOString().split('T')[0];
  return lastSent === today;
}

/**
 * Mark notification as sent for today
 */
export function markNotificationSent(): void {
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem('nightModeNotificationDate', today);
}
