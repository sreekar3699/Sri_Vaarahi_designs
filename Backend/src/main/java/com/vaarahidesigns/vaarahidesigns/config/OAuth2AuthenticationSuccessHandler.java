package com.vaarahidesigns.vaarahidesigns.config;

import com.vaarahidesigns.vaarahidesigns.entity.RefreshToken;
import com.vaarahidesigns.vaarahidesigns.entity.User;
import com.vaarahidesigns.vaarahidesigns.repository.UserRepository;
import com.vaarahidesigns.vaarahidesigns.security.JwtUtil;
import com.vaarahidesigns.vaarahidesigns.service.RefreshTokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

/**
 * Handles the redirect after a successful Google OAuth2 login.
 * Issues an access token + refresh token and redirects the frontend
 * with both tokens and the user's role as query params.
 */
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;

    private static final String FRONTEND_URL = "http://localhost:5173";

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");

        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            String accessToken  = jwtUtil.generateToken(user);
            RefreshToken rt     = refreshTokenService.createRefreshToken(user);

            // Null-safe encode: a null role/token becomes an empty string
            String safeAccess  = accessToken        != null ? accessToken        : "";
            String safeRefresh = rt.getToken()       != null ? rt.getToken()       : "";
            String safeRole    = user.getRole()      != null ? user.getRole()      : "USER";

            String redirectUrl = FRONTEND_URL
                    + "?oauth2=success"
                    + "&token="        + URLEncoder.encode(safeAccess,  StandardCharsets.UTF_8)
                    + "&refreshToken=" + URLEncoder.encode(safeRefresh, StandardCharsets.UTF_8)
                    + "&role="         + URLEncoder.encode(safeRole,    StandardCharsets.UTF_8);

            response.sendRedirect(redirectUrl);
        } else {
            response.sendRedirect(FRONTEND_URL + "?oauth2=error");
        }
    }
}
