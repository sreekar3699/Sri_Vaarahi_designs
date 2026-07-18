package com.vaarahidesigns.vaarahidesigns.config;

import io.github.cdimascio.dotenv.Dotenv;

public class DotenvLoader {

    public static void loadDotenv() {
        try {
            Dotenv dotenv = Dotenv.load();
            
            String googleClientId = dotenv.get("GOOGLE_CLIENT_ID");
            if (googleClientId != null) {
                System.setProperty("GOOGLE_CLIENT_ID", googleClientId);
            }
            
            String googleClientSecret = dotenv.get("GOOGLE_CLIENT_SECRET");
            if (googleClientSecret != null) {
                System.setProperty("GOOGLE_CLIENT_SECRET", googleClientSecret);
            }
            
            String dbUsername = dotenv.get("DB_USERNAME");
            if (dbUsername != null) {
                System.setProperty("DB_USERNAME", dbUsername);
            }
            
            String dbPassword = dotenv.get("DB_PASSWORD");
            if (dbPassword != null) {
                System.setProperty("DB_PASSWORD", dbPassword);
            }
        } catch (Exception e) {
            System.err.println("Could not load .env file: " + e.getMessage());
        }
    }
}
