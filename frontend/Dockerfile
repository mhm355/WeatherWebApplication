# A simple Dockerfile for development
FROM node:20-alpine

WORKDIR /app

# Copy package manifests and install dependencies
# This is done in a separate step to leverage Docker's layer caching
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port Vite runs on
EXPOSE 5173

# The command to start the Vite dev server
CMD ["npm", "run", "dev", "--", "--host"]