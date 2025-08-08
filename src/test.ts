import { formatUnits } from "viem";
import main from "./api";
import db from "./db/neon";
import { CONTRACT_ADDRESS } from "./constants";
(async () => {
  // console.time("estimateBlockOneHourLater");
  // const block = await db.getAll(CONTRACT_ADDRESS, 1672700400, 1780562800);
  // console.timeEnd("estimateBlockOneHourLater");
  // console.log(block[block.length - 1]);

  try {
    main();
  } catch (error) {
    console.error((error as Error).message);
  }
  // console.log(formatUnits(BigInt("726348829077591487"), 18));
})();
