# Use the Node.js 18 alpine official image
# https://hub.docker.com/_/node
FROM node:18-alpine

# Create and change to the app directory.
WORKDIR /src

# Copy local code to the container image.
COPY . .

# Install project dependencies
RUN npm ci

# Build project
RUN npm run build

# Run the web service on container startup.
CMD ["sh", "-c", "npx drizzle-kit push && npm start"]