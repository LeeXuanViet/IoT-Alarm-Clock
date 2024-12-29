const mqtt = require("mqtt");
const Alarm = require("../models/alarm");

const brokerUrl = "mqtts://ecf22a1dfa034798b1141f4961c7a591.s1.eu.hivemq.cloud"; 
const mqttOptions = {
  port: 8883,
  username: "giang1601",
  password: "Gb@298957",
};
const mqttClient = mqtt.connect(brokerUrl, mqttOptions);

mqttClient.on("connect", () => {
  console.log("Đã kết nối tới MQTT broker!");

  mqttClient.subscribe("esp32/ds1307", (err) => {
    if (!err) {
      console.log("Đã subscribe topic esp32/ds1307");
    } else {
      console.error("Lỗi khi subscribe topic esp32/ds1307:", err.message);
    }
  });
});

mqttClient.on("message", async (topic, message) => {
  if (topic === "esp32/ds1307") {
    try {
      // Parse thời gian thực từ ESP32
      const espTime = JSON.parse(message.toString());
      const currentDay = espTime.day; // Lấy thứ hiện tại (Sat, Sun, ...)
      const currentTime = formatTime(espTime.time); // Định dạng thời gian chuẩn HH:mm:ss

      console.log(`Thời gian thực nhận được: ${currentDay}, ${espTime.time}, ${espTime.date}`);

      // Lấy danh sách báo thức đang bật
      const alarms = await Alarm.find({ isUsed: true });
      alarms.forEach((alarm) => {
        const alarmTime = new Date(alarm.alarmTime);
        const alarmDay = getDayOfWeek(alarmTime.getDay()); // Chuyển thứ từ số sang tên
        const alarmTimeStr = formatTime(alarmTime.toISOString().substring(11, 19)); // Lấy giờ:phút:giây từ alarmTime

        console.log(`Kiểm tra báo thức ID ${alarm.id}: ${alarmTimeStr}, ${alarmDay}, repeat: ${alarm.repeat}`);

        // So sánh giờ, phút và giây
        if (
          currentTime === alarmTimeStr && // Giờ:phút:giây trùng khớp
          (alarm.repeat === "Daily" || alarm.repeat.includes(currentDay)) // Kiểm tra lặp
        ) {
          console.log(`Kích hoạt báo thức ID: ${alarm.id}`);

          // Gửi lệnh phát nhạc
          sendCommand("playMusic", { sound: alarm.sound, volume: alarm.volume });

          // Gửi lệnh bật đèn nhấp nháy nếu có
          if (alarm.lightBlink) {
            sendCommand("lightBlink", { status: true });
          }

          // Tắt báo thức nếu không có repeat
          if (!alarm.repeat || alarm.repeat === "None") {
            alarm.isUsed = false;
            alarm.save(); // Lưu trạng thái đã tắt
          }
        }
        else if (currentTime === alarmTimeStr && alarm.repeat === "None" ) {
          console.log(`Kích hoạt báo thức ID: ${alarm.id}`);

          // Gửi lệnh phát nhạc
          sendCommand("playMusic", { sound: alarm.sound, volume: alarm.volume });

          // Gửi lệnh bật đèn nhấp nháy nếu có
          if (alarm.lightBlink) {
            sendCommand("lightBlink", { status: true });
          }
          // Tắt báo thức nếu không có repeat
            alarm.isUsed = false;
            alarm.save(); // Lưu trạng thái đã tắt 
        }
      });
    } catch (err) {
      console.error("Lỗi xử lý tin nhắn từ esp32/ds1307:", err.message);
    }
  }
});

// Hàm chuyển đổi ngày từ số (0-6) sang tên ngày
const getDayOfWeek = (dayNumber) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[dayNumber];
};

// Hàm chuẩn hóa thời gian (giờ:phút:giây) để có 2 chữ số cho phút và giây
const formatTime = (timeStr) => {
  const [hour, minute, second] = timeStr.split(":");
  return `${padZero(hour)}:${padZero(minute)}:${padZero(second)}`;
};

// Hàm thêm số 0 vào phút hoặc giây nếu cần thiết
const padZero = (value) => {
  return value.length === 1 ? "0" + value : value;
};

// Gửi lệnh đến phần cứng qua MQTT
const sendCommand = (command, payload) => {
  const topic = `alarms/${command}`;
  mqttClient.publish(topic, JSON.stringify(payload), (err) => {
    if (err) {
      console.error(`Lỗi khi gửi lệnh tới topic ${topic}: ${err.message}`);
    } else {
      console.log(`Đã gửi lệnh tới topic ${topic}:`, payload);
    }
  });
};

module.exports = { mqttClient, sendCommand };
