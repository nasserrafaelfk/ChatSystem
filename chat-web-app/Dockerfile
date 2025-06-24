# Estágio de construção
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --silent
COPY . .
RUN npm run build

# Estágio de produção
FROM nginx:1.25-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

RUN echo "resolver 127.0.0.11 valid=30s;" > /etc/nginx/resolvers.conf

# Cria usuário não-root
RUN chmod -R 755 /usr/share/nginx/html

# Expõe a porta correta (deve combinar com a do nginx.conf)
EXPOSE 85

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --spider http://localhost:85/api/auth/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
