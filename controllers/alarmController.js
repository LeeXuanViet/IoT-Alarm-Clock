const Alarm = require("../models/alarm");
const { sendCommand } = require("../mqtt/mqttClient");  // Đảm bảo đã có MQTT Client để gửi lệnh
const moment = require('moment-timezone');

// Lấy danh sách báo thức
const getAllAlarms = async (req, res) => {
  try {
    const alarms = await Alarm.find();  // Lấy tất cả báo thức
    res.json(alarms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Thêm báo thức mới
const createAlarm = async (req, res) => {
  const alarm = new Alarm({
    id: req.body.id,
    // startDate: req.body.startDate,
    // alarmTime: req.body.alarmTime,
    startDate: new Date(req.body.startDate),      // Chuyển đổi sang Date
    alarmTime: new Date(req.body.alarmTime),      // Chuyển đổi sang Date
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
};

// Cập nhật báo thức
// const updateAlarm = async (req, res) => {
//   try {
//     const alarm = await Alarm.findOne({ id: req.params.id });
//     if (!alarm) {
//       return res.status(404).json({ message: "Không tìm thấy báo thức" });
//     }

//     Object.assign(alarm, req.body);  // Cập nhật thông tin báo thức
//     alarm.updateDate = Date.now();
//     const updatedAlarm = await alarm.save();
//     res.json(updatedAlarm);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };

// updateAlarm
const updateAlarm = async (req, res) => {
  try {
    const alarm = await Alarm.findOne({ id: req.params.id });
    if (!alarm) {
      return res.status(404).json({ message: "Không tìm thấy báo thức" });
    }
    // Chuyển đổi các trường ngày giờ sang Date nếu có
    if (req.body.startDate) {
      alarm.startDate = new Date(req.body.startDate);
    }
    if (req.body.alarmTime) {
      alarm.alarmTime = new Date(req.body.alarmTime);
    }
    // Cập nhật các trường khác
    if (req.body.isUsed !== undefined) alarm.isUsed = req.body.isUsed;
    if (req.body.sound !== undefined) alarm.sound = req.body.sound;
    if (req.body.volume !== undefined) alarm.volume = req.body.volume;
    if (req.body.lightBlink !== undefined) alarm.lightBlink = req.body.lightBlink;
    if (req.body.repeat !== undefined) alarm.repeat = req.body.repeat;
    if (req.body.createDate !== undefined) alarm.updateDate = req.body.createDate
    
    alarm.updateDate = Date.now();
    const updatedAlarm = await alarm.save();
    res.json(updatedAlarm);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Xóa báo thức
const deleteAlarm = async (req, res) => {
  try {
    const alarm = await Alarm.findOneAndDelete({ id: req.params.id });
    if (!alarm) {
      return res.status(404).json({ message: "Không tìm thấy báo thức" });
    }
    res.json({ message: "Đã xóa báo thức" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllAlarms,
  createAlarm,
  updateAlarm,
  deleteAlarm,
};
