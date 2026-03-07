package com.harsh.task;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class HarshTaskAppApplication {

	public static void main(String[] args) {

		SpringApplication.run(HarshTaskAppApplication.class, args);
	}

}
