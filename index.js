const express = require('express');
const app = express();
const https = require("https");
const path = require('path');
const fs = require('fs');
const session = require('express-session');
require("dotenv").config({ path: './Config/.env' });
const passport = require('passport');
const routes = require('./Routes/routes');
const { sessionStore } = require('./Services/DB/db');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));

app.use(session({
     name: 'APP.sid',
     secret: process.env.SESSION_SECRET,
     resave: false,
     saveUninitialized: false,
     store: sessionStore,
     cookie: {
          httpOnly: true,
          secure: true,
          sameSite: true,
          maxAge: 1000 * 60 * 30,
     }
}));

app.use(passport.initialize());
app.use(passport.session());

require("./Config/session");

app.use(routes);

const sslServer = https.createServer({
     key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
     cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem'))
}, app);

sslServer.listen(3000, () => {
     console.log("Server is listening to port 3000");
})