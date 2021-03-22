import userModel from "./user.model";
import appModel from "./app.model";
import permissionModel from "./permission.model";
import nodeModel from "./node.model";
import answerModel from "./answer.model";
import categoryModel from "./category.model";
import groupModel from "./group.model";
import treeModel from "./tree.model";

class Model {
  constructor() {
    this.User = userModel;
    this.Answer = answerModel;
    this.Permission = permissionModel;
    this.Node = nodeModel;
    this.App = appModel;
    this.Category = categoryModel;
    this.Group = groupModel;
    this.Tree = treeModel;
    
  }
}
export default new Model();
