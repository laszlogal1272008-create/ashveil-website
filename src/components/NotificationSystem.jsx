import React, { useState, useEffect } from 'react';
import { ChallengeHistoryManager } from '../data/ChallengeHistoryManager';
import './NotificationSystem.css';

function NotificationSystem() {
  const [historyManager] = useState(() => new ChallengeHistoryManager());
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Load existing notifications
    loadNotifications();
    
    // Check for notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [historyManager]);

  const loadNotifications = () => {
    const activeNotifications = historyManager.getActiveNotifications();
    setNotifications(activeNotifications);
  };

  const dismissNotification = (notificationId) => {
    historyManager.dismissNotification(notificationId);
    loadNotifications();
  };

  const dismissAllNotifications = () => {
    notifications.forEach(notification => {
      historyManager.dismissNotification(notification.id);
    });
    loadNotifications();
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'challenge_update': return '🎯';
      case 'challenge_scheduled': return '⏰';
      case 'challenge_cancelled': return '🚫';
      case 'admin_action': return '🔒';
      default: return '📢';
    }
  };

  const getNotificationColor = (type) => {
    switch(type) {
      case 'challenge_update': return '#32CD32';
      case 'challenge_scheduled': return '#FFD700';
      case 'challenge_cancelled': return '#DC143C';
      case 'admin_action': return '#87CEEB';
      default: return '#4CAF50';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-system">
      <div className="notification-header">
        <span className="notification-count">
          {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
        </span>
        <button 
          className="dismiss-all-btn"
          onClick={dismissAllNotifications}
          title="Dismiss all notifications"
        >
          Clear All
        </button>
      </div>
      
      <div className="notifications-container">
        {notifications.map(notification => (
          <div 
            key={notification.id}
            className={`notification-item ${notification.type}`}
            style={{ borderLeftColor: getNotificationColor(notification.type) }}
          >
            <div className="notification-content">
              <div className="notification-header-item">
                <span className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </span>
                <span className="notification-title">{notification.title}</span>
                <span className="notification-time">
                  {formatTimeAgo(notification.timestamp)}
                </span>
              </div>
              
              <div className="notification-message">
                {notification.message}
              </div>
              
              {notification.details && (
                <div className="notification-details">
                  {notification.details}
                </div>
              )}
            </div>
            
            <button 
              className="dismiss-btn"
              onClick={() => dismissNotification(notification.id)}
              title="Dismiss notification"
            >
              ✖
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NotificationSystem;