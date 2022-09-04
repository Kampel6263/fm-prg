const { Schema, model } = require("mongoose");

const PaymentsShema = new Schema({
  sum: { type: Number, required: true },
  comment: { type: String, default: "No comment" },
  date: { type: String, required: true },
  time: { type: String, required: true },
  user: { type: String, required: true },
  _id: { type: String, required: true },
});

const CostShema = new Schema({
  name: { type: String, required: true },
  andrianSum: { type: Number, required: true },
  tanyaSum: { type: Number, required: true },
  andrianSpent: { type: Number, default: 0 },
  tanyaSpent: { type: Number, default: 0 },
  _id: { type: String, required: true },
  __v: { type: Number },
  payments: { type: [PaymentsShema] },
});

const ArchiveShema = new Schema({
  date: { type: String, required: true },
  costs: { type: [CostShema] },
  andrianTotal: { type: Number, required: true },
  tanyaTotal: { type: Number, required: true },
  total: { type: Number, required: true },
});

module.exports = model("Archive", ArchiveShema);
