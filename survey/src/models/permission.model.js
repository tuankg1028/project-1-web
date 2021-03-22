var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var findOrCreate = require("mongoose-findorcreate");

var permissionSchema = new Schema(
  {
    keyword: String,
    detail: String,
    appId: { type: Schema.Types.ObjectId, ref: "app" }
  },
  {
    timestamps: true
  }
);
permissionSchema.plugin(findOrCreate);
export default mongoose.model("permission", permissionSchema);
