const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const registerRoutes = require('./register');
const loginRoutes = require('./login');
const scheduleRoutes = require('./schedule');
const professorAvailabilityRoutes = require('./professorAvailability');
const newsRoutes = require('./news');
const notificationsRoutes = require('./notifications');


const app = express();
const port = 5000;
app.use(session({
  secret: 'secret-key',  
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' }
}));

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(cookieParser());

app.use("/register", registerRoutes);
app.use("/login", loginRoutes);
app.use("/schedule", scheduleRoutes);
app.use("/professorAvailability", professorAvailabilityRoutes);
app.use("/news", newsRoutes);
app.use("/notifications", notificationsRoutes); 

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
