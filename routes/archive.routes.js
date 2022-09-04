const { Router } = require("express");

const Archive = require("../models/archive");

const router = Router();

const auth = require("../middleware/auth.middleware");

router.get("/", auth, async (req, res) => {
  try {
    const data = await Archive.find();
    res.status(201).json({ message: "Succes", response: data });
  } catch (e) {
    res.status(500).json({ message: "Server error", error: e });
  }
});

router.post("/add", auth, async (req, res) => {
  try {
    const { date, costs, andrianTotal, tanyaTotal, total } = req.body;
    const cost = new Archive({ date, costs, andrianTotal, tanyaTotal, total });

    await cost.save();
    res.status(201).json({ message: "Cost saved" });
  } catch (e) {
    res.status(500).json({ message: "Server error", error: e });
  }
});

module.exports = router;
