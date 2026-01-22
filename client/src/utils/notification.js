// Notification utility for chat app

// Create audio context for notification sound
let audioContext = null;
let notificationSound = null;

// Initialize notification sound
const initNotificationSound = () => {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create a simple beep sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    notificationSound = { oscillator, gainNode };
  } catch (error) {
    console.log('Audio context not supported');
  }
};

// Play notification sound
export const playNotificationSound = () => {
  if (!audioContext || !notificationSound) {
    initNotificationSound();
  }
  
  if (notificationSound) {
    try {
      notificationSound.oscillator.start();
      notificationSound.oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.log('Could not play notification sound');
    }
  }
};

// Request browser notification permission
export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

// Show browser notification
export const showBrowserNotification = (title, body, icon = null) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: icon || '/vite.svg',
      badge: '/vite.svg',
      tag: 'chitchat-notification'
    });
  }
};

// Initialize notifications
export const initNotifications = () => {
  initNotificationSound();
  requestNotificationPermission();
}; 