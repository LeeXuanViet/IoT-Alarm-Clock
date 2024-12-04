const express = require("express");
const router = express.Router();
const Alarm = require("../models/alarm");

// Lấy danh sách báo thức
router.get("/", async (req, res) => {
  try {
    const alarms = await Alarm.find();
    res.json(alarms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Thêm báo thức mới
router.post("/", async (req, res) => {
  const alarm = new Alarm({
    id: req.body.id,
    startDate: req.body.startDate,
    alarmTime: req.body.alarmTime,
    isUsed: req.body.isUsed,
    sound: req.body.sound,
    volume: req.body.volume,
    lightBlink: req.body.lightBlink,
    repeat: req.body.repeat,
  });

  try {
    const newAlarm = await alarm.save();
    res.status(201).json(newAlarm);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Cập nhật báo thức
router.put("/:id", async (req, res) => {
  try {
    const alarm = await Alarm.findOne({ id: req.params.id });
    if (!alarm) {
      return res.status(404).json({ message: "Không tìm thấy báo thức" });
    }

    Object.assign(alarm, req.body);
    alarm.updateDate = Date.now();
    const updatedAlarm = await alarm.save();
    res.json(updatedAlarm);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Xóa báo thức
router.delete("/:id", async (req, res) => {
  try {
    const alarm = await Alarm.findOneAndDelete({ id: req.params.id });
    if (!alarm) {
      return res.status(404).json({ message: "Không tìm thấy báo thức" });
    }
    res.json({ message: "Đã xóa báo thức" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
