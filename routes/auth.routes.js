const { Router } = require("express");
const bcrypt = require("bcryptjs");
const config = require("config");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const User = require("../models/user");

const router = Router();
// /api/auth/register
router.post(
  "/register",
  [
    check("email", "Invalid email").isEmail(),
    check("password", "Min length password 6 symbols").isLength({ min: 6 }),
    check("name", "Name is undefined"),
  ],
  async (req, res) => {
    try {
      // return res
      //   .status(403)
      //   .json({ message: "The administrator forbade registration" });
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ errors: errors.array(), message: "Invalid data" });
      }

      const { email, password, name, img } = req.body;

      const candidate = await User.findOne({ email });

      if (candidate) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const user = new User({ email, password: hashedPassword, name, img });

      // await user.save();

      res.status(201).json({ message: "User created" });
    } catch (e) {
      res.status(500).json({ message: e });
    }
  }
);

// /api/auth/login
router.post(
  "/login",
  [
    check("email", "Invalid email").normalizeEmail().isEmail(),
    check("password", "Password is empty").exists(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ errors: errors.array(), message: "Invalid data" });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email });

      if (user) {
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
          const token = jwt.sign(
            { userId: user.id, email: user.email },
            config.get("jwtSecret"),
            {
              expiresIn: "100h",
            }
          );
          res.json({ token, userId: user.id });
        } else {
          return res.status(401).json({ message: "Incorrect password" });
        }
      } else {
        return res.status(401).json({ message: "User is not exists" });
      }
    } catch (e) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
