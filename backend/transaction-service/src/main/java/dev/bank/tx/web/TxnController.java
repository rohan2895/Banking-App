package dev.bank.tx.web;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import dev.bank.tx.model.Txn;
import dev.bank.tx.repo.TxnRepo;

@RestController
@RequestMapping("/transactions")
@CrossOrigin("*")
public class TxnController {
  private final TxnRepo repo;

  public TxnController(TxnRepo repo) {
    this.repo = repo;
  }

  public record CreateReq(Long fromAccountId, Long toAccountId, BigDecimal amount) {
  }

  @PostMapping
  public Txn create(@RequestBody CreateReq req) {
    return repo.save(Txn.builder()
        .fromAccountId(req.fromAccountId())
        .toAccountId(req.toAccountId())
        .amount(req.amount())
        .createdAt(Instant.now()).build());
  }

  @GetMapping("/{accountId}")
  public List<Txn> byAccount(@PathVariable Long accountId) {
    return repo.findByFromAccountIdOrToAccountId(accountId, accountId);
  }
}
