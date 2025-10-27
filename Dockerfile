# Node.js version
FROM node:14.21.3

# Set working directory
WORKDIR /app

# Copy files of dependencies first (to leverage cache)
COPY package*.json ./

# RUN rm -rf node_modules package-lock.json

RUN npm cache clean --force

# Install npm 6.10.0 (to ensure compatibility)
RUN npm install -g npm@6.14.18

# Install dependencies of the project
RUN npm install -g @quasar/cli@2.3.0

RUN npm install

COPY . .

# Expone Quasar port
EXPOSE 8080

# Default command
CMD ["npm", "run", "dev"]
