FROM node:18-alpine
WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm install --no-audit --no-fund

# Copy source
COPY . ./

EXPOSE 5000
CMD ["npm", "run", "dev"]
