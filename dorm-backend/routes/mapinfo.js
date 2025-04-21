const express = require("express");
const router = express.Router();
const mapinfoController = require("../controllers/mapinfoController");

router.get("/getdorminfo", mapinfoController.getdorminfo);

module.exports = router;
