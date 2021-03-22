var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var findOrCreate = require("mongoose-findorcreate");

var categorySchema = new Schema(
  {
    name: {
      type: Schema.Types.String,
      required: true
    }
  },
  {
    timestamps: true
  }
);
categorySchema.plugin(findOrCreate);

export default mongoose.model("Category", categorySchema);
