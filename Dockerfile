# # 1. Build Stage
# FROM node:20-slim AS builder

# WORKDIR /app

# COPY package*.json ./
# RUN npm install

# COPY . .
# RUN npm run build

# # 2. Production Web Server Stage (Nginx)
# FROM nginx:alpine

# # Copy custom nginx configuration
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# # Copy compiled static files from builder
# COPY --from=builder /app/dist /usr/share/nginx/html

# EXPOSE 80

# CMD ["nginx", "-g", "daemon off;"]


FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static files
COPY dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
