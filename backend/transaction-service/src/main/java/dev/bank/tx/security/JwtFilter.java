package dev.bank.tx.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;

import dev.bank.tx.config.JwtProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {
  private final Algorithm algo;
  private final String issuer;

  public JwtFilter(JwtProperties props) {
    this.algo = Algorithm.HMAC256(props.secret());
    this.issuer = props.issuer();
  }

  @Override
  protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
      throws ServletException, IOException {
    String h = req.getHeader("Authorization");
    if (h != null && h.startsWith("Bearer ")) {
      try {
        var jwt = JWT.require(algo).withIssuer(issuer).build().verify(h.substring(7));
        String email = jwt.getClaim("email").asString();
        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken(email, null, List.of(new SimpleGrantedAuthority("ROLE_USER"))));
      } catch (Exception e) {
        System.out.println("JWT verify failed: " + e.getMessage());
      }
    }
    chain.doFilter(req, res);
  }
}
