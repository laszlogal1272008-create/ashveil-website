import React, { useState, useEffect } from 'react';
import './RecurringDonations.css';

const RecurringDonations = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    description: '',
    schedule: 'monthly', // monthly, weekly, daily, custom
    customDays: 30,
    customHours: 0,
    customMinutes: 0,
    targetType: 'all', // all, patreon, custom, tier-specific
    patreonTier: 'Gold',
    customUserIds: [],
    currencies: {
      voidPearls: 0,
      razorTalons: 0, // Carnivore currency
      sylvanShards: 0  // Herbivore currency
    },
    isActive: true,
    nextRunDate: ''
  });
  const [donationHistory, setDonationHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Currency symbols for display
  const currencySymbols = {
    voidPearls: '💎',
    razorTalons: '🩸',
    sylvanShards: '🌿'
  };

  const currencyNames = {
    voidPearls: 'Void Pearls',
    razorTalons: 'Razor Talons',
    sylvanShards: 'Sylvan Shards'
  };

  useEffect(() => {
    fetchCampaigns();
    fetchDonationHistory();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      // Mock data for development
      const mockCampaigns = [
        {
          id: 1,
          name: 'Monthly Patreon Rewards',
          description: 'Monthly appreciation rewards for our amazing patrons',
          schedule: 'monthly',
          targetType: 'patreon',
          patreonTier: 'all',
          currencies: { voidPearls: 500, razorTalons: 200, sylvanShards: 300 },
          isActive: true,
          nextRunDate: '2024-11-01T12:00:00Z',
          lastRun: '2024-10-01T12:00:00Z',
          totalDeliveries: 147,
          createdDate: '2024-01-15'
        },
        {
          id: 2,
          name: 'Weekly Carnivore Boost',
          description: 'Weekly Razor Talons for active carnivore players',
          schedule: 'weekly',
          targetType: 'custom',
          currencies: { voidPearls: 0, razorTalons: 100, sylvanShards: 0 },
          isActive: true,
          nextRunDate: '2024-10-29T18:00:00Z',
          lastRun: '2024-10-22T18:00:00Z',
          totalDeliveries: 89,
          createdDate: '2024-03-10'
        },
        {
          id: 3,
          name: 'Diamond Tier Special',
          description: 'Exclusive rewards for Diamond tier patrons',
          schedule: 'monthly',
          targetType: 'tier-specific',
          patreonTier: 'Diamond',
          currencies: { voidPearls: 1000, razorTalons: 500, sylvanShards: 500 },
          isActive: true,
          nextRunDate: '2024-11-01T15:00:00Z',
          lastRun: '2024-10-01T15:00:00Z',
          totalDeliveries: 23,
          createdDate: '2024-02-20'
        }
      ];
      setCampaigns(mockCampaigns);
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDonationHistory = async () => {
    try {
      // Mock history data
      const mockHistory = [
        {
          id: 1,
          campaignName: 'Monthly Patreon Rewards',
          executedDate: '2024-10-01T12:00:00Z',
          recipientCount: 47,
          currencies: { voidPearls: 500, razorTalons: 200, sylvanShards: 300 },
          status: 'completed'
        },
        {
          id: 2,
          campaignName: 'Weekly Carnivore Boost',
          executedDate: '2024-10-22T18:00:00Z',
          recipientCount: 23,
          currencies: { voidPearls: 0, razorTalons: 100, sylvanShards: 0 },
          status: 'completed'
        },
        {
          id: 3,
          campaignName: 'Diamond Tier Special',
          executedDate: '2024-10-01T15:00:00Z',
          recipientCount: 5,
          currencies: { voidPearls: 1000, razorTalons: 500, sylvanShards: 500 },
          status: 'completed'
        }
      ];
      setDonationHistory(mockHistory);
    } catch (error) {
      console.error('Failed to fetch donation history:', error);
    }
  };

  const resetCampaignForm = () => {
    setCampaignForm({
      name: '',
      description: '',
      schedule: 'monthly',
      customDays: 30,
      customHours: 0,
      customMinutes: 0,
      targetType: 'all',
      patreonTier: 'Gold',
      customUserIds: [],
      currencies: { voidPearls: 0, razorTalons: 0, sylvanShards: 0 },
      isActive: true,
      nextRunDate: ''
    });
  };

  const handleCreateCampaign = async () => {
    try {
      // Calculate next run date based on schedule
      const nextRun = calculateNextRunDate(campaignForm.schedule, campaignForm.customDays, campaignForm.customHours, campaignForm.customMinutes);
      
      const newCampaign = {
        ...campaignForm,
        id: Date.now(),
        nextRunDate: nextRun.toISOString(),
        totalDeliveries: 0,
        createdDate: new Date().toISOString().split('T')[0]
      };

      // API call would go here
      console.log('Creating campaign:', newCampaign);
      
      setCampaigns(prev => [...prev, newCampaign]);
      setShowCreateModal(false);
      resetCampaignForm();
      alert('✅ Recurring donation campaign created successfully!');
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('❌ Failed to create campaign');
    }
  };

  const handleEditCampaign = async () => {
    try {
      const nextRun = calculateNextRunDate(campaignForm.schedule, campaignForm.customDays, campaignForm.customHours, campaignForm.customMinutes);
      
      const updatedCampaign = {
        ...campaignForm,
        id: selectedCampaign.id,
        nextRunDate: nextRun.toISOString(),
        totalDeliveries: selectedCampaign.totalDeliveries,
        createdDate: selectedCampaign.createdDate
      };

      setCampaigns(prev => prev.map(c => c.id === selectedCampaign.id ? updatedCampaign : c));
      setShowEditModal(false);
      setSelectedCampaign(null);
      resetCampaignForm();
      alert('✅ Campaign updated successfully!');
    } catch (error) {
      console.error('Error updating campaign:', error);
      alert('❌ Failed to update campaign');
    }
  };

  const calculateNextRunDate = (schedule, customDays, customHours, customMinutes) => {
    const now = new Date();
    let nextRun = new Date(now);
    
    switch (schedule) {
      case 'daily':
        nextRun.setDate(now.getDate() + 1);
        break;
      case 'weekly':
        nextRun.setDate(now.getDate() + 7);
        break;
      case 'monthly':
        nextRun.setMonth(now.getMonth() + 1);
        break;
      case 'custom':
        nextRun.setDate(now.getDate() + customDays);
        nextRun.setHours(now.getHours() + customHours);
        nextRun.setMinutes(now.getMinutes() + customMinutes);
        break;
      default:
        nextRun.setMonth(now.getMonth() + 1);
    }
    
    return nextRun;
  };

  const handleDeleteCampaign = async (campaignId) => {
    if (window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      try {
        setCampaigns(prev => prev.filter(c => c.id !== campaignId));
        alert('✅ Campaign deleted successfully!');
      } catch (error) {
        console.error('Error deleting campaign:', error);
        alert('❌ Failed to delete campaign');
      }
    }
  };

  const handleToggleCampaign = async (campaignId) => {
    try {
      setCampaigns(prev => prev.map(c => 
        c.id === campaignId ? { ...c, isActive: !c.isActive } : c
      ));
      alert('✅ Campaign status updated!');
    } catch (error) {
      console.error('Error toggling campaign:', error);
      alert('❌ Failed to update campaign status');
    }
  };

  const handleRunNow = async (campaign) => {
    if (window.confirm(`Run "${campaign.name}" immediately? This will deliver rewards to all targeted users.`)) {
      try {
        console.log('Running campaign now:', campaign);
        alert('✅ Campaign executed successfully! Check donation history for details.');
        fetchDonationHistory(); // Refresh history
      } catch (error) {
        console.error('Error running campaign:', error);
        alert('❌ Failed to execute campaign');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCurrencies = (currencies) => {
    return Object.entries(currencies)
      .filter(([, amount]) => amount > 0)
      .map(([currency, amount]) => `${currencySymbols[currency]} ${amount} ${currencyNames[currency]}`)
      .join(', ');
  };

  const getTargetDescription = (campaign) => {
    switch (campaign.targetType) {
      case 'all':
        return 'All Users';
      case 'patreon':
        return campaign.patreonTier === 'all' ? 'All Patrons' : `${campaign.patreonTier} Patrons`;
      case 'tier-specific':
        return `${campaign.patreonTier} Tier Only`;
      case 'custom':
        return `Custom Selection (${campaign.customUserIds?.length || 0} users)`;
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="recurring-donations">
        <div className="loading-spinner">Loading campaigns...</div>
      </div>
    );
  }

  return (
    <div className="recurring-donations">
      <div className="donations-header">
        <h2>🔄 Recurring Donations</h2>
        <p>Automated reward campaigns for your community</p>
        <button 
          className="create-campaign-btn"
          onClick={() => setShowCreateModal(true)}
        >
          ➕ Create New Campaign
        </button>
      </div>

      {/* Active Campaigns */}
      <div className="campaigns-section">
        <h3>Active Campaigns ({campaigns.filter(c => c.isActive).length})</h3>
        <div className="campaigns-grid">
          {campaigns.map(campaign => (
            <div key={campaign.id} className={`campaign-card ${campaign.isActive ? 'active' : 'inactive'}`}>
              <div className="campaign-header">
                <h4>{campaign.name}</h4>
                <div className="campaign-status">
                  <span className={`status-indicator ${campaign.isActive ? 'active' : 'inactive'}`}>
                    {campaign.isActive ? '🟢 ACTIVE' : '🔴 INACTIVE'}
                  </span>
                </div>
              </div>

              <div className="campaign-info">
                <p className="campaign-description">{campaign.description}</p>
                <div className="campaign-details">
                  <div className="detail-row">
                    <span>Schedule:</span>
                    <span className="schedule-badge">{campaign.schedule.toUpperCase()}</span>
                  </div>
                  <div className="detail-row">
                    <span>Target:</span>
                    <span>{getTargetDescription(campaign)}</span>
                  </div>
                  <div className="detail-row">
                    <span>Rewards:</span>
                    <span className="rewards-text">{formatCurrencies(campaign.currencies)}</span>
                  </div>
                  <div className="detail-row">
                    <span>Next Run:</span>
                    <span className="next-run">{formatDate(campaign.nextRunDate)}</span>
                  </div>
                  <div className="detail-row">
                    <span>Total Deliveries:</span>
                    <span className="delivery-count">{campaign.totalDeliveries}</span>
                  </div>
                </div>
              </div>

              <div className="campaign-actions">
                <button 
                  className="edit-btn"
                  onClick={() => {
                    setSelectedCampaign(campaign);
                    setCampaignForm({...campaign});
                    setShowEditModal(true);
                  }}
                >
                  ✏️ Edit
                </button>
                <button 
                  className="run-now-btn"
                  onClick={() => handleRunNow(campaign)}
                  disabled={!campaign.isActive}
                >
                  ▶️ Run Now
                </button>
                <button 
                  className={`toggle-btn ${campaign.isActive ? 'active' : 'inactive'}`}
                  onClick={() => handleToggleCampaign(campaign.id)}
                >
                  {campaign.isActive ? '⏸️ Pause' : '▶️ Activate'}
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => handleDeleteCampaign(campaign.id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Donation History */}
      <div className="history-section">
        <h3>Recent Donations</h3>
        <div className="history-table">
          <div className="table-header">
            <span>Campaign</span>
            <span>Date</span>
            <span>Recipients</span>
            <span>Rewards</span>
            <span>Status</span>
          </div>
          {donationHistory.map(donation => (
            <div key={donation.id} className="table-row">
              <span className="campaign-name">{donation.campaignName}</span>
              <span className="donation-date">{formatDate(donation.executedDate)}</span>
              <span className="recipient-count">{donation.recipientCount} users</span>
              <span className="donation-rewards">{formatCurrencies(donation.currencies)}</span>
              <span className={`donation-status ${donation.status}`}>
                {donation.status === 'completed' ? '✅ Completed' : '⏳ Processing'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content create-modal">
            <h3>Create New Recurring Campaign</h3>
            
            <div className="form-section">
              <h4>Campaign Details</h4>
              <div className="form-group">
                <label>Campaign Name:</label>
                <input
                  type="text"
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm(prev => ({...prev, name: e.target.value}))}
                  placeholder="e.g., Monthly Diamond Rewards"
                />
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  value={campaignForm.description}
                  onChange={(e) => setCampaignForm(prev => ({...prev, description: e.target.value}))}
                  placeholder="Describe this campaign..."
                  rows="3"
                />
              </div>
            </div>

            <div className="form-section">
              <h4>Schedule</h4>
              <div className="form-group">
                <label>Frequency:</label>
                <select
                  value={campaignForm.schedule}
                  onChange={(e) => setCampaignForm(prev => ({...prev, schedule: e.target.value}))}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="custom">Custom Interval</option>
                </select>
              </div>
              {campaignForm.schedule === 'custom' && (
                <div className="custom-schedule">
                  <div className="form-group">
                    <label>Days:</label>
                    <input
                      type="number"
                      min="0"
                      value={campaignForm.customDays}
                      onChange={(e) => setCampaignForm(prev => ({...prev, customDays: parseInt(e.target.value) || 0}))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Hours:</label>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={campaignForm.customHours}
                      onChange={(e) => setCampaignForm(prev => ({...prev, customHours: parseInt(e.target.value) || 0}))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Minutes:</label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={campaignForm.customMinutes}
                      onChange={(e) => setCampaignForm(prev => ({...prev, customMinutes: parseInt(e.target.value) || 0}))}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="form-section">
              <h4>Target Audience</h4>
              <div className="form-group">
                <label>Target Type:</label>
                <select
                  value={campaignForm.targetType}
                  onChange={(e) => setCampaignForm(prev => ({...prev, targetType: e.target.value}))}
                >
                  <option value="all">All Users</option>
                  <option value="patreon">All Patrons</option>
                  <option value="tier-specific">Specific Patreon Tier</option>
                  <option value="custom">Custom Selection</option>
                </select>
              </div>
              {(campaignForm.targetType === 'patreon' || campaignForm.targetType === 'tier-specific') && (
                <div className="form-group">
                  <label>Patreon Tier:</label>
                  <select
                    value={campaignForm.patreonTier}
                    onChange={(e) => setCampaignForm(prev => ({...prev, patreonTier: e.target.value}))}
                  >
                    {campaignForm.targetType === 'patreon' && <option value="all">All Tiers</option>}
                    <option value="Diamond">Diamond</option>
                    <option value="Gold">Gold</option>
                    <option value="Silver">Silver</option>
                    <option value="Bronze">Bronze</option>
                  </select>
                </div>
              )}
            </div>

            <div className="form-section">
              <h4>Reward Currencies</h4>
              <div className="currencies-grid">
                <div className="form-group">
                  <label>💎 Void Pearls (Premium):</label>
                  <input
                    type="number"
                    min="0"
                    value={campaignForm.currencies.voidPearls}
                    onChange={(e) => setCampaignForm(prev => ({
                      ...prev, 
                      currencies: {...prev.currencies, voidPearls: parseInt(e.target.value) || 0}
                    }))}
                  />
                </div>
                <div className="form-group">
                  <label>🩸 Razor Talons (Carnivore):</label>
                  <input
                    type="number"
                    min="0"
                    value={campaignForm.currencies.razorTalons}
                    onChange={(e) => setCampaignForm(prev => ({
                      ...prev, 
                      currencies: {...prev.currencies, razorTalons: parseInt(e.target.value) || 0}
                    }))}
                  />
                </div>
                <div className="form-group">
                  <label>🌿 Sylvan Shards (Herbivore):</label>
                  <input
                    type="number"
                    min="0"
                    value={campaignForm.currencies.sylvanShards}
                    onChange={(e) => setCampaignForm(prev => ({
                      ...prev, 
                      currencies: {...prev.currencies, sylvanShards: parseInt(e.target.value) || 0}
                    }))}
                  />
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={handleCreateCampaign} className="create-btn">
                ✅ Create Campaign
              </button>
              <button onClick={() => {setShowCreateModal(false); resetCampaignForm();}} className="cancel-btn">
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Campaign Modal */}
      {showEditModal && selectedCampaign && (
        <div className="modal-overlay">
          <div className="modal-content edit-modal">
            <h3>Edit Campaign: {selectedCampaign.name}</h3>
            
            {/* Same form structure as create modal */}
            <div className="form-section">
              <h4>Campaign Details</h4>
              <div className="form-group">
                <label>Campaign Name:</label>
                <input
                  type="text"
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm(prev => ({...prev, name: e.target.value}))}
                />
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  value={campaignForm.description}
                  onChange={(e) => setCampaignForm(prev => ({...prev, description: e.target.value}))}
                  rows="3"
                />
              </div>
            </div>

            <div className="form-section">
              <h4>Schedule</h4>
              <div className="form-group">
                <label>Frequency:</label>
                <select
                  value={campaignForm.schedule}
                  onChange={(e) => setCampaignForm(prev => ({...prev, schedule: e.target.value}))}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="custom">Custom Interval</option>
                </select>
              </div>
              {campaignForm.schedule === 'custom' && (
                <div className="custom-schedule">
                  <div className="form-group">
                    <label>Days:</label>
                    <input
                      type="number"
                      min="0"
                      value={campaignForm.customDays}
                      onChange={(e) => setCampaignForm(prev => ({...prev, customDays: parseInt(e.target.value) || 0}))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Hours:</label>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={campaignForm.customHours}
                      onChange={(e) => setCampaignForm(prev => ({...prev, customHours: parseInt(e.target.value) || 0}))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Minutes:</label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={campaignForm.customMinutes}
                      onChange={(e) => setCampaignForm(prev => ({...prev, customMinutes: parseInt(e.target.value) || 0}))}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="form-section">
              <h4>Reward Currencies</h4>
              <div className="currencies-grid">
                <div className="form-group">
                  <label>💎 Void Pearls (Premium):</label>
                  <input
                    type="number"
                    min="0"
                    value={campaignForm.currencies.voidPearls}
                    onChange={(e) => setCampaignForm(prev => ({
                      ...prev, 
                      currencies: {...prev.currencies, voidPearls: parseInt(e.target.value) || 0}
                    }))}
                  />
                </div>
                <div className="form-group">
                  <label>🩸 Razor Talons (Carnivore):</label>
                  <input
                    type="number"
                    min="0"
                    value={campaignForm.currencies.razorTalons}
                    onChange={(e) => setCampaignForm(prev => ({
                      ...prev, 
                      currencies: {...prev.currencies, razorTalons: parseInt(e.target.value) || 0}
                    }))}
                  />
                </div>
                <div className="form-group">
                  <label>🌿 Sylvan Shards (Herbivore):</label>
                  <input
                    type="number"
                    min="0"
                    value={campaignForm.currencies.sylvanShards}
                    onChange={(e) => setCampaignForm(prev => ({
                      ...prev, 
                      currencies: {...prev.currencies, sylvanShards: parseInt(e.target.value) || 0}
                    }))}
                  />
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={handleEditCampaign} className="save-btn">
                💾 Save Changes
              </button>
              <button onClick={() => {setShowEditModal(false); setSelectedCampaign(null); resetCampaignForm();}} className="cancel-btn">
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecurringDonations;