FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./

# Install dependencies with legacy peer deps
RUN npm install --legacy-peer-deps

COPY . .

ENV GENERATE_SOURCEMAP=false
ENV NODE_ENV=production
RUN npm run build

# Serving application via nginx after build, simple this way, believe me😒
FROM nginx:alpine

COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/build /usr/share/nginx/html

HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget --quiet --tries=1 --spider http://localhost:80 || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]