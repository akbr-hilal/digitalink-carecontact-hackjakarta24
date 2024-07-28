const { auth } = require("../middleware/auth");
const { uploadImage } = require("../middleware/uploadFiles");
const { addAgency, updateAgency, deleteAgency, getAgency, getAgencyId } = require("../service/agency");
const { register, login, checkAuth } = require("../service/auth");
const { addReport, generateAI, getReport, getReportId, deleteReport, updateReport } = require("../service/report");
const { getRole } = require("../service/role");
const router = require('express').Router();


module.exports = router;

router.post("/register", register);
router.post("/login", login)
router.get("/check-auth", auth, checkAuth);
router.post("/add-agency", addAgency);
router.post("/update-agency/:id", updateAgency);
router.post("/delete-agency/:id", deleteAgency);
router.get("/get-agency", getAgency);
router.get("/get-agency/:id", getAgencyId);
router.get("/get-role", getRole);
router.post("/add-report", auth, uploadImage("imageInput"), addReport);
// router.post("/generate-AI", uploadImage("imageInput"), generateAI)
router.get("/get-report", getReport);
router.get("/get-report/:id", getReportId);
router.post("/delete-report/:id", deleteReport);
router.post("/confirm-report/:id", updateReport);

module.exports = router;