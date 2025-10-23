import React, { createContext, useContext, useState } from 'react';

const PermissionsContext = createContext();

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};

export const PermissionsProvider = ({ children }) => {
  const [userRole, setUserRole] = useState('player'); // 'owner', 'admin', 'moderator', 'player'
  const [playerName, setPlayerName] = useState('');
  const [steamId, setSteamId] = useState('');

  // Permission levels
  const permissions = {
    owner: {
      canSlayAnyPlayer: true,
      canBanPlayers: true,
      canKickPlayers: true,
      canTeleportPlayers: true,
      canHealPlayers: true,
      canMessagePlayers: true,
      canBroadcast: true,
      canAddCurrency: true,
      canViewPendingCommands: true,
      canBulkOperations: true,
      canAccessOwnerPanel: true,
      canManageAdmins: true
    },
    admin: {
      canSlayAnyPlayer: true,
      canBanPlayers: true,
      canKickPlayers: true,
      canTeleportPlayers: true,
      canHealPlayers: true,
      canMessagePlayers: true,
      canBroadcast: true,
      canAddCurrency: true,
      canViewPendingCommands: true,
      canBulkOperations: true,
      canAccessOwnerPanel: false,
      canManageAdmins: false
    },
    moderator: {
      canSlayAnyPlayer: false,
      canBanPlayers: false,
      canKickPlayers: true,
      canTeleportPlayers: false,
      canHealPlayers: true,
      canMessagePlayers: true,
      canBroadcast: false,
      canAddCurrency: false,
      canViewPendingCommands: true,
      canBulkOperations: false,
      canAccessOwnerPanel: false,
      canManageAdmins: false
    },
    player: {
      canSlayAnyPlayer: false,
      canBanPlayers: false,
      canKickPlayers: false,
      canTeleportPlayers: false,
      canHealPlayers: false,
      canMessagePlayers: false,
      canBroadcast: false,
      canAddCurrency: false,
      canViewPendingCommands: false,
      canBulkOperations: false,
      canAccessOwnerPanel: false,
      canManageAdmins: false
    }
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    return permissions[userRole]?.[permission] || false;
  };

  // Check if user can perform action on target player
  const canActOnPlayer = (targetPlayer, action) => {
    // Players can always act on themselves (for slay, heal, etc.)
    if (targetPlayer.toLowerCase() === playerName.toLowerCase()) {
      return ['slay', 'heal'].includes(action);
    }
    
    // Check role-based permissions for other players
    return hasPermission(`can${action.charAt(0).toUpperCase() + action.slice(1)}Players`) ||
           hasPermission(`can${action.charAt(0).toUpperCase() + action.slice(1)}AnyPlayer`);
  };

  // Role management
  const setRole = (role) => {
    if (['owner', 'admin', 'moderator', 'player'].includes(role)) {
      setUserRole(role);
    }
  };

  // Player identity
  const setPlayerIdentity = (name, id) => {
    setPlayerName(name);
    setSteamId(id);
  };

  // Get user's effective permissions
  const getUserPermissions = () => {
    return permissions[userRole] || permissions.player;
  };

  const contextValue = {
    userRole,
    playerName,
    steamId,
    setRole,
    setPlayerIdentity,
    hasPermission,
    canActOnPlayer,
    getUserPermissions,
    permissions: getUserPermissions()
  };

  return (
    <PermissionsContext.Provider value={contextValue}>
      {children}
    </PermissionsContext.Provider>
  );
};

export default PermissionsProvider;