import React, { useState } from 'react';
import './SocialPanel.css';

function SocialPanel() {
  const [activeTab, setActiveTab] = useState('friends');
  const [friendRequests, setFriendRequests] = useState([
    { id: 1, username: 'DinoHunter92', status: 'pending', avatar: null },
    { id: 2, username: 'RaptorQueen', status: 'pending', avatar: null }
  ]);
  const [friends, setFriends] = useState([
    { id: 1, username: 'StegoMaster', status: 'online', location: 'Great Falls', avatar: null },
    { id: 2, username: 'TrexSlayer', status: 'in-game', location: 'Center Lake', avatar: null },
    { id: 3, username: 'HerbiLover', status: 'offline', location: null, avatar: null }
  ]);
  const [newFriendUsername, setNewFriendUsername] = useState('');
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showTeleportRequest, setShowTeleportRequest] = useState(false);

  const handleSendFriendRequest = () => {
    if (newFriendUsername.trim()) {
      // Mock sending friend request
      alert(`Friend request sent to ${newFriendUsername}!`);
      setNewFriendUsername('');
    }
  };

  const handleAcceptRequest = (requestId) => {
    const request = friendRequests.find(r => r.id === requestId);
    if (request) {
      setFriends(prev => [...prev, { 
        ...request, 
        status: 'online', 
        location: 'Unknown' 
      }]);
      setFriendRequests(prev => prev.filter(r => r.id !== requestId));
      alert(`${request.username} is now your friend!`);
    }
  };

  const handleDeclineRequest = (requestId) => {
    setFriendRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const handleTeleportRequest = (friend) => {
    setSelectedFriend(friend);
    setShowTeleportRequest(true);
  };

  const handleConfirmTeleport = () => {
    alert(`Teleport request sent to ${selectedFriend.username}!`);
    setShowTeleportRequest(false);
    setSelectedFriend(null);
  };

  const handleGiftDinosaur = (friend) => {
    setSelectedFriend(friend);
    setShowGiftModal(true);
  };

  const handleConfirmGift = (dinosaurName) => {
    alert(`${dinosaurName} gifted to ${selectedFriend.username}!`);
    setShowGiftModal(false);
    setSelectedFriend(null);
  };

  return (
    <div className="social-panel">
      <div className="social-header">
        <div className="social-tabs">
          <button 
            className={`tab ${activeTab === 'friends' ? 'active' : ''}`}
            onClick={() => setActiveTab('friends')}
          >
            Friends ({friends.length})
          </button>
          <button 
            className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            Requests ({friendRequests.length})
          </button>
        </div>
      </div>

      <div className="social-content">
        {activeTab === 'friends' && (
          <div className="friends-section">
            <div className="add-friend">
              <input
                type="text"
                placeholder="Enter username..."
                value={newFriendUsername}
                onChange={(e) => setNewFriendUsername(e.target.value)}
                className="friend-input"
              />
              <button onClick={handleSendFriendRequest} className="add-friend-btn">
                Send Request
              </button>
            </div>

            <div className="friends-list">
              {friends.map(friend => (
                <div key={friend.id} className={`friend-item ${friend.status}`}>
                  <div className="friend-info">
                    <div className="friend-avatar">
                      {friend.username.charAt(0)}
                    </div>
                    <div className="friend-details">
                      <span className="friend-name">{friend.username}</span>
                      <span className="friend-status">
                        {friend.status === 'online' && '🟢 Online'}
                        {friend.status === 'in-game' && '🎮 In Game'}
                        {friend.status === 'offline' && '⚫ Offline'}
                      </span>
                      {friend.location && (
                        <span className="friend-location">📍 {friend.location}</span>
                      )}
                    </div>
                  </div>
                  <div className="friend-actions">
                    {friend.status !== 'offline' && (
                      <button 
                        className="teleport-btn"
                        onClick={() => handleTeleportRequest(friend)}
                      >
                        Teleport to Friend
                      </button>
                    )}
                    <button 
                      className="gift-btn"
                      onClick={() => handleGiftDinosaur(friend)}
                    >
                      Gift Dinosaur
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="requests-section">
            {friendRequests.length === 0 ? (
              <p className="no-requests">No pending friend requests</p>
            ) : (
              <div className="requests-list">
                {friendRequests.map(request => (
                  <div key={request.id} className="request-item">
                    <div className="request-info">
                      <div className="request-avatar">
                        {request.username.charAt(0)}
                      </div>
                      <span className="request-name">{request.username}</span>
                    </div>
                    <div className="request-actions">
                      <button 
                        className="accept-btn"
                        onClick={() => handleAcceptRequest(request.id)}
                      >
                        Accept
                      </button>
                      <button 
                        className="decline-btn"
                        onClick={() => handleDeclineRequest(request.id)}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Teleport Request Modal */}
      {showTeleportRequest && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Teleport Request</h3>
            <p>Send teleport request to {selectedFriend?.username}?</p>
            <p className="modal-note">They must accept the request for you to teleport.</p>
            <div className="modal-actions">
              <button onClick={handleConfirmTeleport} className="confirm-btn">
                Send Request
              </button>
              <button onClick={() => setShowTeleportRequest(false)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gift Modal */}
      {showGiftModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Gift Dinosaur</h3>
            <p>Select a dinosaur to gift to {selectedFriend?.username}:</p>
            <div className="gift-dinosaur-list">
              <button onClick={() => handleConfirmGift('Allosaurus')} className="dinosaur-gift-btn">
                Allosaurus
              </button>
              <button onClick={() => handleConfirmGift('Triceratops')} className="dinosaur-gift-btn">
                Triceratops
              </button>
              <button onClick={() => handleConfirmGift('Carnotaurus')} className="dinosaur-gift-btn">
                Carnotaurus
              </button>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowGiftModal(false)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SocialPanel;