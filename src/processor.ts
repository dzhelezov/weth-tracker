import { TypeormDatabase } from "@subsquid/typeorm-store";
import {EvmBatchProcessor} from '@subsquid/evm-processor'
import { events, Contract } from "./abi/weth";
import assert from "assert";
import { ethers } from "ethers";

const WETH_CONTRACT='0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

const processor = new EvmBatchProcessor()
  .setDataSource({
    chain: 'https://rpc.ankr.com/eth',
    archive: 'https://eth-stage1.archive.subsquid.io',
  })
  .addLog([
    WETH_CONTRACT
  ], {
    filter: [[
      events.Deposit.topic, events.Withdrawal.topic
    ]],
    data: {
      evmLog: {
          topics: true,
          data: true,
      },
    } as const,
  })
  
let deposited =  ethers.BigNumber.from(0)
let withdrawn = ethers.BigNumber.from(0)

processor.run(new TypeormDatabase(), async (ctx) => {
  let b = null;
  for (let c of ctx.blocks) {
    for (let i of c.items) {
      // apply arbitrary data transformation logic here
      // use ctx.store to persist the data
      b = c.header;
      if(i.kind !== 'evmLog') {
        continue
      }
      if (i.evmLog.topics[0] == events.Deposit.topic) {
        const amt = events.Deposit.decode(i.evmLog).wad
        deposited = deposited.add(amt)
        continue
      }
      if (i.evmLog.topics[0] == events.Withdrawal.topic) {
        const amt = events.Withdrawal.decode(i.evmLog).wad
        withdrawn = withdrawn.add(amt)
        continue
      }
    }
  }
  assert(b, 'must be defined')
  let supply = await (new Contract({ _chain: ctx._chain, block: b}, WETH_CONTRACT).totalSupply())
  ctx.log.info(`Deposited: ${deposited.toString()}, Withdrawn: ${withdrawn.toString()}, Diff: ${deposited.sub(withdrawn).toString()}, Supply: ${supply.toString()}`)
});

