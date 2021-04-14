const Models = require("../models");
const insertNode = (node, parentName, tree) => {};

const getTreeFromNode = async (nodeId) => {
  const nodePath = await getNodePath(nodeId);
};

const getNodePath = async (nodeId, pathString = "") => {
  pathString += `${nodeId}.`;

  const node = await Models.default.Tree.findById();
};
export default {
  insertNode,
  getTreeFromNode,
};
