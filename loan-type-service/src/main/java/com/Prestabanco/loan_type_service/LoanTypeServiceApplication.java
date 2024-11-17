package com.Prestabanco.loan_type_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;

@SpringBootApplication
@EnableEurekaClient
public class LoanTypeServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(LoanTypeServiceApplication.class, args);
	}

}
