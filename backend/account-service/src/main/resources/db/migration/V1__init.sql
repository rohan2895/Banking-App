CREATE TABLE IF NOT EXISTS accounts (
  id BIGSERIAL PRIMARY KEY,
  owner_email TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('SAVINGS','CURRENT')),
  balance NUMERIC(18,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transfers (
  id BIGSERIAL PRIMARY KEY,
  from_account_id BIGINT NOT NULL,
  to_account_id BIGINT NOT NULL,
  amount NUMERIC(18,2) NOT NULL CHECK (amount > 0),
  idem_key TEXT, -- for idempotency
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_from FOREIGN KEY (from_account_id) REFERENCES accounts(id),
  CONSTRAINT fk_to   FOREIGN KEY (to_account_id)   REFERENCES accounts(id)
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_transfers_idem ON transfers(idem_key) WHERE idem_key IS NOT NULL;
