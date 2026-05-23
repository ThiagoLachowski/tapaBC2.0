FROM node:22-alpine

# Instalar dependências de sistema (necessárias para algumas libs nativas)
RUN apk add --no-cache python3 make g++

# Instalar ngrok globalmente (obrigatório para túnel funcionar sem prompts)
RUN npm install -g @expo/ngrok@^4.1.0

WORKDIR /app

# Copiar apenas package.json primeiro (para cache de camadas)
COPY mobile/package*.json ./

# Instalar dependências do projeto
RUN npm install --no-audit --no-fund

# Copiar todo o código do mobile
COPY mobile/ ./

# Limpar cache do Metro (prevenção)
RUN npx expo install --check --fix 2>/dev/null || true

# Expor portas do Expo e do ngrok (túnel)
EXPOSE 19000 19001 19002

# Comando final: --tunnel (funciona em qualquer rede) + --clear (evita cache sujo)
CMD ["sh", "-c", "npx expo start --tunnel --clear 2>&1 | tee /dev/stdout"]