const { Schema, model } = require("mongoose");

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, default: "" },
  salary: { type: Number, default: null },
  vat: { type: Number, default: 0 },
  ssc: { type: Number, default: 0 },
  company: { type: String, default: "" },
});

module.exports = model("User", UserSchema);
