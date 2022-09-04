const { Router } = require("express");
const config = require("config");
const User = require("../models/user");

const router = Router();

const auth = require("../middleware/auth.middleware");

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.userId });

    res.status(201).json({ message: "Succes", response: user });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/all", auth, async (req, res) => {
  try {
    const user = await User.find();

    res.status(201).json({ message: "Succes", response: user });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/edit", auth, async (req, res) => {
  try {
    const { name, salary, vat, ssc, company, id, email } = req.body;

    await User.findOneAndUpdate(
      { _id: id },
      {
        name,
        salary,
        vat,
        ssc,
        company,
      }
    );
    res.status(201).json({ message: "User edited!" });
  } catch (e) {
    res.status(500).json({ message: e });
  }
});

module.exports = router;
