package dev.bank.auth.web;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import dev.bank.auth.jwt.JwtService;
import dev.bank.auth.user.User;
import dev.bank.auth.user.UserRepo;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.validation.annotation.Validated;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5173")
@Validated
public class AuthController {
  private final UserRepo users;
  private final JwtService jwt;
  private final PasswordEncoder encoder;

  public AuthController(UserRepo users, JwtService jwt, PasswordEncoder encoder) {
    this.users = users;
    this.jwt = jwt;
    this.encoder = encoder;
  }

  public record RegisterReq(@NotBlank String name, @Email String email, @NotBlank String password) {
  }

  public record LoginReq(@Email String email, @NotBlank String password) {
  }

  public record UserDto(Long id, String name, String email, String role) {
  }

  public record AuthRes(String token, UserDto user) {
  }

  @PostMapping("/register")
  public ResponseEntity<?> register(@Valid @RequestBody RegisterReq req) {
    if (users.findByEmail(req.email()).isPresent())
      return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Registration failed"));

    User u = users.save(User.builder()
        .name(req.name())
        .email(req.email())
        .passwordHash(encoder.encode(req.password())) // <-- hash
        .role("USER").build());
    String token = jwt.issue(u.getId(), u.getEmail());
    return ResponseEntity.ok(new AuthRes(token, new UserDto(u.getId(), u.getName(), u.getEmail(), u.getRole())));
  }

  @PostMapping("/login")
  public ResponseEntity<?> login(@Valid @RequestBody LoginReq req) {
    return users.findByEmail(req.email())
        .filter(u -> encoder.matches(req.password(), u.getPasswordHash())) // <-- verify
        .<ResponseEntity<?>>map(u -> {
          String token = jwt.issue(u.getId(), u.getEmail());
          return ResponseEntity.ok(new AuthRes(token, new UserDto(u.getId(), u.getName(), u.getEmail(), u.getRole())));
        })
        .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid credentials")));
  }
}
