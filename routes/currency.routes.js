const { Router } = require("express");
const router = Router();

const auth = require("../middleware/auth.middleware");
const Currency = require("../models/currency");

router.get("/", auth, async (req, res) => {
  try {
    const currency = await Currency.find();
    if (currency.length) {
      return res.status(201).json({ message: "Succes", response: currency[0] });
    }
    const newCurrency = new Currency({ USD: 36, date: "3/9/2022" });
    newCurrency.save();
    res.status(201).json({ message: "Succes", response: newCurrency });
  } catch (e) {
    res.status(500).json({ message: e });
  }
});

router.put("/change", auth, async (req, res) => {
  try {
    const { id, USD } = req.body;
    const date = new Date();
    const today =
      date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
    await Currency.findOneAndUpdate({ _id: id }, { USD, date: today });
    return res.status(201).json({ message: "Succes" });
  } catch (e) {
    res.status(500).json({ message: e });
  }
});

module.exports = router;
