const { Schema, model } = require("mongoose");

const Currency = new Schema({
  USD: { type: Number, required: true },
  date: { type: String, required: true },
});

module.exports = model("Currency", Currency);
