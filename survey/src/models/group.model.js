var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var findOrCreate = require("mongoose-findorcreate");

var groupSchema = new Schema(
  {
    name: String,
    keyword: String,
    description: String
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }
  }
);
groupSchema.plugin(findOrCreate);

export default mongoose.model("group", groupSchema);
