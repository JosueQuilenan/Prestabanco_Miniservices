FROM openjdk:21
ARG JAR_FILE=target/prestabanco-credit-application.jar
COPY ${JAR_FILE} prestabanco-credit-application.jar
ENTRYPOINT ["java","-jar","/prestabanco-credit-application.jar"]