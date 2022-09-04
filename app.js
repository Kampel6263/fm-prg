const express = require("express");
const config = require("config");
const path = require("path");
const mongoose = require("mongoose");

const app = express();

app.use(express.json({ extended: true }));

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/bank", require("./routes/bank.routes"));
app.use("/api/user", require("./routes/user.routes"));
app.use("/api/cost", require("./routes/cost.routes"));
app.use("/api/archive", require("./routes/archive.routes"));
app.use("/api/currency", require("./routes/currency.routes"));

if (process.env.NODE_ENV === "production") {
  app.use("/", express.static(path.join(__dirname, "client", "build")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

const PORT = config.get("port") || 5000;
const MONGO_URL = config.get("mongoUrl");
async function start() {
  try {
    await mongoose.connect(MONGO_URL);
    app.listen(PORT, () => console.log(`Server started on port ${PORT}...`));
  } catch (e) {
    console.log("Server Error", e.message);
    process.exit(1);
  }
}

start();
