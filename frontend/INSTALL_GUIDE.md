# Guia de Instalação - TAPAburacoCX

Este guia contém as instruções necessárias para configurar e executar o projeto em qualquer máquina, refletindo as tecnologias mais recentes e o design premium implementado.

## 1. Pré-requisitos

Certifique-se de ter o **Node.js** (LTS) instalado em sua máquina e o **Expo Go** em seu dispositivo móvel para testes.

## 2. Instalação das Dependências

Abra o terminal na pasta raiz do projeto e execute o comando consolidado abaixo para garantir que todas as bibliotecas de interface, mapas e animações estejam presentes:

```bash
npm install && npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context expo-image-picker expo-location react-native-webview expo-linear-gradient expo-font @expo-google-fonts/inter react-native-reanimated expo-status-bar @expo/vector-icons
```

## 3. Executando o Projeto

Para iniciar o servidor de desenvolvimento do Expo com limpeza de cache:

```bash
npx expo start -c
```

## 4. Tecnologias e Funcionalidades Principais

O projeto utiliza uma stack moderna focada em performance e estética premium:

- **Leaflet & WebView**: Motor de mapas customizado com suporte a filtros de cores dinâmicos (Modo Charcoal) e marcadores interativos.
- **Busca e Filtros de Mapa**: Sistema funcional de busca por ruas/bairros e filtragem por severidade (Baixa a Crítica) diretamente na interface do mapa.
- **Modern Alert System**: Substituição dos alertas nativos por um sistema de notificações customizado com animações de "Jump" (salto) via **Reanimated**.
- **Design System Premium**: Uso extensivo de `LinearGradient`, sombras profundas, bordas ultra-arredondadas (28px) e tipografia **Inter**.
- **Geolocalização (Expo Location)**: Captura precisa de coordenadas para garantir que os buracos sejam marcados exatamente onde estão.
- **Mídia (Expo Image Picker)**: Sistema de captura de fotos obrigatório para validação de reportes.
- **Context API (State Management)**: Gerenciamento centralizado de autenticação, temas e banco de dados de reportes.

---

_Projeto desenvolvido com foco na modernização e melhoria urbana de Caxias, MA._
