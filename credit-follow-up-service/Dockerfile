FROM openjdk:21
ARG JAR_FILE=target/prestabanco-credit-follow-up.jar
COPY ${JAR_FILE} prestabanco-credit-follow-up.jar
ENTRYPOINT ["java","-jar","/prestabanco-credit-follow-up.jar"]