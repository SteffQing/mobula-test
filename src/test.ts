import track from "./api/tracker";
(async () => {
  // console.time("estimateBlockOneHourLater");
  // const block = await db.getAll(CONTRACT_ADDRESS, 1672700400, 1780562800);
  // console.timeEnd("estimateBlockOneHourLater");
  // console.log(block[block.length - 1]);

  try {
    track();
  } catch (error) {
    console.error((error as Error).message);
  }
  // console.log(formatUnits(BigInt("726348829077591487"), 18));
})();
