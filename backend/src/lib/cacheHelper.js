const crypto = require("crypto");

function hashKey(prefix, str) {
  // optional: use hashed keys for long/unsafe strings
  const h = crypto.createHash("sha256").update(str).digest("hex");
  return `${prefix}:${h}`;
}

module.exports = {
  hashKey,

  async getSafe(client, key) {
    try {
      return await client.get(key); 
    } catch (err) {
      console.error(`Redis GET error for key "${key}":`, err.message);
      return null;
    }
  },

  async setSafe(client, key, ttlSeconds, value) {
    try {
      if (typeof ttlSeconds === "number" && ttlSeconds > 0) {
        await client.setEx(key, ttlSeconds, value);
      } else {
        await client.set(key, value);
      }
    } catch (err) {
      console.error(`Redis SET error for key "${key}":`, err.message);
    }
  },

  async delSafe(client, key) {
    try {
      await client.del(key);
    } catch (err) {
      console.error(`Redis DEL error for key "${key}":`, err.message);
    }
  },
};
