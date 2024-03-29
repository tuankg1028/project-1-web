import Tree from "./tree.model";
import App from "./app.model";
import AppTemp from "./app-temp.model";
import CategoryNode from "./category-node.model";
import CategoryMDroid from "./categoryMDroid";
import CategoryDataset from "./categoryDataset";
import MPDroidDataset from "./MPDroidDataset";
import OurMaliciousDataset from "./ourMaliciousDataset.model";
import BeginDataset from "./beginDataset";
import MaliciousDataset from "./maliciousDataset";
import AppFunction from "./app-functions.model";
import answerModel from "./answer.model";
import userModel from "./user.model";
import EDAModel from "./eda.model"
import Survey from "./survey.model"
import Sema from "./sema.model"
import AppMeta from "./app-metadata.model"
import AppComment from "./app-comment.model"
class Model {
  constructor() {
    this.User = userModel;
    this.Answer = answerModel;
    this.Tree = Tree;
    this.App = App;
    this.AppTemp = AppTemp;
    this.CategoryNode = CategoryNode;
    this.CategoryMDroid = CategoryMDroid;
    this.MPDroidDataset = MPDroidDataset;
    this.OurMaliciousDataset = OurMaliciousDataset;
    this.BeginDataset = BeginDataset;
    this.MaliciousDataset = MaliciousDataset;
    this.CategoryDataset = CategoryDataset;
    this.AppFunction = AppFunction
    this.EDA = EDAModel
    this.Survey = Survey
    this.Sema = Sema
    this.AppMeta = AppMeta
    this.AppComment = AppComment
  }
}
export default new Model();
