// const mongoose = require("mongoose");

// const alarmSchema = new mongoose.Schema({
//   id: { type: Number, required: true, unique: true }, // Id báo thức
//   startDate: { type: Date, required: true },          // Ngày bắt đầu báo thức
//   alarmTime: { type: Date, required: true },          // Thời gian báo thức
//   isUsed: { type: Boolean, default: false },          // Báo thức đang bật/tắt
//   sound: { type: Number, default: 1 },                // Loại nhạc
//   volume: { type: Number, default: 1.0 },             // Âm lượng
//   lightBlink: { type: Boolean, default: false },      // Đèn nhấp nháy
//   repeat: { type: String, default: "None" },          // Chu kỳ lặp lại
//   createDate: { type: Date, default: Date.now },      // Ngày tạo
//   updateDate: { type: Date, default: Date.now },      // Ngày cập nhật
// });

// module.exports = mongoose.model("Alarm", alarmSchema);


const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model("Counter", counterSchema);

const alarmSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true }, // Id báo thức
  startDate: { type: Date, required: true },          // Ngày bắt đầu báo thức
  alarmTime: { type: Date, required: true },          // Thời gian báo thức
  isUsed: { type: Boolean, default: false },          // Báo thức đang bật/tắt
  sound: { type: Number, default: 1 },                // Loại nhạc
  volume: { type: Number, default: 1.0 },             // Âm lượng
  lightBlink: { type: Boolean, default: false },      // Đèn nhấp nháy
  repeat: { type: String, default: "None" },          // Chu kỳ lặp lại
  createDate: { type: Date, default: Date.now },      // Ngày tạo
  updateDate: { type: Date, default: Date.now },      // Ngày cập nhật
});

// Middleware để tự động tăng id
alarmSchema.pre("save", async function (next) {
  const doc = this;
  if (!doc.isNew) return next();

  try {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "alarmId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true } // Tạo bộ đếm nếu chưa tồn tại
    );
    doc.id = counter.seq;
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Alarm", alarmSchema);
