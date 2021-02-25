import Tree from "./tree.model";
import App from "./app.model";
import AppTemp from "./app-temp.model";

class Model {
  constructor() {
    this.Tree = Tree;
    this.App = App;
    this.AppTemp = AppTemp;
  }
}
export default new Model();
