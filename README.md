# WETH verifier

This squids goes through the historical `Deposit` and `Withdrwal` logs emitted by the [WETH Wrapper Contract](https://etherscan.io/token/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2)

To learn more about Squid SDK, check the [docs](https://docs.subsquid.io)

## Run

```bash
# 1. Install dependencies
npm ci

# 2. Compile typescript files
make build

# 3. Start target Postgres database and detach
make up

# 4. Start the processor
make process
```

The output will show the progress, the amount of deposited, withdrawn ether, and the amount held by the contract at the current block.