FROM node:22-alpine AS build
WORKDIR /app
COPY frontend/package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; elif [ -f package.json ]; then npm install; else echo "Frontend package.json not created yet"; fi
COPY frontend/ .
RUN if [ -f package.json ]; then npm run build; else mkdir -p dist && echo "Frontend placeholder" > dist/index.html; fi

FROM nginx:1.27-alpine AS final
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
