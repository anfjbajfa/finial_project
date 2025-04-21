const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  requireRole,
} = require("../controllers/authMiddleware");
const getRank = require("../controllers/getRankController");
const ApplicationController = require("../controllers/applicationController");

// student route
router.post("/student/getRank", authenticateToken, getRank);

router.post(
  "/student/apply",
  authenticateToken,
  ApplicationController.applicationhandler
);

router.post(
  "/student/delete",
  authenticateToken,
  ApplicationController.deleteStudentApplication
);

// admin & student query application route
// student: only get your own application record
router.get(
  "/student/getapplications/:studentId",
  authenticateToken,
  ApplicationController.getStudentApplications
);

// admin: get all application results
router.get(
  "/admin/getapplications",
  authenticateToken,
  requireRole("admin"),
  ApplicationController.getAllApplications
);

router.post(
  "/admin/acceptApplication",
  authenticateToken,
  requireRole("admin"),
  ApplicationController.acceptApplication
);

router.post(
  "/admin/rejectApplication",
  authenticateToken,
  requireRole("admin"),
  ApplicationController.rejectApplication
);

module.exports = router;
