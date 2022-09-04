const { Router } = require("express");
const Peter = require("../models/peter");
const router = Router();

const auth = require("../middleware/auth.middleware");

router.get("/", auth, async (req, res) => {
  try {
    const data = await Peter.findOne({ name: "storage" });

    res.status(201).json({ message: "Succes", response: data });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post(
  "/bank",
  auth,

  async (req, res) => {
    try {
      const data = new Peter(req.body);

      await data.save();

      res.status(201).json({ message: "Peter saved" });
    } catch (e) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.post("/getCredit", auth, async (req, res) => {
  try {
    const date = new Date();
    const today =
      date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();

    const bankU = await Peter.findOne({ name: "storage" });

    const { sum, monthCount, email, name, overpayment } = req.body;

    const bank = await Peter.findOneAndUpdate(
      { name: bankU.name },
      {
        inUse: [
          {
            userId: req.user.userId,
            name,
            email,
            sum: sum,
            monthCount: monthCount,
            remains: sum + overpayment,
            date: today,
            overpayment,
            paymentPerMonth: Math.ceil((sum + overpayment) / monthCount),
            open: true,
            payments: [],
          },
          ...bankU.inUse,
        ],
      }
    );

    res.status(201).json({ message: "Take credit succes", data: bank });
  } catch (e) {
    res.status(500).json({ message: e });
  }
});

router.post("/editStorage", auth, async (req, res) => {
  try {
    const { mono, cash, privat } = req.body;

    const prevStorage = await Peter.findOne({ name: "storage" });
    const newStorage = await Peter.findOneAndUpdate(
      { name: prevStorage.name },
      {
        total: mono + cash + privat,
        typeOfStorage: [
          {
            typeName: "Mono",
            amount: mono,
          },
          {
            typeName: "Cash",
            amount: cash,
          },
          {
            typeName: "Privat",
            amount: privat,
          },
        ],
      }
    );
    res.status(201).json({ message: "Storage updated" });
  } catch (e) {
    res.status(500).json({ message: e });
  }
});

router.post("/enterPayment", auth, async (req, res) => {
  try {
    const date = new Date();
    const today =
      date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();

    const timeNow =
      date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

    const { payment, creditClosed } = req.body;
    const prevInUse = await Peter.findOne({ name: "storage" });

    const newInUse = await Peter.findOneAndUpdate(
      { name: prevInUse.name },
      {
        inUse: prevInUse.inUse.map((el) => {
          const newRemains = el.remains - payment;

          return el.userId === req.user.userId && el.open
            ? {
                name: el.name,
                email: el.email,
                userId: el.userId,
                sum: el.sum,
                monthCount: el.monthCount,
                overpayment: el.overpayment,
                date: el.date,
                paymentPerMonth: el.paymentPerMonth,
                remains: newRemains < 0 ? 0 : newRemains,
                open: !creditClosed,
                payments: [
                  {
                    sum: payment,
                    date: today,
                    time: timeNow,
                    remains: newRemains < 0 ? 0 : newRemains,
                  },
                  ...el.payments,
                ],
              }
            : el;
        }),
      }
    );
    res.status(201).json({ message: "Payment enter", data: newInUse });

    // const
  } catch (e) {
    res.status(500).json({ message: e });
  }
});

module.exports = router;
