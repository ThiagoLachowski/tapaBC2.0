import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';

const REGISTERED_USERS: User[] = [];

interface AuthContextType {
  user: User | null;
  login:    (email: string, password: string) => Promise<string | null>;
  register: (name: string, email: string, password: string, avatar: string, isCustom?: boolean) => Promise<string | null>;
  logout:   () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const PASSWORD_MAP: Record<string, string> = {};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<string | null> => {
    const trimEmail = email.trim().toLowerCase();
    const found = REGISTERED_USERS.find(u => u.email === trimEmail);
    if (!found)            return 'Nenhuma conta encontrada com este e-mail.';
    if (PASSWORD_MAP[trimEmail] !== password) return 'Senha incorreta.';
    setUser(found);
    return null;
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    avatar: string,
    isCustom: boolean = false,
  ): Promise<string | null> => {
    const trimEmail = email.trim().toLowerCase();
    if (REGISTERED_USERS.find(u => u.email === trimEmail))
      return 'Este e-mail já está cadastrado.';

    const newUser: User = {
      id: String(Date.now()),
      name: name.trim(),
      email: trimEmail,
      avatar,
      isCustomAvatar: isCustom,
      handle: `@${name.trim().toLowerCase().replace(/\s+/g, '_')}`,
      joinedAt: new Date().toLocaleDateString('pt-BR'),
    };
    REGISTERED_USERS.push(newUser);
    PASSWORD_MAP[trimEmail] = password;
    setUser(newUser);
    return null;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
