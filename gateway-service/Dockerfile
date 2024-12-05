FROM openjdk:21
ARG JAR_FILE=target/prestabanco-gateway.jar
COPY ${JAR_FILE} prestabanco-gateway.jar
ENTRYPOINT ["java","-jar","/prestabanco-gateway.jar"]