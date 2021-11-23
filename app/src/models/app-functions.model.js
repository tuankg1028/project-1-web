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
    minInstalls: String,
    maxInstalls: String,
    privacyLink: String,
    chplayLink: String,
    isCompleted: {
      default: false,
      type: Boolean,
    },
    isCompletedJVCode: {
      default: false,
      type: Boolean,
    },
    appAPKPureId: String,
    appIdCHPlay: String,
    CHPlayLink: String,
    apisModel: String,
    PPModel: String,
    supplier: String,
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
    distance: Number,
    collectionData: String,
    thirdPartyData: String,
    retentionData: String,
    isExistedMobiPurpose: Boolean,
    dataTypes: [String],
    keyAndValue: [String],
    dynamicFunctions: [String],
    dynamicApis: [String],
    staticFunctions: [String],
    staticApis: [String],
    riskLevel: Number,
    dynamicGroup: String,
    staticGroup: String,
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
const model = mongoose.model("appFunction", schema);

export default model;
