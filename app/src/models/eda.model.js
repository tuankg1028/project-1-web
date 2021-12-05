var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var findOrCreate = require("mongoose-findorcreate");

var schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId
    },
    type: String,
    color: String,
    data: Object
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);
schema.plugin(findOrCreate);


const model = mongoose.model("eda", schema, "eda");

export default model;
