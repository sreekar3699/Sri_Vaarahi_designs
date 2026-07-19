package com.vaarahidesigns.vaarahidesigns.controller;

import com.vaarahidesigns.vaarahidesigns.entity.User;
import com.vaarahidesigns.vaarahidesigns.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

/**
 * Provides authentication-related endpoints for the frontend.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;

    /**
     * Returns the currently authenticated user's details.
     * The frontend calls this after the OAuth2 redirect to get user info.
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();

        // Build response map — include phone only if it's set
        var responseBuilder = new java.util.LinkedHashMap<String, Object>();
        responseBuilder.put("id",      user.getId());
        responseBuilder.put("name",    user.getName());
        responseBuilder.put("email",   user.getEmail());
        responseBuilder.put("picture", user.getPicture() != null ? user.getPicture() : "");
        if (user.getPhnum() != null) {
            responseBuilder.put("phone", user.getPhnum().toString());
        }
        responseBuilder.put("role", user.getRole());

        return ResponseEntity.ok(responseBuilder);
    }

    /**
     * Saves the user's mobile phone number.
     * Called from the frontend PhoneRegistration page after OAuth2 login.
     */
    @PostMapping("/phone")
    public ResponseEntity<?> savePhone(@RequestBody Map<String, String> body,
                                       Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        String phone = body.get("phone");
        if (phone == null || !phone.matches("\\d{10}")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid phone number"));
        }

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");

        return userRepository.findByEmail(email).map(user -> {
            user.setPhnum(Long.parseLong(phone));
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Phone saved successfully"));
        }).orElse(ResponseEntity.status(404).body(Map.of("error", "User not found")));
    }

    /**
     * Logs out the current user by invalidating their session.
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}
