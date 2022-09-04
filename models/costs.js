const { Schema, model } = require("mongoose");

const PaymentsShema = new Schema({
  sum: { type: Number, required: true },
  comment: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  user: { type: String, required: true },
});

const CostShema = new Schema({
  name: { type: String, required: true },
  andrianSum: { type: Number, required: true },
  tanyaSum: { type: Number, required: true },
  andrianSpent: { type: Number, default: 0 },
  tanyaSpent: { type: Number, default: 0 },
  payments: [PaymentsShema],
});

module.exports = model("Cost", CostShema);
