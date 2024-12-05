FROM openjdk:21
ARG JAR_FILE=target/prestabanco-loan-type.jar
COPY ${JAR_FILE} prestabanco-loan-type.jar
ENTRYPOINT ["java","-jar","/prestabanco-loan-type.jar"]