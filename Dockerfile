# Frontend image for the Pension Ask Us SPA.
#
# Build:  docker build -t pension-ask-us-web \
#             --build-arg VITE_API_BASE_URL=http://api.example.com \
#             ./web
# Run:    docker run --rm -p 8080:80 pension-ask-us-web
#
# The backend URL is baked in at build time. Build a new image per
# environment (or pass --build-arg in CI).
FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_API_BASE_URL=http://127.0.0.1:8000
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

COPY package.json package-lock.json* ./
RUN npm ci

COPY tsconfig.json tsconfig.node.json vite.config.ts index.html ./
COPY src ./src

RUN npm run build

# --- runtime ---------------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

# Drop the stock site config and replace with our SPA-friendly one.
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
