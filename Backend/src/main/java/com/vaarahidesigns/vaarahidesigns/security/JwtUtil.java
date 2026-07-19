package com.vaarahidesigns.vaarahidesigns.security;

import com.vaarahidesigns.vaarahidesigns.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * Utility for generating and validating access tokens and refresh tokens.
 *
 * Access token  — short-lived (15 min), carries userId + role.
 * Refresh token — long-lived (7 days), carries only email + type=refresh.
 *                 Stored in the DB; rotated on every use.
 */
@Component
public class JwtUtil {

    private final SecretKey signingKey;
    private final long expirationMs;
    private final long refreshExpirationMs;

    public JwtUtil(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration-ms}") long expirationMs,
            @Value("${jwt.refresh-expiration-ms}") long refreshExpirationMs) {

        byte[] keyBytes = Base64.getDecoder().decode(secret);
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        this.expirationMs = expirationMs;
        this.refreshExpirationMs = refreshExpirationMs;
    }

    // ─── Access Token ──────────────────────────────────────────────────────

    /**
     * Generate a short-lived access token carrying userId, email, and role.
     */
    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId",  user.getId());
        claims.put("role",    user.getRole());
        claims.put("type",    "access");
        claims.put("name",    user.getName()    != null ? user.getName()    : "");
        claims.put("picture", user.getPicture() != null ? user.getPicture() : "");
        claims.put("phone",   user.getPhnum()   != null ? user.getPhnum().toString() : "");

        return Jwts.builder()
                .claims(claims)
                .subject(user.getEmail())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(signingKey)
                .compact();
    }

    /**
     * Validate an access token. Throws JwtException on failure.
     * Guards against refresh tokens being passed as access tokens.
     */
    public Claims validateToken(String token) {
        Claims claims = parseClaims(token);
        if (!"access".equals(claims.get("type"))) {
            throw new JwtException("Token is not an access token");
        }
        return claims;
    }

    /** Extract email (subject) from an access token. */
    public String extractEmail(String token) {
        return validateToken(token).getSubject();
    }

    // ─── Refresh Token ─────────────────────────────────────────────────────

    /**
     * Generate a long-lived refresh token. Does NOT carry role or userId —
     * only the email and a type claim so it cannot be mistaken for an access token.
     */
    public String generateRefreshToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "refresh");

        return Jwts.builder()
                .claims(claims)
                .subject(user.getEmail())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshExpirationMs))
                .signWith(signingKey)
                .compact();
    }

    /**
     * Validate a refresh token. Throws JwtException on failure.
     * Guards against access tokens being used here.
     */
    public Claims validateRefreshToken(String token) {
        Claims claims = parseClaims(token);
        if (!"refresh".equals(claims.get("type"))) {
            throw new JwtException("Token is not a refresh token");
        }
        return claims;
    }

    /** Extract email (subject) from a refresh token. */
    public String extractEmailFromRefreshToken(String token) {
        return validateRefreshToken(token).getSubject();
    }

    // ─── Internal ──────────────────────────────────────────────────────────

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
