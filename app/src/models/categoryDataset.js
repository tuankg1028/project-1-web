var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var findOrCreate = require("mongoose-findorcreate");

var schema = new Schema(
  {
    nodes: [
      {
        name: String,
        value: Number,
        parent: Schema.Types.ObjectId,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);
schema.plugin(findOrCreate);

const model = mongoose.model("categoryDataset", schema);

export default model;
