const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const authRourter = require("./routes/admin/auth");


const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    keys: ["jf2fjsf5fjg99k"],
  })
);

app.use(authRourter);

app.listen(3000, () => {
  console.log("listening");
});
