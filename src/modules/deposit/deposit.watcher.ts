import { Network, NetworkKey } from "../constantAssets/asset.model";
import { depositModel } from "./deposit.model";

function fakeTxHash() {
  return (
    "0x" +
    Math.random().toString(16).slice(2).padEnd(64, "0")
  );
}

function isNetworkKey(value: string): value is NetworkKey {
  return value in Network;
}

export function startDepositWatcher() {
  setInterval(async () => {
    const deposits = await depositModel.findMany({status: 'PENDING'});

    for (const dep of deposits) {
      if (!isNetworkKey(dep.network)) {
        continue;
      }
      const chain = Network[dep.network];
      if (!chain) continue;

      if (!dep.txHash) {
        if (Math.random() < 0.7) continue;

        const initialConfirmations = 1;
        
        await depositModel.updateById(dep._id.toString(), {
          txHash: fakeTxHash(),
          confirmations: initialConfirmations,
          status: initialConfirmations >= chain.requiredConfirmations
            ? "COMPLETED"
            : "PENDING",
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
      if (dep.confirmations >= chain.requiredConfirmations) {
        continue;
      }
    }
  }, 15_000);
}