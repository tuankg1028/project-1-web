var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var findOrCreate = require("mongoose-findorcreate");

var schema = new Schema(
  {
    appName: String,
    categoryName: String,
    developer: String,
    updatedDate: String,
    description: String,
    contentPrivacyPolicy: String,
    currentVersion: String,
    size: String,
    installs: String,
    privacyLink: String,
    chplayLink: String,
    isCompleted: Boolean,
    appAPKPureId: String,
    appIdCHPlay: String,
    CHPlayLink: String,
    nodes: [
      {
        id: Schema.Types.ObjectId,
        name: String,
        value: Number,
        parent: Schema.Types.ObjectId,
      },
    ],
    apis: [
      {
        id: Schema.Types.ObjectId,
        name: String,
        left: Number,
        right: Number,
        parent: Schema.Types.ObjectId,
      },
    ],
    collectionData: [
      {
        id: Schema.Types.ObjectId,
        name: String,
        left: Number,
        right: Number,
        parent: Schema.Types.ObjectId,
        children: Schema.Types.Map,
      },
    ],
    thirdPartyData: [
      {
        id: Schema.Types.ObjectId,
        name: String,
        left: Number,
        right: Number,
        parent: Schema.Types.ObjectId,
        children: Schema.Types.Map,
      },
    ],
    retentionData: [
      {
        id: Schema.Types.ObjectId,
        name: String,
        left: Number,
        right: Number,
        parent: Schema.Types.ObjectId,
        children: Schema.Types.Map,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);
schema.plugin(findOrCreate);

// schema.virtual("permissions", {
//   ref: "permission",
//   localField: "_id",
//   foreignField: "appId"
// });
// schema.virtual("nodes", {
//   ref: "node",
//   localField: "_id",
//   foreignField: "appId"
// });
const model = mongoose.model("app", schema);

export default model;
