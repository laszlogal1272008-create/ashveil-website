import React, { useState, useEffect } from 'react';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, banned, patrons
  const [loading, setLoading] = useState(true);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currencyForm, setCurrencyForm] = useState({
    dinosaurs: 0,
    voidPearls: 0,
    sylvanShards: 0,
    razorTalons: 0
  });
  const [banForm, setBanForm] = useState({
    reason: '',
    duration: 'permanent', // permanent, 1day, 1week, 1month, 3months
    customDays: 0
  });

  // Mock data - replace with actual API call
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Mock data for development - replace with actual API
      const mockUsers = [
        {
          id: 1,
          username: 'DinoHunter92',
          steamId: '76561198123456789',
          discordId: '123456789012345678',
          email: 'dino@example.com',
          patreonTier: 'Gold',
          playtime: '247 hours',
          joinDate: '2024-03-15',
          lastActive: '2024-10-22',
          status: 'active',
          currencies: {
            dinosaurs: 15,
            voidPearls: 2340,
            sylvanShards: 5600,
            razorTalons: 3200
          },
          banInfo: null
        },
        {
          id: 2,
          username: 'AlphaRaptor',
          steamId: '76561198987654321',
          discordId: '987654321098765432',
          email: 'alpha@example.com',
          patreonTier: 'Diamond',
          playtime: '892 hours',
          joinDate: '2024-01-08',
          lastActive: '2024-10-21',
          status: 'active',
          currencies: {
            dinosaurs: 28,
            voidPearls: 8920,
            sylvanShards: 12400,
            razorTalons: 9800
          },
          banInfo: null
        },
        {
          id: 3,
          username: 'PlantEater',
          steamId: '76561198555666777',
          discordId: '555666777888999000',
          email: 'plant@example.com',
          patreonTier: 'Silver',
          playtime: '156 hours',
          joinDate: '2024-06-12',
          lastActive: '2024-10-20',
          status: 'active',
          currencies: {
            dinosaurs: 8,
            voidPearls: 1200,
            sylvanShards: 8900,
            razorTalons: 450
          },
          banInfo: null
        },
        {
          id: 4,
          username: 'ToxicPlayer',
          steamId: '76561198111222333',
          discordId: '111222333444555666',
          email: 'toxic@example.com',
          patreonTier: 'None',
          playtime: '89 hours',
          joinDate: '2024-09-05',
          lastActive: '2024-10-15',
          status: 'banned',
          currencies: {
            dinosaurs: 3,
            voidPearls: 450,
            sylvanShards: 1200,
            razorTalons: 800
          },
          banInfo: {
            reason: 'Griefing and harassment',
            bannedBy: 'Laszlo',
            bannedDate: '2024-10-15',
            expiresDate: '2024-11-15',
            duration: '1 month'
          }
        }
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.steamId.includes(searchTerm) ||
                         user.discordId.includes(searchTerm) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.status === 'active') ||
                         (filterStatus === 'banned' && user.status === 'banned') ||
                         (filterStatus === 'patrons' && user.patreonTier !== 'None');
    
    return matchesSearch && matchesFilter;
  });

  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const handleGiveCurrency = async () => {
    if (selectedUsers.length === 0) {
      alert('Please select at least one user');
      return;
    }

    try {
      // API call to give currency
      const response = await fetch('/api/owner/give-currency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIds: selectedUsers,
          currencies: currencyForm
        })
      });

      if (response.ok) {
        alert(`Currency given to ${selectedUsers.length} user(s)!`);
        setShowCurrencyModal(false);
        setCurrencyForm({ dinosaurs: 0, voidPearls: 0, sylvanShards: 0, razorTalons: 0 });
        setSelectedUsers([]);
        fetchUsers(); // Refresh data
      } else {
        alert('Failed to give currency');
      }
    } catch (error) {
      console.error('Error giving currency:', error);
      alert('Error giving currency');
    }
  };

  const handleBanUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch('/api/owner/ban-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          reason: banForm.reason,
          duration: banForm.duration,
          customDays: banForm.customDays
        })
      });

      if (response.ok) {
        alert(`User ${selectedUser.username} has been banned!`);
        setShowBanModal(false);
        setBanForm({ reason: '', duration: 'permanent', customDays: 0 });
        fetchUsers(); // Refresh data
      } else {
        alert('Failed to ban user');
      }
    } catch (error) {
      console.error('Error banning user:', error);
      alert('Error banning user');
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      const response = await fetch('/api/owner/unban-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        alert('User has been unbanned!');
        fetchUsers(); // Refresh data
      } else {
        alert('Failed to unban user');
      }
    } catch (error) {
      console.error('Error unbanning user:', error);
      alert('Error unbanning user');
    }
  };

  const getPatreonTierColor = (tier) => {
    switch (tier) {
      case 'Diamond': return '#b9f2ff';
      case 'Gold': return '#ffd700';
      case 'Silver': return '#c0c0c0';
      case 'Bronze': return '#cd7f32';
      default: return '#666';
    }
  };

  if (loading) {
    return (
      <div className="user-management">
        <div className="loading-spinner">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="user-management-header">
        <h2>User Management</h2>
        <p>Manage all website users - currencies, bans, and detailed information</p>
      </div>

      <div className="user-controls">
        <div className="search-filter-section">
          <input
            type="text"
            placeholder="Search by username, Steam ID, Discord ID, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="user-search"
          />
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="user-filter"
          >
            <option value="all">All Users</option>
            <option value="active">Active Only</option>
            <option value="banned">Banned Only</option>
            <option value="patrons">Patrons Only</option>
          </select>
        </div>

        <div className="bulk-actions">
          <button onClick={handleSelectAll} className="select-all-btn">
            {selectedUsers.length === filteredUsers.length ? 'Deselect All' : 'Select All'}
          </button>
          
          {selectedUsers.length > 0 && (
            <button
              onClick={() => setShowCurrencyModal(true)}
              className="give-currency-btn"
            >
              Give Currency ({selectedUsers.length})
            </button>
          )}
        </div>
      </div>

      <div className="users-stats">
        <div className="stat">
          <span>Total Users: {users.length}</span>
        </div>
        <div className="stat">
          <span>Active: {users.filter(u => u.status === 'active').length}</span>
        </div>
        <div className="stat">
          <span>Banned: {users.filter(u => u.status === 'banned').length}</span>
        </div>
        <div className="stat">
          <span>Patrons: {users.filter(u => u.patreonTier !== 'None').length}</span>
        </div>
        <div className="stat">
          <span>Selected: {selectedUsers.length}</span>
        </div>
      </div>

      <div className="users-grid">
        {filteredUsers.map(user => (
          <div key={user.id} className={`user-card ${user.status}`}>
            <div className="user-card-header">
              <input
                type="checkbox"
                checked={selectedUsers.includes(user.id)}
                onChange={() => handleUserSelect(user.id)}
                className="user-select"
              />
              <h3 className="username">{user.username}</h3>
              <span 
                className="patreon-tier"
                style={{ color: getPatreonTierColor(user.patreonTier) }}
              >
                {user.patreonTier}
              </span>
            </div>

            <div className="user-info">
              <div className="info-row">
                <span>Playtime: {user.playtime}</span>
              </div>
              <div className="info-row">
                <span>Last Active: {user.lastActive}</span>
              </div>
              <div className="info-row">
                <span>Status: <span className={`status ${user.status}`}>{user.status}</span></span>
              </div>
            </div>

            <div className="user-currencies">
              <div className="currency">🦕 {user.currencies.dinosaurs}</div>
              <div className="currency">💎 {user.currencies.voidPearls}</div>
              <div className="currency">🌿 {user.currencies.sylvanShards}</div>
              <div className="currency">� {user.currencies.razorTalons}</div>
            </div>

            <div className="user-actions">
              <button
                onClick={() => {
                  setSelectedUser(user);
                  setShowUserModal(true);
                }}
                className="view-details-btn"
              >
                View Details
              </button>
              
              {user.status === 'active' ? (
                <button
                  onClick={() => {
                    setSelectedUser(user);
                    setShowBanModal(true);
                  }}
                  className="ban-btn"
                >
                  Ban User
                </button>
              ) : (
                <button
                  onClick={() => handleUnbanUser(user.id)}
                  className="unban-btn"
                >
                  Unban
                </button>
              )}
            </div>

            {user.banInfo && (
              <div className="ban-info">
                <p><strong>Banned:</strong> {user.banInfo.reason}</p>
                <p><strong>Expires:</strong> {user.banInfo.expiresDate}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Currency Modal */}
      {showCurrencyModal && (
        <div className="modal-overlay">
          <div className="modal-content currency-modal">
            <h3>Give Currency to {selectedUsers.length} User(s)</h3>
            
            <div className="currency-form">
              <div className="form-group">
                <label>🦕 Dinosaurs:</label>
                <input
                  type="number"
                  min="0"
                  value={currencyForm.dinosaurs}
                  onChange={(e) => setCurrencyForm(prev => ({ ...prev, dinosaurs: parseInt(e.target.value) || 0 }))}
                />
              </div>
              
              <div className="form-group">
                <label>💎 Void Pearls:</label>
                <input
                  type="number"
                  min="0"
                  value={currencyForm.voidPearls}
                  onChange={(e) => setCurrencyForm(prev => ({ ...prev, voidPearls: parseInt(e.target.value) || 0 }))}
                />
              </div>
              
              <div className="form-group">
                <label>🌿 Sylvan Shards (Herbivore):</label>
                <input
                  type="number"
                  min="0"
                  value={currencyForm.sylvanShards}
                  onChange={(e) => setCurrencyForm(prev => ({ ...prev, sylvanShards: parseInt(e.target.value) || 0 }))}
                />
              </div>
              
              <div className="form-group">
                <label>� Razor Talons (Carnivore):</label>
                <input
                  type="number"
                  min="0"
                  value={currencyForm.razorTalons}
                  onChange={(e) => setCurrencyForm(prev => ({ ...prev, razorTalons: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={handleGiveCurrency} className="confirm-btn">Give Currency</button>
              <button onClick={() => setShowCurrencyModal(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content user-details-modal">
            <h3>User Details: {selectedUser.username}</h3>
            
            <div className="user-details">
              <div className="detail-section">
                <h4>Account Information</h4>
                <p><strong>Username:</strong> {selectedUser.username}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Steam ID:</strong> {selectedUser.steamId}</p>
                <p><strong>Discord ID:</strong> {selectedUser.discordId}</p>
                <p><strong>Join Date:</strong> {selectedUser.joinDate}</p>
                <p><strong>Last Active:</strong> {selectedUser.lastActive}</p>
              </div>

              <div className="detail-section">
                <h4>Game Statistics</h4>
                <p><strong>Playtime:</strong> {selectedUser.playtime}</p>
                <p><strong>Patreon Tier:</strong> 
                  <span style={{ color: getPatreonTierColor(selectedUser.patreonTier) }}>
                    {selectedUser.patreonTier}
                  </span>
                </p>
                <p><strong>Status:</strong> <span className={`status ${selectedUser.status}`}>{selectedUser.status}</span></p>
              </div>

              <div className="detail-section">
                <h4>Current Currencies</h4>
                <p><strong>🦕 Dinosaurs:</strong> {selectedUser.currencies.dinosaurs}</p>
                <p><strong>💎 Void Pearls:</strong> {selectedUser.currencies.voidPearls}</p>
                <p><strong>🌿 Sylvan Shards:</strong> {selectedUser.currencies.sylvanShards}</p>
                <p><strong>� Razor Talons:</strong> {selectedUser.currencies.razorTalons}</p>
              </div>

              {selectedUser.banInfo && (
                <div className="detail-section ban-details">
                  <h4>Ban Information</h4>
                  <p><strong>Reason:</strong> {selectedUser.banInfo.reason}</p>
                  <p><strong>Banned By:</strong> {selectedUser.banInfo.bannedBy}</p>
                  <p><strong>Banned Date:</strong> {selectedUser.banInfo.bannedDate}</p>
                  <p><strong>Expires:</strong> {selectedUser.banInfo.expiresDate}</p>
                  <p><strong>Duration:</strong> {selectedUser.banInfo.duration}</p>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button onClick={() => setShowUserModal(false)} className="close-btn">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Ban Modal */}
      {showBanModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content ban-modal">
            <h3>Ban User: {selectedUser.username}</h3>
            
            <div className="ban-form">
              <div className="form-group">
                <label>Reason for Ban:</label>
                <textarea
                  value={banForm.reason}
                  onChange={(e) => setBanForm(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Enter reason for ban..."
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label>Ban Duration:</label>
                <select
                  value={banForm.duration}
                  onChange={(e) => setBanForm(prev => ({ ...prev, duration: e.target.value }))}
                >
                  <option value="permanent">Permanent</option>
                  <option value="1day">1 Day</option>
                  <option value="1week">1 Week</option>
                  <option value="1month">1 Month</option>
                  <option value="3months">3 Months</option>
                  <option value="custom">Custom Days</option>
                </select>
              </div>
              
              {banForm.duration === 'custom' && (
                <div className="form-group">
                  <label>Custom Duration (Days):</label>
                  <input
                    type="number"
                    min="1"
                    value={banForm.customDays}
                    onChange={(e) => setBanForm(prev => ({ ...prev, customDays: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button onClick={handleBanUser} className="ban-confirm-btn">Ban User</button>
              <button onClick={() => setShowBanModal(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;