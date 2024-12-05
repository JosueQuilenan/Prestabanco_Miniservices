FROM openjdk:21
ARG JAR_FILE=target/prestabanco-config.jar
COPY ${JAR_FILE} prestabanco-config.jar
ENTRYPOINT ["java","-jar","/prestabanco-config.jar"]