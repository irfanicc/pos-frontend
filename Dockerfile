# Use Node.js Alpine as the base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Install dependencies more efficiently
COPY package*.json ./
RUN npm install --frozen-lockfile

# Copy the entire project
COPY . .

# Expose the port used by Vite (5173)
EXPOSE 5173

# Set environment variable for API URL (Backend)
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Start the React development server and bind to all interfaces
CMD ["npm", "run", "dev", "--", "--host"]
