var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var findOrCreate = require("mongoose-findorcreate");

var userSchema = new Schema(
  {
    appId: { type: Schema.Types.ObjectId, ref: "app" },
    name: String,
    group: String,
    description: String,
    leafNodeDataBuildTree: [
      {
        name: String,
        details: [String],
        group: {
          type: Schema.Types.ObjectId,
          ref: "group"
        },
        buildTreeValue: Number,
        replacedName: String
      }
    ],
    categoryName: String,
    desc: String
  },
  {
    timestamps: true
  }
);
userSchema.plugin(findOrCreate);
export default mongoose.model("node", userSchema);
