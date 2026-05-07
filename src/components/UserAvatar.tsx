import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { theme } from '../theme/tokens';

const AVATAR_COLORS: Record<string, string> = {
  orange: '#F97316', indigo: '#6366F1', emerald: '#10B981',
  rose: '#F43F5E', sky: '#0EA5E9', violet: '#8B5CF6',
};

interface UserAvatarProps {
  user: {
    name: string;
    avatar: string;
    isCustomAvatar?: boolean;
  };
  size?: number;
}

export function UserAvatar({ user, size = 42 }: UserAvatarProps) {
  const { theme } = useTheme();
  const initials = user.name.trim().split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'CX';
  const bg = user.isCustomAvatar ? 'transparent' : (AVATAR_COLORS[user.avatar] ?? '#F97316');

  return (
    <View style={[styles.avatarCircle, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
      {user.isCustomAvatar ? (
        <Image source={{ uri: user.avatar }} style={{ width: '100%', height: '100%', borderRadius: size / 2 }} />
      ) : (
        <Text style={[styles.avatarText, { fontSize: size * 0.35, fontFamily: theme.typography.fontFamily.semiBold }]}>{initials}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatarCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarText: {
    color: '#FFF',
  },
});
