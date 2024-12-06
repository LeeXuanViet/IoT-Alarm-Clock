const mqtt = require("mqtt");

// Kết nối tới broker MQTT
const brokerUrl = "mqtt://broker.hivemq.com";  // Bạn có thể thay đổi địa chỉ broker
const mqttClient = mqtt.connect(brokerUrl);

mqttClient.on("connect", () => {
  console.log("Đã kết nối tới MQTT broker!");
  mqttClient.subscribe("alarma/control", (err) => {
    if (!err) {
      console.log("Đã subscribe topic alarma/control");
    }
  });
});

mqttClient.on("message", (topic, message) => {
  console.log(`Nhận tin nhắn từ topic ${topic}: ${message.toString()}`);
  // Xử lý các tin nhắn MQTT nếu cần
});

// Gửi lệnh đến phần cứng qua MQTT
const sendCommand = (command, payload) => {
  mqttClient.publish(`alarma/${command}`, JSON.stringify(payload), (err) => {
    if (err) {
      console.error(`Lỗi khi gửi lệnh MQTT: ${err.message}`);
    } else {
      console.log(`Đã gửi lệnh ${command}:`, payload);
    }
  });
};

module.exports = { mqttClient, sendCommand };
