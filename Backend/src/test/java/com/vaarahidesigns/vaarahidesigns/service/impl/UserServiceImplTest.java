package com.vaarahidesigns.vaarahidesigns.service.impl;

import com.vaarahidesigns.vaarahidesigns.entity.User;
import com.vaarahidesigns.vaarahidesigns.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserServiceImpl userService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1);
        user.setName("Test User");
        user.setEmail("test@example.com");
        user.setPhnum(9876543210L);
    }

    @Test
    void saveUser_shouldReturnSavedUser() {
        when(userRepository.save(user)).thenReturn(user);
        User result = userService.saveUser(user);
        assertThat(result).isEqualTo(user);
        verify(userRepository).save(user);
    }

    @Test
    void getUserById_shouldReturnUser_whenFound() {
        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        Optional<User> result = userService.getUserById(1);
        assertThat(result).isPresent().contains(user);
    }

    @Test
    void getUserById_shouldReturnEmpty_whenNotFound() {
        when(userRepository.findById(99)).thenReturn(Optional.empty());
        Optional<User> result = userService.getUserById(99);
        assertThat(result).isEmpty();
    }

    @Test
    void getUserByEmail_shouldReturnUser() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        Optional<User> result = userService.getUserByEmail("test@example.com");
        assertThat(result).isPresent().contains(user);
    }

    @Test
    void getUserByPhnum_shouldReturnUser() {
        when(userRepository.findByPhnum(9876543210L)).thenReturn(Optional.of(user));
        Optional<User> result = userService.getUserByPhnum(9876543210L);
        assertThat(result).isPresent().contains(user);
    }

    @Test
    void getAllUsers_shouldReturnList() {
        when(userRepository.findAll()).thenReturn(List.of(user));
        List<User> result = userService.getAllUsers();
        assertThat(result).hasSize(1).contains(user);
    }

    @Test
    void updateUser_shouldUpdateAndReturn() {
        User updated = new User();
        updated.setName("Updated");
        updated.setEmail("updated@example.com");
        updated.setPhnum(1234567890L);

        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArguments()[0]);

        User result = userService.updateUser(1, updated);
        assertThat(result.getName()).isEqualTo("Updated");
        assertThat(result.getEmail()).isEqualTo("updated@example.com");
    }

    @Test
    void updateUser_shouldThrow_whenNotFound() {
        when(userRepository.findById(99)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> userService.updateUser(99, user))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void deleteUser_shouldCallDeleteById() {
        doNothing().when(userRepository).deleteById(1);
        userService.deleteUser(1);
        verify(userRepository).deleteById(1);
    }
}
