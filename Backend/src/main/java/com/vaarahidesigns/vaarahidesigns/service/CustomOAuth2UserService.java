package com.vaarahidesigns.vaarahidesigns.service;

import com.vaarahidesigns.vaarahidesigns.entity.User;
import com.vaarahidesigns.vaarahidesigns.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Called by Spring Security after Google successfully authenticates the user.
 * Extracts profile info from Google and upserts the User in the database.
 */
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        // Delegate to default implementation to fetch the user from Google
        OAuth2User oAuth2User = super.loadUser(userRequest);

        // Extract attributes sent back by Google
        String providerId = oAuth2User.getAttribute("sub");   // Google's unique user ID
        String email      = oAuth2User.getAttribute("email");
        String name       = oAuth2User.getAttribute("name");
        String picture    = oAuth2User.getAttribute("picture");
        String provider   = userRequest.getClientRegistration().getRegistrationId(); // "google"

        // Upsert: find existing user by email, or create a new one
        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isEmpty()) {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(name);
            newUser.setPicture(picture);
            newUser.setProvider(provider);
            newUser.setProviderId(providerId);
            userRepository.save(newUser);
        } else {
            // Update picture / name in case they changed on Google
            User user = existingUser.get();
            user.setName(name);
            user.setPicture(picture);
            userRepository.save(user);
        }

        return oAuth2User;
    }
}
