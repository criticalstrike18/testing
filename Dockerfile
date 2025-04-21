FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy project files
COPY . .

# Install dependencies
RUN npm install

# Build the project
RUN npm run build

# Set host to bind to all interfaces
ENV HOST=0.0.0.0
ENV PORT=4321

# Expose the port
EXPOSE 4321

# Start the server
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]