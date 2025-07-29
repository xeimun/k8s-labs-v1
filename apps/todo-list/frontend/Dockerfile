# Node.js를 위한 베이스 이미지 설정
FROM node

# 앱 작업 디렉토리 설정
WORKDIR /app

# 종속성 설치를 위한 package.json 및 package-lock.json 파일 복사
COPY package*.json ./

# 종속성 설치
RUN npm install

# 프로젝트의 모든 파일 복사
COPY . .

# Vite 개발 서버에서 사용하는 포트
EXPOSE 3000

# Vite 개발 서버 실행 명령
CMD ["npm", "run", "dev"]
