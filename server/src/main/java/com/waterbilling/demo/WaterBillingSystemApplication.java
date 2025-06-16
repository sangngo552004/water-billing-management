package com.waterbilling.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class WaterBillingSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(WaterBillingSystemApplication.class, args);
	}

}
