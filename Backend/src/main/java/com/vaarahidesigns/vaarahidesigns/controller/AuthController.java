package com.vaarahidesigns.vaarahidesigns.controller;

import com.vaarahidesigns.vaarahidesigns.entity.RefreshToken;
import com.vaarahidesigns.vaarahidesigns.entity.User;
import com.vaarahidesigns.vaarahidesigns.repository.UserRepository;
import com.vaarahidesigns.vaarahidesigns.security.JwtUtil;
import com.vaarahidesigns.vaarahidesigns.service.RefreshTokenService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

/**
 * Authentication endpoints consumed by the frontend.
 *
 *  GET  /api/auth/me           — return current user from JWT
 *  POST /api/auth/phone        — save phone number (JWT required)
 *  POST /api/auth/logout       — revoke refresh token in DB
 *  POST /api/auth/refresh      — exchange refresh token for new token pair
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;

    // ── GET /api/auth/me ─────────────────────────────────────────────────

    /**
     * Returns the currently authenticated user's details.
     * The JWT filter has already validated the token and populated the SecurityContext.
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        String email = (String) authentication.getPrincipal();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();
        var resp = new java.util.LinkedHashMap<String, Object>();
        resp.put("id",      user.getId());
        resp.put("name",    user.getName());
        resp.put("email",   user.getEmail());
        resp.put("picture", user.getPicture() != null ? user.getPicture() : "");
        resp.put("role",    user.getRole());
        if (user.getPhnum() != null) resp.put("phone", user.getPhnum().toString());

        return ResponseEntity.ok(resp);
    }

    // ── POST /api/auth/phone ─────────────────────────────────────────────

    /**
     * Saves the user's mobile phone number.
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

        String email = (String) authentication.getPrincipal();
        return userRepository.findByEmail(email).map(user -> {
            user.setPhnum(Long.parseLong(phone));
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Phone saved successfully"));
        }).orElse(ResponseEntity.status(404).body(Map.of("error", "User not found")));
    }

    // ── POST /api/auth/logout ────────────────────────────────────────────

    /**
     * Revokes the user's refresh token in the DB.
     * The frontend clears the access token locally.
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()) {
            String email = (String) authentication.getPrincipal();
            refreshTokenService.revokeAllForUser(email);
        }
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    // ── POST /api/auth/refresh ───────────────────────────────────────────

    /**
     * Exchanges a valid refresh token for a new access + refresh token pair.
     * The old refresh token is rotated (revoked) on every successful call.
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> body) {
        String rawRefresh = body.get("refreshToken");
        if (rawRefresh == null || rawRefresh.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "refreshToken is required"));
        }

        // 1. Verify JWT signature + expiry + type=refresh
        Claims claims;
        try {
            claims = jwtUtil.validateRefreshToken(rawRefresh);
        } catch (JwtException e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid or expired refresh token"));
        }

        // 2. Confirm it exists and is not revoked in the DB
        RefreshToken stored;
        try {
            stored = refreshTokenService.findValid(rawRefresh);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }

        // 3. Look up the user
        String email = claims.getSubject();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }
        User user = userOpt.get();

        // 4. Rotate: revoke old, issue new
        RefreshToken newRefresh = refreshTokenService.rotateRefreshToken(stored, user);
        String newAccess        = jwtUtil.generateToken(user);

        return ResponseEntity.ok(Map.of(
                "token",        newAccess,
                "refreshToken", newRefresh.getToken()
        ));
    }
}
