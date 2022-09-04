const { Schema, model } = require("mongoose");

const Payments = new Schema({
  sum: Number,
  date: String,
  time: String,
  remains: Number,
});

const InUse = new Schema({
  name: String,
  email: String,
  userId: String,
  sum: Number,
  monthCount: Number,
  overpayment: Number,
  remains: Number,
  date: String,
  paymentPerMonth: Number,
  open: Boolean,
  payments: [Payments],
});

const TypeOfStorage = new Schema({
  typeName: String,
  amount: Number,
});

const PeterShema = new Schema({
  total: Number,
  mame: String,
  inUse: [InUse],
  typeOfStorage: [TypeOfStorage],
});

module.exports = model("Peter", PeterShema);
