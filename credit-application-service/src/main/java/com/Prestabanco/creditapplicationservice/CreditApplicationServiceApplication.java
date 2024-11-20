package com.Prestabanco.creditapplicationservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class CreditApplicationServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(CreditApplicationServiceApplication.class, args);
	}

}
