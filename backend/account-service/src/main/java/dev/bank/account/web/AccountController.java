package dev.bank.account.web;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import dev.bank.account.model.Account;
import dev.bank.account.repo.AccountRepo;

@RestController
@CrossOrigin("*")
public class AccountController {
  private final AccountRepo repo;

  public AccountController(AccountRepo repo) {
    this.repo = repo;
  }

  @GetMapping("/me")
  public Object me(Authentication auth) {
    return java.util.Map.of("user", java.util.Map.of("email", auth.getName()));
  }

  @GetMapping("/accounts")
  public List<Account> myAccounts(Authentication auth) {
    return repo.findByOwnerEmail(auth.getName());
  }

  @PostMapping("/accounts")
  public Account open(Authentication auth, @RequestParam(name = "type", defaultValue = "SAVINGS") String type) {
    var acc = Account.builder().ownerEmail(auth.getName()).type(type).balance(new BigDecimal("1000.00")).build();
    return repo.save(acc);
  }
}
