# Build the React application
FROM node:16-alpine3.17 AS builder
WORKDIR /app
COPY . .
RUN yarn install
RUN yarn build

# Copy the build artifacts into an nginx container
FROM nginx:1.25.1-alpine3.17-slim
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
