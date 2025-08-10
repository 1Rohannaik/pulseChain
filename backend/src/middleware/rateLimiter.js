const rateLimit = require("express-rate-limit");
const RedisStoreImport = require("rate-limit-redis");
const RedisStore = RedisStoreImport.default || RedisStoreImport;
const redisClient = require("../lib/redis");

const limiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }),
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again after 15 minutes",
});

module.exports = limiter;
