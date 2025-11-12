package dev.bank.tx.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import dev.bank.tx.model.Txn;

public interface TxnRepo extends JpaRepository<Txn, Long> {
  List<Txn> findByFromAccountIdOrToAccountId(Long fromId, Long toId);
}
