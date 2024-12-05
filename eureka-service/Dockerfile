FROM openjdk:21
ARG JAR_FILE=target/prestabanco-eureka.jar
COPY ${JAR_FILE} prestabanco-eureka.jar
ENTRYPOINT ["java","-jar","/prestabanco-eureka.jar"]