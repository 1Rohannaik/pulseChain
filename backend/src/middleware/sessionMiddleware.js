const session = require("express-session");
const RedisStore = require("connect-redis").RedisStore;
const redisClient = require("../lib/redis");

const sessionMiddleware = session({
  store: new RedisStore({
    client: redisClient,
    prefix: "pulsechain:",
  }),
  secret: process.env.SESSION_SECRET || "supersecret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, 
  },
});

module.exports = sessionMiddleware;
