import track from "./services/tracker";
(async () => {
  // console.time("estimateBlockOneHourLater");
  // const block = await track();
  // console.timeEnd("estimateBlockOneHourLater");
  // console.log(block[block.length - 1]);

  try {
    track();
  } catch (error) {
    console.error((error as Error).message);
  }
  // console.log(formatUnits(BigInt("726348829077591487"), 18));
})();
