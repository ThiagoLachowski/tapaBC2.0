import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Report } from '../types';

interface ReportsContextType {
  reports: Report[];
  addReport: (r: Omit<Report, 'id' | 'status' | 'votes' | 'comments' | 'createdAt' | 'timeAgo'>) => void;
  voteReport: (id: string) => void;
}

const ReportsContext = createContext<ReportsContextType | null>(null);

export function ReportsProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<Report[]>([]);

  const addReport = (r: Omit<Report, 'id' | 'status' | 'votes' | 'comments' | 'createdAt' | 'timeAgo'>) => {
    const newReport: Report = {
      ...r,
      id: String(Date.now()),
      status: 'Novo',
      votes: 0,
      comments: 0,
      createdAt: new Date().toISOString(),
      timeAgo: 'agora mesmo',
    };
    setReports(prev => [newReport, ...prev]);
  };

  const voteReport = (id: string) => {
    setReports(prev =>
      prev.map(r => r.id === id ? { ...r, votes: r.votes + 1 } : r)
    );
  };

  return (
    <ReportsContext.Provider value={{ reports, addReport, voteReport }}>
      {children}
    </ReportsContext.Provider>
  );
}

export function useReports() {
  const ctx = useContext(ReportsContext);
  if (!ctx) throw new Error('useReports must be inside ReportsProvider');
  return ctx;
}
