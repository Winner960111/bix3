const express = require("express");
const cors = require('cors')
const http = require("http")
const path = require("path");
const bodyParser = require("body-parser")
const routes = require("./routes/index")
const indexRouter = require("./routes/index");
const { mongodb, commonResponse } = require("./helper");

const app = express()
app.use(cors());
require("dotenv").config()

app.use(bodyParser.json({ limit: "50mb" }))
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.static(path.join(__dirname, "public")));

indexRouter.initialize(app);
mongodb.mongo_connection();

app.get("/hi", (req, res, next) => {
   console.log("hello world");
})


app.use(function (req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

   console.log("this appjs middleware called ");
   //next(createError(404));
   const error = new Error("Not Found");
   error.status = 404;
   next(error);
});

app.use((error, req, res, next) => {
   console.log("this 2nd appjs middleware called ");

   res.status(error.status || 500);
   /*res.json({
     error: true,
     message: error.message,
   });*/

   return commonResponse.error(res, error.message, error.status);
});


const server = http.createServer(app)
const port = process.env.PORT || '5000';
// var timeZone = process.env.TZ || 'asia/kolkata'


console.log(`Server Started at PORT ${port}`)
server.listen(port)


module.exports = app;
