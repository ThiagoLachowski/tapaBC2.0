# Guia de Instalação - TAPAburacoCX 🕳️

Este guia contém as instruções necessárias para configurar e executar o projeto em qualquer máquina.

## 1. Pré-requisitos
Certifique-se de ter o **Node.js** instalado em sua máquina.

## 2. Instalação das Dependências
Abra o terminal na pasta raiz do projeto e execute o comando consolidado abaixo:

```bash
npm install && npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context expo-image-picker expo-location react-native-webview expo-linear-gradient expo-font @expo-google-fonts/inter react-native-reanimated expo-status-bar
```

## 3. Executando o Projeto
Para iniciar o servidor de desenvolvimento do Expo:

```bash
npx expo start -c
```

## 4. Bibliotecas Principais Utilizadas
- **React Navigation**: Sistema de abas e pilhas de telas.
- **Leaflet (via WebView)**: Mapas interativos de Caxias-MA com markers personalizados.
- **Expo Image Picker**: Acesso à câmera e galeria para fotos dos buracos.
- **Expo Location**: GPS e geolocalização em tempo real para precisão no mapa.
- **React Native Reanimated**: Micro-animações e transições fluidas de interface.
- **Expo Linear Gradient**: Gradients modernos para o design premium.
- **Context API**: Gerenciamento de estado de usuários, temas e reportes.

---
*Projeto desenvolvido para a melhoria urbana de Caxias, MA.*
