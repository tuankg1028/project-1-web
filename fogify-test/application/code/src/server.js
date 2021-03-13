const { NODE_TYPE } = process.env;

if (!NODE_TYPE) throw new Error("not idenity node");

switch (true) {
  case NODE_TYPE === "IOT_NODE":
    require("./iot");
    break;
  case NODE_TYPE === "EDGE_NODE":
    require("./edge-server");
    break;

  default:
    require("./cloud");
    break;
}
