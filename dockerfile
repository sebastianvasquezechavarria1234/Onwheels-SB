FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

ARG VITE_API_URL=http://localhost:8080/api
ARG VITE_API_BASE=http://localhost:8080
ARG VITE_REACT_APP_API_URL=http://localhost:8080/api
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_BASE=$VITE_API_BASE
ENV VITE_REACT_APP_API_URL=$VITE_REACT_APP_API_URL

COPY . .
RUN npm run build

FROM nginx:alpine
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]