package com.harsh.task;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import jakarta.annotation.PostConstruct;
import java.util.TimeZone;

@SpringBootApplication
@EnableScheduling
public class HarshTaskAppApplication {

	public static void main(String[] args) {
		SpringApplication.run(HarshTaskAppApplication.class, args);
	}

	// This forces the Spring Boot app to run in IST no matter the server!
	@PostConstruct
	public void init() {
		TimeZone.setDefault(TimeZone.getTimeZone("Asia/Kolkata"));
	}
}