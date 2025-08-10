# Use Node 18 as base image
FROM node:18

# Set working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json separately (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend source code
COPY . .

# Expose the backend port (change if your backend uses a different port)
EXPOSE 3000

# Start the backend server
CMD ["npm", "start"]
