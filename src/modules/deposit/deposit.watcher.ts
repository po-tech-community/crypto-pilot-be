import { CHAIN_CONFIG } from "./deposit.config";
import { depositModel } from "./deposit.model";


function fakeTxHash() {
  return (
    "0x" +
    Math.random().toString(16).slice(2).padEnd(64, "0")
  );
}

export function startDepositWatcher() {
  setInterval(async () => {
    const deposits = await depositModel.findMany({status: 'PENDING'});

    for (const dep of deposits) {
      const chain = CHAIN_CONFIG[dep.network];
      if (!chain) continue;


      if (!dep.txHash) {
        if (Math.random() < 0.7) continue;

        await depositModel.updateById(dep._id.toString(), {
          txHash: fakeTxHash(),
          confirmations: 1,
        });

        continue;
      }
      const next = dep.confirmations + 1;

      await depositModel.updateById(dep._id.toString(), {
        confirmations: next,
        status:
          next >= chain.requiredConfirmations
            ? "COMPLETED"
            : "PENDING",
      });
    }
  }, 15_000);
}
