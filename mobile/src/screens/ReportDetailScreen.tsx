// screens/ReportDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useReports } from '../context/ReportsContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../services/supabase';
import { BeamButton } from '../components/BeamButton';
import { theme as staticTheme } from '../theme/tokens';

type RouteParams = {
  reportId: string;
};

const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'Baixa': return '#22C55E';
    case 'Média': return '#F97316';
    case 'Alta': return '#EF4444';
    case 'Crítica': return '#A855F7';
    default: return '#F97316';
  }
};

export const ReportDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { reportId } = route.params as RouteParams;
  
  const { user } = useAuth();
  const { reports, voteReport, updateReportStatus, deleteReport, fetchReports } = useReports();
  const { theme } = useTheme();
  
  const [report, setReport] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  // Buscar o report da lista
  useEffect(() => {
    const found = reports.find(r => r.id === reportId);
    if (found) {
      setReport({
        ...found,
        severityColor: getSeverityColor(found.severity),
      });
      // Verificar se o usuário é o dono do post
      if (user && found.user_id === user.id) {
        setIsOwner(true);
      }
    }
    setLoading(false);
  }, [reports, reportId, user]);

  // Verificar se é admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        setIsAdmin(data?.role === 'admin');
      }
    };
    checkAdmin();
  }, [user]);

  // Verificar se já votou
  useEffect(() => {
    const checkVote = async () => {
      if (user && reportId) {
        const { data } = await supabase
          .from('votes')
          .select('*')
          .eq('user_id', user.id)
          .eq('report_id', reportId)
          .maybeSingle();
        setHasVoted(!!data);
      }
    };
    checkVote();
  }, [user, reportId]);

  // Carregar comentários
  const loadComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select(`
        *,
        profiles (name, avatar)
      `)
      .eq('report_id', reportId)
      .order('created_at', { ascending: true });
    
    if (data) setComments(data);
  };

  useEffect(() => {
    loadComments();
  }, [reportId]);

  const handleVote = async () => {
    if (!user) {
      Alert.alert('Login necessário', 'Faça login para votar');
      return;
    }
    await voteReport(reportId);
    setHasVoted(!hasVoted);
    const updated = reports.find(r => r.id === reportId);
    if (updated) setReport(prev => ({ ...prev, votes: updated.votes }));
  };

  const handleAddComment = async () => {
    if (!user) {
      Alert.alert('Login necessário', 'Faça login para comentar');
      return;
    }
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    const { error } = await supabase
      .from('comments')
      .insert({
        report_id: reportId,
        user_id: user.id,
        content: newComment.trim(),
      });
    
    if (!error) {
      setNewComment('');
      await loadComments();
    } else {
      Alert.alert('Erro', 'Não foi possível enviar o comentário');
    }
    setSubmittingComment(false);
  };

  // ✅ Função para admin atualizar status
  const handleUpdateStatus = async (newStatus: string) => {
    if (!updateReportStatus) return;
    setUpdating(true);
    try {
      await updateReportStatus(reportId, newStatus);
      Alert.alert('Sucesso', `Status alterado para ${newStatus}`);
      await fetchReports();
      setReport(prev => ({ ...prev, status: newStatus }));
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o status');
    } finally {
      setUpdating(false);
    }
  };

  // ✅ Função para deletar (disponível para admin E dono do post)
  const handleDelete = async () => {
    if (!deleteReport) return;
    
    const deleteMessage = isOwner && !isAdmin 
      ? 'Tem certeza que deseja deletar seu report? Esta ação não pode ser desfeita.'
      : 'Tem certeza que deseja deletar este report? (Admin)';
    
    Alert.alert(
      'Confirmar exclusão',
      deleteMessage,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            setUpdating(true);
            try {
              await deleteReport(reportId);
              Alert.alert('Sucesso', isOwner ? 'Seu report foi deletado' : 'Report deletado com sucesso');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível deletar o report');
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!report) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerContainer}>
          <Feather name="alert-circle" size={48} color={theme.colors.textMuted} />
          <Text style={[styles.notFoundText, { color: theme.colors.textPrimary }]}>Report não encontrado</Text>
          <BeamButton title="Voltar" onPress={() => navigation.goBack()} style={{ marginTop: 20 }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Detalhes</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Card principal */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
          
          {/* Status e Severidade */}
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { 
              backgroundColor: report.status === 'Resolvido' ? '#22C55E' : 
                              report.status === 'Em análise' ? '#F97316' : 
                              report.status === 'Aprovado' ? '#6366F1' : 
                              '#64748B'
            }]}>
              <Text style={styles.statusText}>{report.status}</Text>
            </View>
            <View style={[styles.severityBadge, { backgroundColor: report.severityColor + '22', borderColor: report.severityColor + '55' }]}>
              <Text style={[styles.severityText, { color: report.severityColor }]}>{report.severity}</Text>
            </View>
          </View>

          {/* Endereço */}
          <View style={styles.section}>
            <Feather name="map-pin" size={20} color={theme.colors.primary} />
            <View style={styles.sectionContent}>
              <Text style={[styles.streetText, { color: theme.colors.textPrimary }]}>{report.street}</Text>
              <Text style={[styles.neighborhoodText, { color: theme.colors.textSecondary }]}>{report.neighborhood}</Text>
            </View>
          </View>

          {/* Descrição */}
          <View style={styles.section}>
            <Feather name="file-text" size={20} color={theme.colors.primary} />
            <Text style={[styles.descriptionText, { color: theme.colors.textPrimary }]}>{report.description}</Text>
          </View>

          {/* Informações adicionais */}
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Feather name="user" size={16} color={theme.colors.textMuted} />
              <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>{report.userName || 'Anônimo'}</Text>
            </View>
            <TouchableOpacity style={styles.infoItem} onPress={handleVote}>
              <Feather name="thumbs-up" size={16} color={hasVoted ? theme.colors.primary : theme.colors.textMuted} />
              <Text style={[styles.infoText, { color: hasVoted ? theme.colors.primary : theme.colors.textSecondary }]}>{report.votes || 0} votos</Text>
            </TouchableOpacity>
            <View style={styles.infoItem}>
              <Feather name="calendar" size={16} color={theme.colors.textMuted} />
              <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                {new Date(report.createdAt).toLocaleDateString('pt-BR')}
              </Text>
            </View>
          </View>

          {/* Galeria de imagens */}
          {report.images && report.images.length > 0 && (
            <View style={styles.imagesSection}>
              <Text style={[styles.imagesTitle, { color: theme.colors.textSecondary }]}>Fotos do local</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imagesScroll}>
                {report.images.map((img: string, index: number) => (
                  <TouchableOpacity key={index}>
                    <Image source={{ uri: img }} style={styles.detailImage} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* ✅ SEÇÃO DE AÇÕES - ADMIN (Aprovar/Rejeitar/Resolver) */}
        {isAdmin && (
          <View style={[styles.adminContainer, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
            <Text style={[styles.adminTitle, { color: theme.colors.textPrimary }]}>Ações de Administrador</Text>
            <View style={styles.adminButtons}>
              <TouchableOpacity
                style={[styles.adminButton, styles.approveButton]}
                onPress={() => handleUpdateStatus('Aprovado')}
                disabled={updating}
              >
                <Feather name="check" size={16} color="#FFF" />
                <Text style={styles.adminButtonText}>Aprovar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.adminButton, styles.rejectButton]}
                onPress={() => handleUpdateStatus('Rejeitado')}
                disabled={updating}
              >
                <Feather name="x" size={16} color="#FFF" />
                <Text style={styles.adminButtonText}>Rejeitar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.adminButton, styles.resolveButton]}
                onPress={() => handleUpdateStatus('Resolvido')}
                disabled={updating}
              >
                <Feather name="check-circle" size={16} color="#FFF" />
                <Text style={styles.adminButtonText}>Resolver</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ✅ SEÇÃO DE AÇÕES - DONO DO POST (Apenas Deletar) */}
        {(isOwner || isAdmin) && (
          <View style={[styles.actionContainer, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
            <Text style={[styles.actionTitle, { color: theme.colors.textPrimary }]}>
              {isOwner ? 'Suas ações' : 'Ações'}
            </Text>
            <TouchableOpacity
              style={[styles.deleteButton, styles.deleteButtonFull]}
              onPress={handleDelete}
              disabled={updating}
            >
              <Feather name="trash-2" size={18} color="#FFF" />
              <Text style={styles.deleteButtonText}>Deletar {isOwner ? 'meu report' : 'report'}</Text>
            </TouchableOpacity>
            
            {isOwner && !isAdmin && (
              <Text style={[styles.noteText, { color: theme.colors.textMuted }]}>
                * Apenas administradores podem aprovar ou resolver reports.
              </Text>
            )}
          </View>
        )}

        {/* Seção de Comentários */}
        <View style={[styles.commentsContainer, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
          <Text style={[styles.commentsTitle, { color: theme.colors.textPrimary }]}>
            Comentários ({comments.length})
          </Text>
          
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.commentItem}>
                <View style={styles.commentAvatar}>
                  <Text style={styles.commentAvatarText}>
                    {(item.profiles?.name || 'U')[0].toUpperCase()}
                  </Text>
                </View>
                <View style={styles.commentContent}>
                  <Text style={[styles.commentAuthor, { color: theme.colors.textPrimary }]}>
                    {item.profiles?.name || 'Usuário'}
                  </Text>
                  <Text style={[styles.commentText, { color: theme.colors.textSecondary }]}>
                    {item.content}
                  </Text>
                  <Text style={[styles.commentDate, { color: theme.colors.textMuted }]}>
                    {new Date(item.created_at).toLocaleDateString('pt-BR')}
                  </Text>
                </View>
              </View>
            )}
            ListEmptyComponent={() => (
              <Text style={[styles.noComments, { color: theme.colors.textMuted }]}>
                Nenhum comentário ainda. Seja o primeiro!
              </Text>
            )}
          />
          
          {/* Input de novo comentário */}
          <View style={styles.commentInputContainer}>
            <TextInput
              style={[styles.commentInput, { backgroundColor: theme.colors.surface2, borderColor: theme.colors.border, color: theme.colors.textPrimary }]}
              placeholder="Escreva um comentário..."
              placeholderTextColor={theme.colors.textMuted}
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <TouchableOpacity 
              style={[styles.commentButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleAddComment}
              disabled={submittingComment || !newComment.trim()}
            >
              {submittingComment ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Feather name="send" size={18} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: staticTheme.spacing.lg, paddingBottom: 40 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  notFoundText: { fontSize: 16, fontFamily: staticTheme.typography.fontFamily.regular, marginTop: 8 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontFamily: staticTheme.typography.fontFamily.semiBold },
  
  card: { borderRadius: staticTheme.radii.xl, padding: staticTheme.spacing.lg, borderWidth: 1, gap: staticTheme.spacing.md },
  
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontSize: 12, fontFamily: staticTheme.typography.fontFamily.semiBold, color: '#FFF' },
  severityBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  severityText: { fontSize: 12, fontFamily: staticTheme.typography.fontFamily.semiBold },
  
  section: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  sectionContent: { flex: 1 },
  streetText: { fontSize: 16, fontFamily: staticTheme.typography.fontFamily.semiBold, marginBottom: 4 },
  neighborhoodText: { fontSize: 13, fontFamily: staticTheme.typography.fontFamily.regular },
  descriptionText: { flex: 1, fontSize: 14, fontFamily: staticTheme.typography.fontFamily.regular, lineHeight: 20 },
  
  infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, paddingTop: staticTheme.spacing.sm, borderTopWidth: 1, borderTopColor: staticTheme.colors.border },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { fontSize: 12, fontFamily: staticTheme.typography.fontFamily.regular },
  
  imagesSection: { gap: 8 },
  imagesTitle: { fontSize: 12, fontFamily: staticTheme.typography.fontFamily.medium, textTransform: 'uppercase', letterSpacing: 0.5 },
  imagesScroll: { gap: 8 },
  detailImage: { width: 200, height: 150, borderRadius: 12 },
  
  // Admin actions
  adminContainer: { marginTop: staticTheme.spacing.lg, padding: staticTheme.spacing.lg, borderRadius: staticTheme.radii.xl, borderWidth: 1 },
  adminTitle: { fontSize: 14, fontFamily: staticTheme.typography.fontFamily.semiBold, marginBottom: 12 },
  adminButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  adminButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, flex: 1, minWidth: '45%', justifyContent: 'center' },
  adminButtonText: { color: '#FFF', fontSize: 12, fontFamily: staticTheme.typography.fontFamily.medium },
  approveButton: { backgroundColor: '#22C55E' },
  rejectButton: { backgroundColor: '#EF4444' },
  resolveButton: { backgroundColor: '#6366F1' },
  
  // User actions
  actionContainer: { marginTop: staticTheme.spacing.lg, padding: staticTheme.spacing.lg, borderRadius: staticTheme.radii.xl, borderWidth: 1 },
  actionTitle: { fontSize: 14, fontFamily: staticTheme.typography.fontFamily.semiBold, marginBottom: 12 },
  deleteButton: { backgroundColor: '#DC2626' },
  deleteButtonFull: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, borderRadius: 8 },
  deleteButtonText: { color: '#FFF', fontSize: 14, fontFamily: staticTheme.typography.fontFamily.medium },
  noteText: { fontSize: 11, fontFamily: staticTheme.typography.fontFamily.regular, marginTop: 12, textAlign: 'center' },
  
  commentsContainer: { marginTop: staticTheme.spacing.lg, padding: staticTheme.spacing.lg, borderRadius: staticTheme.radii.xl, borderWidth: 1 },
  commentsTitle: { fontSize: 16, fontFamily: staticTheme.typography.fontFamily.semiBold, marginBottom: 12 },
  commentItem: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  commentAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: staticTheme.colors.primary, justifyContent: 'center', alignItems: 'center' },
  commentAvatarText: { color: '#FFF', fontSize: 14, fontFamily: staticTheme.typography.fontFamily.semiBold },
  commentContent: { flex: 1 },
  commentAuthor: { fontSize: 13, fontFamily: staticTheme.typography.fontFamily.semiBold, marginBottom: 2 },
  commentText: { fontSize: 13, fontFamily: staticTheme.typography.fontFamily.regular, marginBottom: 2 },
  commentDate: { fontSize: 10, fontFamily: staticTheme.typography.fontFamily.regular },
  noComments: { textAlign: 'center', paddingVertical: 20, fontSize: 13 },
  commentInputContainer: { flexDirection: 'row', gap: 8, marginTop: 12, alignItems: 'flex-end' },
  commentInput: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 14, maxHeight: 80 },
  commentButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
});