/**
 * @file
 * This file will
 * - In Production: Pull the keys values out of envs as used by Heroku envs.
 * - In Development: Pull the keys values defined in the .env root of the project for development.
 */

if (process.env.NODE_ENV === "ci") {
  module.exports = require("./ci");
} else {
  module.exports = {
    googleClientID: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    mongoURI: process.env.MONGODB_URI,
    cookieKey: process.env.COOKIE_KEY,
    redisUrl: process.env.REDIS_URL,
    port: process.env.PORT,
  };
}
