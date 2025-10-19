import React, { useState, useEffect } from 'react';
import { ChallengeHistoryManager } from '../data/ChallengeHistoryManager';
import './AdminHistory.css';

function AdminHistory({ onClose }) {
  const [historyManager] = useState(() => new ChallengeHistoryManager());
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [pendingStatus, setPendingStatus] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    adminCode: '',
    action: 'all',
    status: 'all'
  });
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [historyManager]);

  useEffect(() => {
    applyFilters();
  }, [history, filters, historyManager]);

  const loadData = () => {
    const historyData = historyManager.getHistory();
    const stats = historyManager.getStatistics();
    const pending = historyManager.getPendingUpdateStatus();
    
    setHistory(historyData);
    setStatistics(stats);
    setPendingStatus(pending);
  };

  const applyFilters = () => {
    const filtered = historyManager.getFilteredHistory({
      ...filters,
      action: filters.action === 'all' ? undefined : filters.action,
      status: filters.status === 'all' ? undefined : filters.status
    });
    setFilteredHistory(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      adminCode: '',
      action: 'all',
      status: 'all'
    });
  };

  const cancelPendingUpdate = () => {
    if (window.confirm('Are you sure you want to cancel the pending challenge update?')) {
      historyManager.cancelPendingUpdate('Cancelled by admin');
      loadData();
      alert('Pending update cancelled successfully.');
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatTimeLeft = (timeLeft) => {
    if (timeLeft <= 0) return 'Overdue';
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    } else {
      return `${minutes}m left`;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#FFD700';
      case 'active': return '#32CD32';
      case 'cancelled': return '#DC143C';
      default: return '#ccc';
    }
  };

  const getActionIcon = (action) => {
    switch(action) {
      case 'updated': return '✏️';
      case 'regenerated': return '🔄';
      case 'approved': return '✅';
      default: return '📝';
    }
  };

  return (
    <div className="admin-history">
      <div className="history-header">
        <div className="header-title">
          <h2>🔒 Admin Challenge History</h2>
          <button className="close-history" onClick={onClose}>✖</button>
        </div>
        <p>Track all daily challenge modifications and admin activity</p>
      </div>

      {/* Pending Update Status */}
      {pendingStatus && (
        <div className="pending-update-alert">
          <div className="alert-header">
            <h3>⏰ Pending Challenge Update</h3>
            <button className="cancel-pending" onClick={cancelPendingUpdate}>
              🚫 Cancel Update
            </button>
          </div>
          <div className="alert-content">
            <p><strong>Scheduled for:</strong> {formatTimestamp(pendingStatus.scheduledTime)}</p>
            <p><strong>Time remaining:</strong> {formatTimeLeft(pendingStatus.timeLeft)}</p>
            <p><strong>Challenge count:</strong> {pendingStatus.challenges.length}</p>
            {pendingStatus.isOverdue && (
              <div className="overdue-warning">
                ⚠️ Update is overdue! It should have activated automatically.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Statistics Dashboard */}
      <div className="admin-statistics">
        <h3>📊 Statistics Overview</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{statistics.totalUpdates}</div>
            <div className="stat-label">Total Updates</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{statistics.last7Days}</div>
            <div className="stat-label">Last 7 Days</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{statistics.pendingUpdates}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{statistics.avgChallengesPerUpdate}</div>
            <div className="stat-label">Avg Challenges</div>
          </div>
        </div>
        
        {statistics.mostActiveAdmin && (
          <div className="most-active-admin">
            <strong>Most Active Admin:</strong> {statistics.mostActiveAdmin.code} 
            ({statistics.mostActiveAdmin.count} updates)
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="history-filters">
        <h3>🔍 Filters</h3>
        <div className="filter-grid">
          <div className="filter-item">
            <label>Start Date:</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>
          
          <div className="filter-item">
            <label>End Date:</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
          
          <div className="filter-item">
            <label>Admin Code:</label>
            <input
              type="text"
              placeholder="Filter by admin..."
              value={filters.adminCode}
              onChange={(e) => handleFilterChange('adminCode', e.target.value)}
            />
          </div>
          
          <div className="filter-item">
            <label>Action:</label>
            <select 
              value={filters.action} 
              onChange={(e) => handleFilterChange('action', e.target.value)}
            >
              <option value="all">All Actions</option>
              <option value="updated">Updated</option>
              <option value="regenerated">Regenerated</option>
              <option value="approved">Approved</option>
            </select>
          </div>
          
          <div className="filter-item">
            <label>Status:</label>
            <select 
              value={filters.status} 
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="filter-actions">
            <button className="clear-filters" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="history-list">
        <h3>📝 History Log ({filteredHistory.length} entries)</h3>
        
        {filteredHistory.length === 0 ? (
          <div className="no-history">
            <p>No history entries found matching your filters.</p>
          </div>
        ) : (
          <div className="history-entries">
            {filteredHistory.map(entry => (
              <div 
                key={entry.id} 
                className={`history-entry ${entry.status}`}
                onClick={() => setSelectedEntry(selectedEntry?.id === entry.id ? null : entry)}
              >
                <div className="entry-header">
                  <div className="entry-main">
                    <span className="action-icon">{getActionIcon(entry.action)}</span>
                    <span className="entry-action">{entry.action}</span>
                    <span className="entry-timestamp">{formatTimestamp(entry.timestamp)}</span>
                  </div>
                  <div className="entry-meta">
                    <span 
                      className="status-badge"
                      style={{ color: getStatusColor(entry.status) }}
                    >
                      {entry.status}
                    </span>
                    <span className="challenge-count">{entry.challengeCount} challenges</span>
                  </div>
                </div>
                
                <div className="entry-summary">
                  <span className="admin-code">Admin: {entry.adminInfo.code}</span>
                  {entry.status === 'pending' && (
                    <span className="scheduled-time">
                      Scheduled: {formatTimestamp(entry.scheduledFor)}
                    </span>
                  )}
                </div>

                {selectedEntry?.id === entry.id && (
                  <div className="entry-details">
                    <div className="details-section">
                      <h4>Admin Information:</h4>
                      <p><strong>Code:</strong> {entry.adminInfo.code}</p>
                      <p><strong>Session:</strong> {entry.adminInfo.sessionId}</p>
                      <p><strong>Browser:</strong> {entry.adminInfo.userAgent}</p>
                    </div>
                    
                    <div className="details-section">
                      <h4>Challenges ({entry.challenges.length}):</h4>
                      <div className="challenge-summary">
                        {entry.challenges.map((challenge, index) => (
                          <div key={challenge.id} className="challenge-item">
                            <span className="challenge-number">#{index + 1}</span>
                            <span className="challenge-title">{challenge.title}</span>
                            <span className="challenge-difficulty">{challenge.difficulty}</span>
                            <span className="challenge-reward">
                              {challenge.reward.amount} {challenge.reward.currency}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {entry.status === 'cancelled' && entry.cancelReason && (
                      <div className="details-section cancel-info">
                        <h4>Cancellation:</h4>
                        <p><strong>Reason:</strong> {entry.cancelReason}</p>
                        <p><strong>Cancelled at:</strong> {formatTimestamp(entry.cancelledAt)}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminHistory;