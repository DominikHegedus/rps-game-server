# Use the Node.js 18 alpine official image
# https://hub.docker.com/_/node
FROM node:18-alpine

# Create and change to the app directory.
WORKDIR /app

# Copy local code to the container image.
COPY . .

# Install project dependencies
RUN npm ci

# Run the web service on container startup.
CMD ["npm", "start"]