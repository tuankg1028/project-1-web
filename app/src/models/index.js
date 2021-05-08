import Tree from "./tree.model";
import App from "./app.model";
import AppTemp from "./app-temp.model";
import CategoryNode from "./category-node.model";
import CategoryMDroid from "./categoryMDroid";
import MPDroidDataset from "./MPDroidDataset";
import OurMaliciousDataset from "./ourMaliciousDataset.model";
import BeginDataset from "./beginDataset";
import MaliciousDataset from "./maliciousDataset";
class Model {
  constructor() {
    this.Tree = Tree;
    this.App = App;
    this.AppTemp = AppTemp;
    this.CategoryNode = CategoryNode;
    this.CategoryMDroid = CategoryMDroid;
    this.MPDroidDataset = MPDroidDataset;
    this.OurMaliciousDataset = OurMaliciousDataset;
    this.BeginDataset = BeginDataset;
    this.MaliciousDataset = MaliciousDataset;
  }
}
export default new Model();
