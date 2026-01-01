import { Network, NetworkKey } from "../constantAssets/asset.model";
import { findMany, updateWithDraw } from "./withdraw.service";


function fakeTxHash() {
  return (
    "0x" +
    Math.random().toString(16).slice(2).padEnd(64, "0")
  );
}

function isNetworkKey(value: string): value is NetworkKey {
  return value in Network;
}

export function startWithdrawWatcher() {
  setInterval(async () => {
    const pendingWithdraws = await findMany({ status: "PENDING" });
    const processingWithdraws = await findMany({ status: "PROCESSING" });
    const withdraw = [...pendingWithdraws, ...processingWithdraws];

    for (const wd of withdraw) {
      if (!isNetworkKey(wd.network)) {
        continue;
      }
      const chain = Network[wd.network];
      if (!chain) continue;

      if (!wd.txHash) {
        if (Math.random() < 0.7) continue;

        await updateWithDraw(wd._id.toString(), {
          txHash: fakeTxHash(),
          confirmations: 0,
          status: "PROCESSING",
          processedAt: new Date()
        });


        continue;
      }
      const next = wd.confirmations + 1;

      await updateWithDraw(wd._id.toString(), {
        confirmations: next,
        status:
          next >= chain.requiredConfirmations
            ? "COMPLETED"
            : "PROCESSING",
        completedAt: next >= chain.requiredConfirmations ? new Date() : null
      });
    }
  }, 15_000);
}