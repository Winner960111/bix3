const mongoose = require("mongoose");
const database = require("./database");

exports.mongo_connection = () => {
  // mongoose.set("debug", true);
  try {
    console.log("database connected",database.mongoUrl);
    mongoose.connect(
      // process..env.DB_MONGO_URL || 'mongodb://localhost:27017/bluebix',
      database.mongoUrl,
      { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex : true },
      function (err, db) {
        if (err) {
          console.log("MongoDB Database Connection Error", err);
        } else {
          console.log("MongoDB Connection Done!!");
        }
      }
    );
  } catch (e) {
    console.log("MongoDB Connection Error");
  }
};
