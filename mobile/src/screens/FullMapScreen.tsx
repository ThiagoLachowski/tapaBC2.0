// screens/FullMapScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useReports } from '../context/ReportsContext';
import { useTheme } from '../context/ThemeContext';
import { LeafletMap } from '../components/LeafletMap';
import { theme as staticTheme } from '../theme/tokens';

const SEVERITIES = [
  { label: 'Baixa', color: '#22C55E' },
  { label: 'Média', color: '#F97316' },
  { label: 'Alta', color: '#EF4444' },
  { label: 'Crítica', color: '#A855F7' },
];

const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'Baixa': return '#22C55E';
    case 'Média': return '#F97316';
    case 'Alta': return '#EF4444';
    case 'Crítica': return '#A855F7';
    default: return '#F97316';
  }
};

export function FullMapScreen() {
  const navigation = useNavigation();
  const { reports } = useReports();
  const { theme, isDark } = useTheme();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSeverity, setActiveSeverity] = useState<string | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  // Processar reports
  const processedReports = reports.map(report => ({
    ...report,
    severityColor: getSeverityColor(report.severity),
  }));

  // Filtrar marcadores
  const markers = processedReports
    .filter(r => r.latitude && r.longitude)
    .filter(r => activeSeverity ? r.severity === activeSeverity : true)
    .filter(r => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return r.street.toLowerCase().includes(q) || r.neighborhood?.toLowerCase().includes(q);
    })
    .map(r => ({ 
      id: r.id, 
      lat: r.latitude!, 
      lng: r.longitude!, 
      color: r.severityColor,
      image: r.images?.[0],
      title: r.street,
      description: `${r.neighborhood || ''} - ${r.severity}`,
    }));

  const handleMarkerPress = (markerId: string) => {
    const report = processedReports.find(r => r.id === markerId);
    if (report) {
      setSelectedReport(report);
      setShowPopup(true);
    }
  };

  const handleViewDetails = () => {
    if (selectedReport) {
        setShowPopup(false);
        navigation.navigate('ReportDetail', { reportId: selectedReport.id });
    }
    };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Mapa de Buracos</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
          <Feather name="search" size={18} color={theme.colors.textMuted} />
          <TextInput 
            style={[styles.searchInput, { color: theme.colors.textPrimary }]}
            placeholder="Buscar ruas ou bairros..."
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Severity Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          <TouchableOpacity 
            onPress={() => setActiveSeverity(null)}
            style={[
              styles.filterChip, 
              { backgroundColor: !activeSeverity ? theme.colors.primary : theme.colors.surface1, borderColor: theme.colors.border }
            ]}
          >
            <Text style={[styles.filterLabel, { color: !activeSeverity ? '#FFF' : theme.colors.textPrimary }]}>Todos</Text>
          </TouchableOpacity>
          {SEVERITIES.map((s, i) => (
            <TouchableOpacity 
              key={i} 
              onPress={() => setActiveSeverity(s.label)}
              style={[
                styles.filterChip, 
                { 
                  backgroundColor: activeSeverity === s.label ? s.color : theme.colors.surface1, 
                  borderColor: theme.colors.border 
                }
              ]}
            >
              <View style={[styles.filterDot, { backgroundColor: activeSeverity === s.label ? '#FFF' : s.color }]} />
              <Text style={[styles.filterLabel, { color: activeSeverity === s.label ? '#FFF' : theme.colors.textPrimary }]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Mapa */}
      <View style={styles.mapContainer}>
        <LeafletMap 
          markers={markers} 
          interactive={true}
          onMarkerPress={handleMarkerPress}
        />
      </View>

      {/* Floating Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statsBadge, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
          <Feather name="map-pin" size={14} color={theme.colors.primary} />
          <Text style={[styles.statsText, { color: theme.colors.textPrimary }]}>
            {markers.length} buraco{markers.length !== 1 ? 's' : ''} encontrado{markers.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* Popup de informações do marcador */}
      <Modal
        visible={showPopup}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPopup(false)}
      >
        <Pressable style={styles.popupOverlay} onPress={() => setShowPopup(false)}>
          <View style={[styles.popupContainer, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
            {selectedReport && (
              <>
                <View style={styles.popupHeader}>
                  <View style={[styles.popupSeverity, { backgroundColor: selectedReport.severityColor + '22', borderColor: selectedReport.severityColor + '55' }]}>
                    <Text style={[styles.popupSeverityText, { color: selectedReport.severityColor }]}>{selectedReport.severity}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setShowPopup(false)}>
                    <Feather name="x" size={20} color={theme.colors.textMuted} />
                  </TouchableOpacity>
                </View>
                
                <Text style={[styles.popupTitle, { color: theme.colors.textPrimary }]}>{selectedReport.street}</Text>
                <Text style={[styles.popupNeighborhood, { color: theme.colors.textSecondary }]}>{selectedReport.neighborhood}</Text>
                <Text style={[styles.popupDescription, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                  {selectedReport.description}
                </Text>
                
                <View style={styles.popupFooter}>
                  <View style={styles.popupStats}>
                    <Feather name="thumbs-up" size={14} color={theme.colors.textMuted} />
                    <Text style={[styles.popupStatsText, { color: theme.colors.textMuted }]}>{selectedReport.votes || 0}</Text>
                    <Feather name="message-square" size={14} color={theme.colors.textMuted} style={{ marginLeft: 12 }} />
                    <Text style={[styles.popupStatsText, { color: theme.colors.textMuted }]}>{selectedReport.comments || 0}</Text>
                  </View>
                  <TouchableOpacity 
                    style={[styles.popupButton, { backgroundColor: theme.colors.primary }]}
                    onPress={handleViewDetails}
                  >
                    <Text style={styles.popupButtonText}>Ver detalhes</Text>
                    <Feather name="arrow-right" size={14} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    height: '100%',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  filtersScroll: {
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    borderRadius: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  filterLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  mapContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statsContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  statsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  statsText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  popupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  popupSeverity: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  popupSeverityText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
  },
  popupTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  popupNeighborhood: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
  },
  popupDescription: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
    marginBottom: 12,
  },
  popupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  popupStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  popupStatsText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginLeft: 2,
  },
  popupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  popupButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
});