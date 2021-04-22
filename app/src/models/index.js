import Tree from "./tree.model";
import App from "./app.model";
import AppTemp from "./app-temp.model";
import CategoryNode from "./category-node.model";
import CategoryMDroid from "./categoryMDroid";
class Model {
  constructor() {
    this.Tree = Tree;
    this.App = App;
    this.AppTemp = AppTemp;
    this.CategoryNode = CategoryNode;
    this.CategoryMDroid = CategoryMDroid;
  }
}
export default new Model();
