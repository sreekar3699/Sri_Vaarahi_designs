package com.vaarahidesigns.vaarahidesigns.service;

import com.vaarahidesigns.vaarahidesigns.entity.RefreshToken;
import com.vaarahidesigns.vaarahidesigns.entity.User;
import com.vaarahidesigns.vaarahidesigns.repository.RefreshTokenRepository;
import com.vaarahidesigns.vaarahidesigns.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/**
 * Manages the lifecycle of refresh tokens:
 * creation, rotation (atomic revoke + issue), and revocation on logout.
 */
@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtUtil jwtUtil;

    @Value("${jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    /**
     * Generates a new refresh token for the user, deletes any existing ones,
     * and persists the new record.
     */
    @Transactional
    public RefreshToken createRefreshToken(User user) {
        // Revoke any existing tokens for this user (single active session)
        refreshTokenRepository.deleteByUserEmail(user.getEmail());

        String rawToken = jwtUtil.generateRefreshToken(user);
        Instant expiresAt = Instant.now().plusMillis(refreshExpirationMs);

        RefreshToken refreshToken = new RefreshToken(rawToken, user.getEmail(), expiresAt);
        return refreshTokenRepository.save(refreshToken);
    }

    /**
     * Validates that a token exists in the DB and is not revoked or expired.
     * Returns the record if valid; throws IllegalArgumentException otherwise.
     */
    public RefreshToken findValid(String token) {
        RefreshToken rt = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Refresh token not found"));

        if (rt.isRevoked()) {
            throw new IllegalArgumentException("Refresh token has been revoked");
        }
        if (rt.getExpiresAt().isBefore(Instant.now())) {
            refreshTokenRepository.delete(rt);
            throw new IllegalArgumentException("Refresh token has expired");
        }
        return rt;
    }

    /**
     * Atomically revokes the old token and issues a new one (rotation).
     */
    @Transactional
    public RefreshToken rotateRefreshToken(RefreshToken old, User user) {
        old.setRevoked(true);
        refreshTokenRepository.save(old);
        return createRefreshToken(user);
    }

    /**
     * Revokes all refresh tokens for a user (called on logout).
     */
    @Transactional
    public void revokeAllForUser(String email) {
        refreshTokenRepository.deleteByUserEmail(email);
    }
}
