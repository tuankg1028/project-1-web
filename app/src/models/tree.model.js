var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var findOrCreate = require("mongoose-findorcreate");

var schema = new Schema(
  {
    name: String,
    left: Number,
    right: Number,
    desc: String,
    parent: Schema.Types.ObjectId,
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
const model = mongoose.model("tree", schema);

export default model;
