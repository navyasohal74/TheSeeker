# Stage 1: Build the application with Maven installed
FROM eclipse-temurin:24-jdk-alpine AS build 
WORKDIR /app

# Install Maven in Alpine
RUN apk add --no-cache maven

COPY . .
RUN mvn clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:24-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]