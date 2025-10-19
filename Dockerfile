# Build the React application
FROM node:22-alpine AS builder
WORKDIR /app
COPY . .
RUN yarn install
RUN yarn build

# Copy the build artifacts into an nginx container
FROM nginx:1.25-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
