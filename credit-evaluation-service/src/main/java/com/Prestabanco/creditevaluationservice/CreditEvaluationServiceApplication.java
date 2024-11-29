package com.Prestabanco.creditevaluationservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class CreditEvaluationServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(CreditEvaluationServiceApplication.class, args);
	}

}
