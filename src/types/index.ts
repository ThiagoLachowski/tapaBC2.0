export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;   // color key OR image URI
  isCustomAvatar?: boolean;
  handle: string;
  joinedAt: string;
}

export interface Report {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  isCustomAvatar?: boolean;
  street: string;
  neighborhood: string;
  description: string;
  severity: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
  severityColor: string;
  status: 'Novo' | 'Em análise' | 'Resolvido';
  votes: number;
  comments: number;
  createdAt: string; // ISO string
  images: string[];
  latitude?: number;
  longitude?: number;
}
