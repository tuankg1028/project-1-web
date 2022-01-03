var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var findOrCreate = require("mongoose-findorcreate");

var schema = new Schema(
  {
    appId: Schema.Types.ObjectId,
    apisFromSource: [
      {
        id: Schema.Types.ObjectId,
        name: String,
        classes: [String],
        functions: Schema.Types.Object
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);
schema.plugin(findOrCreate);


const model = mongoose.model("appMetadata", schema);

export default model;
