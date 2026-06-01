# Sistema de Mapeamento de Buracos Urbanos

Aplicativo colaborativo para reporte de problemas de infraestrutura urbana

---

## Sobre o Projeto

Um aplicativo mobile que permite cidadãos reportarem buracos e problemas no asfalto de forma colaborativa. O sistema conecta população e poder público, permitindo acompanhamento em tempo real da resolução dos problemas.

### 🎯 Objetivos Acadêmicos

- Desenvolver aplicação mobile completa com React Native
- Implementar geolocalização, upload de imagens e autenticação
- Aplicar boas práticas de desenvolvimento e segurança
- Utilizar Backend as a Service (BaaS) para agilizar o desenvolvimento

---

## Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────┐
│                    Arquitetura                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  📱 Frontend (Mobile)        ☁️ Backend (Supabase)      │
│  ┌──────────────────┐        ┌──────────────────┐       │
│  │  React Native    │ ◄────► │    PostgreSQL    │       │
│  │  + Expo          │  HTTPS │  (Banco de       │       │
│  │                  │        │   Dados)         │       │
│  └──────────────────┘        └──────────────────┘       │
│         │                             │                  │
│         │                      ┌──────┴──────┐           │
│         │                      │   Supabase  │           │
│         │                      │ Auth/Storage│           │
│         │                      └─────────────┘           │
└─────────────────────────────────────────────────────────┘
```

### Tecnologias Utilizadas

| Camada | Tecnologia | Finalidade |
|--------|------------|------------|
| **Frontend** | React Native + Expo | Framework mobile |
| | Expo Router | Navegação |
| | NativeWind (Tailwind) | Estilização |
| | Leaflet + WebView | Mapas interativos |
| **Backend** | Supabase | Backend as a Service |
| | PostgreSQL 15 | Banco de dados relacional |
| | Supabase Auth | Autenticação JWT |
| | Supabase Storage | Upload de imagens |

---

## 📁 Estrutura do Projeto

```
tapaBC2.0/
├── mobile/                          # Frontend React Native
│   ├── src/
│   │   ├── screens/                 # Telas do aplicativo
│   │   │   ├── HomeScreen.tsx       # Mapa + lista de buracos
│   │   │   ├── ReportScreen.tsx     # Formulário de reporte
│   │   │   ├── FeedScreen.tsx       # Comunidade (comentários)
│   │   │   ├── ProfileScreen.tsx    # Perfil + conquistas
│   │   │   ├── LoginScreen.tsx      # Autenticação
│   │   │   └── ReportDetailScreen.tsx # Detalhes do buraco
│   │   ├── context/                 # Estado global
│   │   │   ├── AuthContext.tsx      # Autenticação
│   │   │   ├── ReportsContext.tsx   # Gestão de reportes
│   │   │   └── ThemeContext.tsx     # Tema claro/escuro
│   │   ├── components/              # Componentes reutilizáveis
│   │   │   ├── UserAvatar.tsx
│   │   │   ├── LeafletMap.tsx
│   │   │   └── BeamButton.tsx
│   │   └── services/
│   │       └── supabase.ts          # Cliente Supabase
│   ├── App.tsx
│   ├── package.json
│   └── app.json
│
└── README.md
```

---

## Modelo de Dados (PostgreSQL)

### Principais Entidades

| Tabela | Descrição | Campos Principais |
|--------|-----------|-------------------|
| `profiles` | Perfis de usuário | id, name, handle, role (user/admin) |
| `reports` | Reportes de buracos | id, street, description, severity, status, votes |
| `report_images` | Imagens dos reportes | id, report_id, image_url |
| `votes` | Votos dos usuários | user_id, report_id (PK composta) |
| `comments` | Comentários | id, report_id, user_id, content |

### Segurança (RLS)

- **SELECT**: Qualquer usuário autenticado pode ler
- **INSERT**: Apenas o próprio usuário
- **UPDATE/DELETE**: Apenas o dono ou administrador

---

## Funcionalidades

### Autenticação
- Cadastro e login com email/senha
- Sessão persistente
- Diferenciação usuário comum / administrador

### Reporte de Buracos
- Captura de localização (GPS ou toque no mapa)
- Upload de até 3 imagens
- Seleção de gravidade (Baixa/Média/Alta/Crítica)

### Feed e Interação
- Listagem com filtros (todos/em análise/resolvidos)
- Sistema de votos (um por usuário)
- Comentários em reportes
- **Permissões:** Admin vê tudo; usuário comum vê apenas seus reportes + aprovados/resolvidos

### 🎮 Gamificação
- Ranking de colaboradores (Top 5)
- Níveis: Novato → Observador → Guardião → Fiscal → Herói
- Conquistas desbloqueáveis

### 🗺️ Mapa
- Marcadores coloridos por gravidade
- Popup com informações
- Filtros e busca

---

## Papéis e Permissões

| Funcionalidade | Usuário | Admin |
|----------------|---------|-------|
| Criar reporte | ✅ | ✅ |
| Deletar próprio reporte | ✅ | ✅ |
| Deletar qualquer reporte | ❌ | ✅ |
| Aprovar/Rejeitar/Resolver | ❌ | ✅ |

---

## Instalação e Execução

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Expo CLI
- Conta no [Supabase](https://supabase.com)

### Passo a passo

```bash
# 1. Clonar o repositório
git clone https://github.com/ThiagoLachowski/tapaBC2.0.git
cd tapaBC2.0

# 2. Instalar dependências
cd mobile
npm install

# 3. Configurar variáveis de ambiente
# Crie um arquivo .env na pasta mobile com:
EXPO_PUBLIC_SUPABASE_URL=sua_url_do_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon

# 4. Rodar o projeto
npx expo start -c
```

### Testar no celular

1. Instale o app **Expo Go** (Play Store)
2. Escaneie o QR Code gerado no terminal
3. Crie uma conta e comece a reportar

### Definir um usuário como Admin

Execute no SQL Editor do Supabase:

```sql
UPDATE profiles SET role = 'admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@exemplo.com');
```

---

## Funcionalidades Validadas

| Cenário | Resultado |
|---------|-----------|
| Cadastro de novo usuário | ✅ Funciona |
| Login com credenciais válidas | ✅ Funciona |
| Upload de imagem no reporte | ✅ Funciona |
| Votar em um reporte | ✅ Funciona |
| Comentar em reporte | ✅ Funciona |
| Admin aprova reporte | ✅ Funciona |

---

## Decisões Técnicas

### Por que Supabase em vez de backend próprio?
- Reduz complexidade (sem gerenciar servidor)
- Fornece autenticação e storage prontos
- Permite foco no frontend (objetivo acadêmico)

### Por que RLS (Row Level Security)?
- Segurança no nível do banco de dados
- Regras declarativas e fáceis de manter
- Impede acesso indevido via API

Repositório: github.com/ThiagoLachowski/tapaBC2.0