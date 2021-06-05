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
        parent: Schema.Types.ObjectId
      }
    ],
    personalDataTypes: [
      {
        name: String,
        apis: [
          {
            name: String,
            left: Number,
            right: Number,
            parent: {
              type: Schema.Types.ObjectId,
              ref: "tree"
            }
          }
        ]
      }
    ],
    PPModel: String,
    apisModel: String,
    collectionData: String,
    thirdPartyData: String,
    collectionDataShowed: String,
    thirdPartyDataShowed: String,
    retentionData: String
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }
  }
);
schema.plugin(findOrCreate);

const model = mongoose.model("app", schema);

export default model;
