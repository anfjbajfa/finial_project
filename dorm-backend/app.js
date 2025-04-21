const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// router import
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

const protectedRoutes = require("./routes/protectedRoute");
app.use("/authorized", protectedRoutes);

const dormInfoRequest = require("./routes/mapinfo");
app.use(dormInfoRequest);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
