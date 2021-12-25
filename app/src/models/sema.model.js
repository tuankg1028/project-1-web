var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var findOrCreate = require("mongoose-findorcreate");

var schema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId
    },
    data: Object
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);
schema.plugin(findOrCreate);


const model = mongoose.model("sema", schema, "sema");

export default model;
