# STAGE 1: Build the application using Gradle
FROM gradle:8.5.0-jdk17 AS build
WORKDIR /app
COPY build.gradle settings.gradle /app/
COPY gradlew /app/
COPY gradle /app/gradle/
COPY src /app/src
RUN ./gradlew build -x test

# STAGE 2: Create a slim runtime image
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=build /app/build/libs/backend-0.0.1-SNAPSHOT.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]