# Define the base image as slim Node.js 18 image
FROM node:18-slim AS builder

# Set working directory for the build context
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) for dependency resolution
COPY . ./

# Install production dependencies (adjust based on your needs)
RUN npm install

# Create a new layer for the application code
FROM node:18-slim

# Copy the application code from the builder stage
COPY --from=builder /app .

# Expose the port your application listens on (adjust as needed)
EXPOSE 8000

# Set the command to execute your application entry point
CMD [ "npm", "start" ]
