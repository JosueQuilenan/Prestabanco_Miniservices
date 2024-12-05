FROM openjdk:21
ARG JAR_FILE=target/prestabanco-credit-evaluation.jar
COPY ${JAR_FILE} prestabanco-credit-evaluation.jar
ENTRYPOINT ["java","-jar","/prestabanco-credit-evaluation.jar"]