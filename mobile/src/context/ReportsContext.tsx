import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Report } from '../types';
import { useAuth } from './AuthContext';
import { decode } from 'base64-arraybuffer';
import * as ImageManipulator from 'expo-image-manipulator';

// Estender a interface original para incluir dados do perfil e imagens
interface ReportWithDetails extends Report {
  profiles?: {
    name: string;
    avatar: string;
  };
  report_images?: {
    image_url: string;
    position: number;
  }[];
}

interface ReportsContextType {
  reports: Report[];
  loading: boolean;
  addReport: (r: Omit<Report, 'id' | 'status' | 'votes' | 'comments' | 'createdAt'>, images?: string[]) => Promise<void>;
  voteReport: (id: string) => Promise<void>;
  updateReportStatus?: (id: string, status: string) => Promise<void>;
  deleteReport?: (id: string) => Promise<void>;
}

const ReportsContext = createContext<ReportsContextType | null>(null);

export function ReportsProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Converter dados do Supabase para o formato Report do seu app
  const convertToReport = (data: ReportWithDetails): Report => {
    return {
      id: data.id,
      street: data.street,
      neighborhood: data.neighborhood,
      description: data.description,
      severity: data.severity,
      latitude: data.latitude,
      longitude: data.longitude,
      status: data.status,
      votes: data.votes || 0,
      comments: data.comments || 0,
      createdAt: data.created_at,
      user_id: data.user_id,
      images: data.report_images?.map(img => img.image_url) || [],
      userAvatar: data.profiles?.avatar,
      userName: data.profiles?.name,
    };
  };

  // Carregar reports do Supabase
  const fetchReports = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('reports')
      .select(`
        *,
        profiles!reports_user_id_fkey (
          name,
          avatar,
          role
        ),
        report_images (
          image_url,
          position
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao carregar reports:', error);
      setLoading(false);
      return;
    }

    if (data) {
      const convertedReports = data.map((item: any) => ({
        id: item.id,
        street: item.street,
        neighborhood: item.neighborhood,
        description: item.description,
        severity: item.severity,
        latitude: item.latitude,
        longitude: item.longitude,
        status: item.status,
        votes: item.votes || 0,
        comments: item.comments || 0,
        createdAt: item.created_at,
        user_id: item.user_id,
        images: item.report_images?.map((img: any) => img.image_url) || [],
        userAvatar: item.profiles?.avatar,
        userName: item.profiles?.name,
      }));
      setReports(convertedReports);
    }
    
    setLoading(false);
  };

  // Função auxiliar para fazer upload de uma única imagem
  const uploadSingleImage = async (imageUri: string, userId: string, reportId: string, index: number): Promise<string> => {
  const fileExt = imageUri.split('.').pop() || 'jpg';
  const fileName = `${Date.now()}_${index}.${fileExt}`;
  const filePath = `${userId}/${reportId}/${fileName}`;
  
  try {
    // Converter para JPEG com compressão
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 1024 } }], // Redimensionar para 1024px
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );
    
    const { error: uploadError } = await supabase.storage
      .from('report-images')
      .upload(filePath, decode(manipulatedImage.base64!), {
        contentType: 'image/jpeg',
        cacheControl: '3600',
      });
    
    if (uploadError) throw uploadError;
    
    const { data: { publicUrl } } = supabase.storage
      .from('report-images')
      .getPublicUrl(filePath);
    
    return publicUrl;
    
  } catch (error) {
    console.error(`Erro no upload da imagem ${index}:`, error);
    throw error;
  }
};

  const addReport = async (
    r: Omit<Report, 'id' | 'status' | 'votes' | 'comments' | 'createdAt'>,
    images?: string[]
  ) => {
    if (!user) {
      console.error('Usuário não está logado');
      throw new Error('Usuário não está logado');
    }

    try {
      console.log('1. Inserindo report no banco...');
      
      const { data: reportData, error: reportError } = await supabase
        .from('reports')
        .insert({
          user_id: user.id,
          street: r.street,
          neighborhood: r.neighborhood || '',
          description: r.description,
          severity: r.severity,
          latitude: r.latitude || null,
          longitude: r.longitude || null,
          status: 'Novo',
          votes: 0,
        })
        .select()
        .single();

      if (reportError) {
        console.error('Erro ao inserir report:', reportError);
        throw reportError;
      }

      console.log('2. Report inserido com ID:', reportData.id);

      if (images && images.length > 0 && reportData) {
        console.log('3. Iniciando upload de', images.length, 'imagem(ns)...');
        
        for (let index = 0; index < images.length; index++) {
          const imageUri = images[index];
          console.log(`4. Processando imagem ${index + 1}/${images.length}`);
          
          try {
            const publicUrl = await uploadSingleImage(imageUri, user.id, reportData.id, index);
            
            const { error: insertError } = await supabase
              .from('report_images')
              .insert({
                report_id: reportData.id,
                image_url: publicUrl,
                storage_path: `${user.id}/${reportData.id}/${Date.now()}_${index}.jpg`,
                position: index,
              });
            
            if (insertError) {
              console.error(`Erro ao salvar referência da imagem ${index}:`, insertError);
            } else {
              console.log(`✅ Imagem ${index + 1} salva no banco`);
            }
            
          } catch (uploadError) {
            console.error(`❌ Falha no upload da imagem ${index}:`, uploadError);
          }
        }
      }

      console.log('6. Report adicionado com sucesso!');
      await fetchReports();
      
    } catch (error) {
      console.error('Erro ao adicionar report:', error);
      throw error;
    }
  };

  const voteReport = async (id: string) => {
    if (!user) {
      console.error('Usuário não está logado');
      return;
    }

    try {
      const { data: existingVote } = await supabase
        .from('votes')
        .select('*')
        .eq('user_id', user.id)
        .eq('report_id', id)
        .maybeSingle();

      if (existingVote) {
        const { error } = await supabase
          .from('votes')
          .delete()
          .eq('user_id', user.id)
          .eq('report_id', id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('votes')
          .insert({ user_id: user.id, report_id: id });
        
        if (error) throw error;
      }

      await fetchReports();
      
    } catch (error) {
      console.error('Erro ao votar:', error);
    }
  };

  const updateReportStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('reports')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar status:', error);
      throw error;
    }

    await fetchReports();
  };

  const deleteReport = async (id: string) => {
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar report:', error);
      throw error;
    }

    await fetchReports();
  };

  // Carregar reports ao iniciar
  useEffect(() => {
    fetchReports();

    const reportsSubscription = supabase
      .channel('reports_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'reports' }, 
        () => {
          fetchReports();
        }
      )
      .subscribe();

    const votesSubscription = supabase
      .channel('votes_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'votes' }, 
        () => {
          fetchReports();
        }
      )
      .subscribe();

    return () => {
      reportsSubscription.unsubscribe();
      votesSubscription.unsubscribe();
    };
  }, []);

  return (
    <ReportsContext.Provider value={{ 
      reports, 
      loading,
      addReport, 
      voteReport,
      updateReportStatus,
      deleteReport
    }}>
      {children}
    </ReportsContext.Provider>
  );
}

export function useReports() {
  const ctx = useContext(ReportsContext);
  if (!ctx) throw new Error('useReports must be inside ReportsProvider');
  return ctx;
}