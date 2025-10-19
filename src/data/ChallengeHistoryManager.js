// Challenge History Manager
// Tracks all admin changes to daily challenges with timestamps and admin info

export class ChallengeHistoryManager {
  constructor() {
    this.historyKey = 'challengeHistory';
    this.pendingKey = 'pendingChallengeUpdate';
    this.notificationKey = 'challengeNotification';
  }

  // Add a new history entry when admin makes changes
  addHistoryEntry(adminInfo, approvedChallenges, action = 'updated') {
    const history = this.getHistory();
    const entry = {
      id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      adminInfo: {
        code: adminInfo.code || 'Unknown',
        sessionId: adminInfo.sessionId || Date.now().toString(),
        userAgent: navigator.userAgent || 'Unknown Browser'
      },
      action: action, // 'updated', 'regenerated', 'approved'
      challengeCount: approvedChallenges.length,
      challenges: approvedChallenges.map(challenge => ({
        id: challenge.id,
        title: challenge.title,
        difficulty: challenge.difficulty,
        category: challenge.category,
        reward: challenge.reward,
        timeLimit: challenge.timeLimit
      })),
      scheduledFor: new Date(Date.now() + (5 * 60 * 60 * 1000)).toISOString(), // 5 hours from now
      status: 'pending' // 'pending', 'active', 'cancelled'
    };

    history.unshift(entry); // Add to beginning of array
    
    // Keep only last 50 entries to prevent storage overflow
    if (history.length > 50) {
      history.splice(50);
    }
    
    localStorage.setItem(this.historyKey, JSON.stringify(history));
    return entry;
  }

  // Get all history entries
  getHistory() {
    try {
      const history = localStorage.getItem(this.historyKey);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error loading challenge history:', error);
      return [];
    }
  }

  // Get filtered history by date range, admin, or action
  getFilteredHistory(filters = {}) {
    const history = this.getHistory();
    
    return history.filter(entry => {
      if (filters.startDate && new Date(entry.timestamp) < new Date(filters.startDate)) {
        return false;
      }
      if (filters.endDate && new Date(entry.timestamp) > new Date(filters.endDate)) {
        return false;
      }
      if (filters.adminCode && !entry.adminInfo.code.includes(filters.adminCode)) {
        return false;
      }
      if (filters.action && entry.action !== filters.action) {
        return false;
      }
      if (filters.status && entry.status !== filters.status) {
        return false;
      }
      return true;
    });
  }

  // Schedule pending challenge update
  schedulePendingUpdate(historyEntry) {
    const pendingUpdate = {
      historyId: historyEntry.id,
      scheduledTime: historyEntry.scheduledFor,
      challenges: historyEntry.challenges,
      status: 'scheduled'
    };
    
    localStorage.setItem(this.pendingKey, JSON.stringify(pendingUpdate));
    
    // Set timeout for 5 hours
    setTimeout(() => {
      this.executePendingUpdate();
    }, 5 * 60 * 60 * 1000);
    
    return pendingUpdate;
  }

  // Execute the pending update and create notification
  executePendingUpdate() {
    const pending = this.getPendingUpdate();
    if (!pending || pending.status !== 'scheduled') {
      return false;
    }

    // Update the challenges
    localStorage.setItem('dailyChallenges', JSON.stringify(pending.challenges));
    localStorage.setItem('challengesDate', new Date().toDateString());
    
    // Mark history entry as active
    const history = this.getHistory();
    const historyEntry = history.find(h => h.id === pending.historyId);
    if (historyEntry) {
      historyEntry.status = 'active';
      localStorage.setItem(this.historyKey, JSON.stringify(history));
    }

    // Create notification
    this.createNotification({
      type: 'challenge_update',
      title: '🎯 Daily Challenges Updated!',
      message: `${pending.challenges.length} new daily challenges are now available!`,
      timestamp: new Date().toISOString(),
      challengeCount: pending.challenges.length,
      historyId: pending.historyId
    });

    // Clear pending update
    localStorage.removeItem(this.pendingKey);
    
    // Trigger a custom event so components can reload challenges
    window.dispatchEvent(new CustomEvent('challengesUpdated'));
    
    return true;
  }

  // Get current pending update
  getPendingUpdate() {
    try {
      const pending = localStorage.getItem(this.pendingKey);
      return pending ? JSON.parse(pending) : null;
    } catch (error) {
      console.error('Error loading pending update:', error);
      return null;
    }
  }

  // Cancel pending update
  cancelPendingUpdate(reason = 'Cancelled by admin') {
    const pending = this.getPendingUpdate();
    if (!pending) return false;

    // Mark history entry as cancelled
    const history = this.getHistory();
    const historyEntry = history.find(h => h.id === pending.historyId);
    if (historyEntry) {
      historyEntry.status = 'cancelled';
      historyEntry.cancelReason = reason;
      historyEntry.cancelledAt = new Date().toISOString();
      localStorage.setItem(this.historyKey, JSON.stringify(history));
    }

    localStorage.removeItem(this.pendingKey);
    return true;
  }

  // Create a notification
  createNotification(notification) {
    const notifications = this.getNotifications();
    const newNotification = {
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...notification,
      dismissed: false,
      createdAt: new Date().toISOString()
    };
    
    notifications.unshift(newNotification);
    localStorage.setItem(this.notificationKey, JSON.stringify(notifications));
    
    return newNotification;
  }

  // Get all notifications
  getNotifications() {
    try {
      const notifications = localStorage.getItem(this.notificationKey);
      return notifications ? JSON.parse(notifications) : [];
    } catch (error) {
      console.error('Error loading notifications:', error);
      return [];
    }
  }

  // Get active (non-dismissed) notifications
  getActiveNotifications() {
    return this.getNotifications().filter(n => !n.dismissed);
  }

  // Dismiss a notification
  dismissNotification(notificationId) {
    const notifications = this.getNotifications();
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.dismissed = true;
      notification.dismissedAt = new Date().toISOString();
      localStorage.setItem(this.notificationKey, JSON.stringify(notifications));
      return true;
    }
    return false;
  }

  // Get statistics for admin dashboard
  getStatistics() {
    const history = this.getHistory();
    const now = new Date();
    const last30Days = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const last7Days = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

    const stats = {
      totalUpdates: history.length,
      last30Days: history.filter(h => new Date(h.timestamp) > last30Days).length,
      last7Days: history.filter(h => new Date(h.timestamp) > last7Days).length,
      pendingUpdates: history.filter(h => h.status === 'pending').length,
      activeUpdates: history.filter(h => h.status === 'active').length,
      cancelledUpdates: history.filter(h => h.status === 'cancelled').length,
      mostActiveAdmin: this.getMostActiveAdmin(history),
      avgChallengesPerUpdate: history.length > 0 ? 
        Math.round(history.reduce((sum, h) => sum + h.challengeCount, 0) / history.length) : 0
    };

    return stats;
  }

  // Get most active admin from history
  getMostActiveAdmin(history) {
    const adminCounts = {};
    history.forEach(entry => {
      const admin = entry.adminInfo.code;
      adminCounts[admin] = (adminCounts[admin] || 0) + 1;
    });

    const mostActive = Object.entries(adminCounts)
      .sort(([,a], [,b]) => b - a)[0];
    
    return mostActive ? { code: mostActive[0], count: mostActive[1] } : null;
  }

  // Clear old history (keep last N entries)
  cleanupHistory(keepCount = 30) {
    const history = this.getHistory();
    if (history.length > keepCount) {
      const cleaned = history.slice(0, keepCount);
      localStorage.setItem(this.historyKey, JSON.stringify(cleaned));
      return history.length - keepCount;
    }
    return 0;
  }

  // Check if there's a pending update and how much time is left
  getPendingUpdateStatus() {
    const pending = this.getPendingUpdate();
    if (!pending) return null;

    const now = new Date();
    const scheduledTime = new Date(pending.scheduledTime);
    const timeLeft = scheduledTime.getTime() - now.getTime();

    return {
      ...pending,
      timeLeft: Math.max(0, timeLeft),
      hoursLeft: Math.max(0, Math.ceil(timeLeft / (1000 * 60 * 60))),
      minutesLeft: Math.max(0, Math.ceil(timeLeft / (1000 * 60))),
      isOverdue: timeLeft < 0
    };
  }
}

export default ChallengeHistoryManager;