FROM openjdk:21
ARG JAR_FILE=target/prestabanco-register.jar
COPY ${JAR_FILE} prestabanco-register.jar
ENTRYPOINT ["java","-jar","/prestabanco-register.jar"]