import Helpers from "../helpers";
const { parentPort, workerData } = require("worker_threads");

const { leafNodes, contents } = workerData;
const result = leafNodes.map((leafNode) => {
  try {
    const { parent } = leafNode;
    const lastFunctionOfParent = parent.name.split(".").pop();

    const baseLine =
      contents.includes(parent.name.toLowerCase().replace(/\s|;/g, "")) &&
      contents.includes(
        lastFunctionOfParent.toLowerCase() +
          "." +
          leafNode.name.toLowerCase().replace(/\([A-Za-z0-9_.<>, \[\]]*\)/i, "")
      )
        ? 1
        : 0;
    return {
      _id: leafNode._id,
      id: leafNode._id,
      name: leafNode.name,
      desc: leafNode.desc,
      left: leafNode.left,
      right: leafNode.right,
      parent: leafNode.parent,
      baseLine,
    };
  } catch (e) {
    console.log(leafNode);
    console.log(e);
    Helpers.Logger.error(`ERROR _computeBaseLineLeafNode: ${e.message}`);
  }
});

parentPort.postMessage(result);
