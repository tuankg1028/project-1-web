var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var findOrCreate = require("mongoose-findorcreate");

var schema = new Schema(
  {
    appId: Schema.Types.ObjectId,
    id: String,
    userName: String,
    userImage: String,
    date: String,
    score: Number,
    scoreText: String,
    url: String,
    title: String,
    text: String,
    textLower: String,
    replyDate: String,
    replyText: String,
    version: String,
    thumbsUp: Number,
    criterias: Schema.Types.Array,
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
const model = mongoose.model("appComment", schema);

export default model;
