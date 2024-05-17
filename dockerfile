FROM node:14-alpine as build

WORKDIR /app/Frontend

COPY Frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY Frontend/ ./

# Build the React application
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/Frontend/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
