const { createClient } = require("redis");

const redisHost = process.env.REDIS_URL_HOST || "localhost"; 

const redisClient = createClient({
  url: `redis://${redisHost}:6379`,
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

(async () => {
  await redisClient.connect();
  console.log("Connected to Redis successfully");
})();

module.exports = redisClient;
