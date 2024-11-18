package com.Prestabanco.configservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.config.server.EnableConfigServer;

import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
@EnableConfigServer
public class ConfigServiceApplication {

	public static void main(String[] args) {
		Dotenv dotenv = Dotenv.load();
		String gitUsername = dotenv.get("GIT_USERNAME");
		String gitPassword = dotenv.get("GIT_PASSWORD");

		if (gitUsername == null || gitPassword == null) {
			System.err.println("Error: Las variables de entorno GIT_USERNAME o GIT_PASSWORD no están configuradas.");
			System.exit(1);
		}
		System.setProperty("GIT_USERNAME", gitUsername);
		System.setProperty("GIT_PASSWORD", gitPassword);
		SpringApplication.run(ConfigServiceApplication.class, args);
	}

}
