package com.Prestabanco.credifollowupservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class CreditFollowUpService {

	public static void main(String[] args) {
		SpringApplication.run(CreditFollowUpService.class, args);
	}

}
