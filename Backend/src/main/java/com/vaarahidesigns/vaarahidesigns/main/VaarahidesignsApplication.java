package com.vaarahidesigns.vaarahidesigns.main;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import com.vaarahidesigns.vaarahidesigns.config.DotenvLoader;

@SpringBootApplication
@ComponentScan(basePackages = "com.vaarahidesigns.vaarahidesigns")
@EntityScan(basePackages = "com.vaarahidesigns.vaarahidesigns.entity")
@EnableJpaRepositories(basePackages = "com.vaarahidesigns.vaarahidesigns.repository")
public class VaarahidesignsApplication {

	public static void main(String[] args) {
		DotenvLoader.loadDotenv();
		SpringApplication.run(VaarahidesignsApplication.class, args);
	}

}
