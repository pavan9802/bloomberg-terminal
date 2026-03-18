# ============================================================
# BACKEND DOCKERFILE - Spring Boot / Java 21
# ============================================================
# This file tells Docker how to build and run your Java backend.
# We use a "multi-stage build" which means we have two stages:
#   1. BUILD stage: Compile the Java code into a JAR file
#   2. RUN stage: Run the compiled JAR in a smaller image
# This keeps the final image small (no build tools included).
# ============================================================

# ============================================================
# STAGE 1: BUILD
# ============================================================
# "FROM" tells Docker which base image to start from.
# Think of it as choosing an operating system with pre-installed software.
#
# eclipse-temurin:21-jdk = Java 21 JDK (Java Development Kit)
# - "eclipse-temurin" is a popular free Java distribution
# - "21" is the Java version (matches your pom.xml)
# - "jdk" means it includes compiler tools (needed to build)
#
# "AS build" names this stage so we can reference it later
FROM eclipse-temurin:21-jdk AS build

# "WORKDIR" sets the working directory inside the container.
# All following commands run from this directory.
# Think of it like "cd /app" - creates the folder if it doesn't exist.
WORKDIR /app

# "COPY" copies files from your computer into the container.
#
# First, we copy ONLY the pom.xml file (Maven's config).
# Why? Docker caches each step. If pom.xml hasn't changed,
# Docker reuses the cached dependencies (faster builds!).
COPY pom.xml .

# "RUN" executes a command inside the container.
#
# "mvn dependency:go-offline" downloads all dependencies.
# - "mvn" is Maven, Java's build tool (like npm for Node.js)
# - "dependency:go-offline" downloads deps without building
# - "-B" means batch mode (no interactive prompts)
#
# This is cached! Only re-runs if pom.xml changes.
RUN mvn dependency:go-offline -B

# Now copy the rest of the source code.
# "src" folder contains all your Java code.
COPY src ./src

# Build the application!
# - "mvn package" compiles code and creates a JAR file
# - "-DskipTests" skips running tests (we run them separately in CI)
# - The JAR file is created in /app/target/terminal-0.0.1-SNAPSHOT.jar
RUN mvn package -DskipTests -B

# ============================================================
# STAGE 2: RUN (Production)
# ============================================================
# Start fresh with a smaller image for running (not building).
#
# "jre" = Java Runtime Environment (no compiler, smaller image)
# This image is ~200MB smaller than the JDK image!
FROM eclipse-temurin:21-jre

# Set working directory for the runtime container
WORKDIR /app

# Copy ONLY the built JAR file from the build stage.
# "--from=build" means "copy from the 'build' stage above"
# We don't need source code or Maven anymore - just the JAR!
COPY --from=build /app/target/*.jar app.jar

# "EXPOSE" documents which port the app uses.
# This doesn't actually open the port - it's documentation.
# Your Spring Boot app runs on port 8080 by default.
EXPOSE 8080

# "ENTRYPOINT" is the command that runs when the container starts.
# This runs: java -jar app.jar
#
# We use array format ["java", "-jar", "app.jar"] instead of
# string format "java -jar app.jar" for proper signal handling.
ENTRYPOINT ["java", "-jar", "app.jar"]
