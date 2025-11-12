package dev.bank.account.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import dev.bank.account.model.Account;

public interface AccountRepo extends JpaRepository<Account, Long> {
  List<Account> findByOwnerEmail(String email);
}
