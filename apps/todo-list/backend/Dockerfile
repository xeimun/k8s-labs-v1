# 1. Java JDK 기반 이미지 사용
FROM openjdk:17-jdk-alpine

# 2. JAR 파일을 컨테이너 안으로 복사
COPY build/libs/todo-v1-0.0.1-SNAPSHOT.jar app.jar

# 3. 포트 설정
EXPOSE 8080

# 4. 애플리케이션 실행 명령어
ENTRYPOINT ["java", "-jar", "/app.jar"]
