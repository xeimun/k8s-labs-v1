# 1. Base Image
FROM node:18-slim

# 2. Set working directory
WORKDIR /usr/src/app

# 3. Copy dependencies and install
# package*.json을 먼저 복사하여 의존성 변경이 없을 때 캐시를 활용
COPY package*.json ./
RUN npm install

# 4. Copy source code
COPY . .

# 5. Expose port and run the application
EXPOSE 8080
CMD [ "npm", "start" ]