# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Build the app
RUN npm run build

# Expose port
EXPOSE 5173

# Start the Vite preview server
CMD ["npm", "run", "preview", "--", "--host", "--port", "5173"]

