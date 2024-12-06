const Alarm = require("../models/alarm");
const { sendCommand } = require("../mqtt/mqttClient");  // Đảm bảo đã có MQTT Client để gửi lệnh

// Kiểm tra và xử lý báo thức
const checkAndTriggerAlarm = async () => {
  const now = new Date();
  const alarms = await Alarm.find({ isUsed: true });  // Lấy tất cả báo thức đang bật

  alarms.forEach((alarm) => {
    if (
      alarm.alarmTime <= now && // Nếu thời gian báo thức đã đến
      alarm.startDate <= now && // Nếu ngày bắt đầu báo thức đã qua
      (!alarm.repeat || alarm.repeat === "None" || alarm.repeat === now.getDay()) // Kiểm tra chu kỳ lặp lại
    ) {
      console.log(`Kích hoạt báo thức ID: ${alarm.id}`);

      // Gửi lệnh phát nhạc qua MQTT
      sendCommand("playMusic", { sound: alarm.sound, volume: alarm.volume });

      // Gửi lệnh bật đèn nháy nếu có
      if (alarm.lightBlink) {
        sendCommand("lightBlink", { status: true });
      }

      // Tắt báo thức sau khi kích hoạt nếu không có repeat
      if (!alarm.repeat || alarm.repeat === "None") {
        alarm.isUsed = false;
        alarm.save();  // Lưu lại trạng thái báo thức đã tắt
      }
    }
  });
};

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
};

// Cập nhật báo thức
const updateAlarm = async (req, res) => {
  try {
    const alarm = await Alarm.findOne({ id: req.params.id });
    if (!alarm) {
      return res.status(404).json({ message: "Không tìm thấy báo thức" });
    }

    Object.assign(alarm, req.body);  // Cập nhật thông tin báo thức
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
  checkAndTriggerAlarm,
};
