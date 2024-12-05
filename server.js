const express = require("express");
const mongoose = require("mongoose");
const alarmRoutes = require("./routes/alarmRoutes");

const app = express();
app.use(express.json()); // Hỗ trợ parse JSON

// Kết nối MongoDB
mongoose.connect(
  "mongodb://localhost:27017/iot_alarm_db", // Thay URL bằng MongoDB cục bộ hoặc Atlas
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const db = mongoose.connection;
db.on("error", (err) => console.error("Lỗi kết nối MongoDB:", err));
db.once("open", () => console.log("Đã kết nối tới MongoDB!"));

// Sử dụng router
app.use("/alarms", alarmRoutes);

// Khởi động server
const PORT = 8080;
app.listen(PORT, () => console.log(`Server đang chạy trên cổng ${PORT}`));
