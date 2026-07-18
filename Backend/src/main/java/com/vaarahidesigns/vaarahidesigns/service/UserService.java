package com.vaarahidesigns.vaarahidesigns.service;

import com.vaarahidesigns.vaarahidesigns.entity.User;
import java.util.List;
import java.util.Optional;

public interface UserService {
    User saveUser(User user);
    Optional<User> getUserById(Integer id);
    Optional<User> getUserByEmail(String email);
    Optional<User> getUserByPhnum(Long phnum);
    List<User> getAllUsers();
    User updateUser(Integer id, User user);
    void deleteUser(Integer id);
}
