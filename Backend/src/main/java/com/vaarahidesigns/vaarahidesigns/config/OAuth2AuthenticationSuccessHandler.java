package com.vaarahidesigns.vaarahidesigns.config;

import com.vaarahidesigns.vaarahidesigns.entity.User;
import com.vaarahidesigns.vaarahidesigns.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Optional;

/**
 * Handles the redirect after a successful Google OAuth2 login.
 * Redirects the user back to the frontend with a success indicator.
 */
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;

    // URL of the React frontend
    private static final String FRONTEND_URL = "http://localhost:5173";

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");

        Optional<User> user = userRepository.findByEmail(email);

        if (user.isPresent()) {
            // Redirect to frontend with the user's DB id as a query param
            // The frontend can use this to call /api/auth/me
            response.sendRedirect(FRONTEND_URL + "?oauth2=success&userId=" + user.get().getId());
        } else {
            response.sendRedirect(FRONTEND_URL + "?oauth2=error");
        }
    }
}
