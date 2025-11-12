package dev.bank.auth.jwt;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import dev.bank.auth.config.JwtProperties;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {
  private final Algorithm algo;
  private final String issuer;

  public JwtService(JwtProperties props) {
    this.algo = Algorithm.HMAC256(props.secret());
    this.issuer = props.issuer();
  }

  public String issue(Long id, String email) {
    Instant now = Instant.now();
    return JWT.create()
        .withIssuer(issuer)
        .withIssuedAt(Date.from(now))
        .withExpiresAt(Date.from(now.plusSeconds(3600)))
        .withSubject(String.valueOf(id))
        .withClaim("email", email)
        .sign(algo);
  }
}
