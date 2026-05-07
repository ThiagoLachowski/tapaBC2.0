export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;   // emoji or color key
  handle: string;
  joinedAt: string;
}

export interface Report {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  street: string;
  neighborhood: string;
  description: string;
  severity: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
  severityColor: string;
  status: 'Novo' | 'Em análise' | 'Resolvido';
  votes: number;
  comments: number;
  createdAt: string;
  timeAgo: string;
}
