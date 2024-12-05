const express = require("express");
const router = express.Router();
const alarmController = require("../controllers/alarmController");

// Định nghĩa route và gắn với controller
router.get("/", alarmController.getAllAlarms);         // Lấy danh sách báo thức
router.post("/", alarmController.createAlarm);        // Thêm báo thức mới
router.put("/:id", alarmController.updateAlarm);      // Cập nhật báo thức
router.delete("/:id", alarmController.deleteAlarm);   // Xóa báo thức

module.exports = router;
