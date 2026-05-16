import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BeamButton } from './BeamButton';
import { useTheme } from '../context/ThemeContext';

interface ModernAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export function ModernAlert({ visible, title, message, onClose }: ModernAlertProps) {
  const { theme } = useTheme();
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reinicia os valores para garantir que a animação "repita" sempre que ativado
      scale.setValue(0.5);
      opacity.setValue(0);
      
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 4,
          tension: 120,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, title, message]); // Repete se a visibilidade ou o conteúdo mudar

  if (!visible && opacity._value === 0) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View 
          style={[
            styles.content, 
            { 
              backgroundColor: theme.colors.surface1, 
              borderColor: theme.colors.border,
              opacity,
              transform: [{ scale }]
            }
          ]}
        >
          <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '15' }]}>
            <Feather name="alert-circle" size={32} color={theme.colors.primary} />
          </View>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{title}</Text>
          <Text style={[styles.message, { color: theme.colors.textSecondary }]}>{message}</Text>
          <BeamButton 
            title="Entendido" 
            isPrimary 
            onPress={onClose} 
            style={{ width: '100%', marginTop: 12 }} 
          />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '85%',
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    fontFamily: 'Inter-Regular',
  },
});
