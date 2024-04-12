const dotenv = require("dotenv");
dotenv.config();
module.exports = {
  nodeENV: process.env.NODE_ENV,
  port: process.env.PORT,
  googleApiKey: process.env.GOOGLE_MAP_API_KEY,
  DB: process.env.MONGO_DB_URL,
  jwtSecret: process.env.JWT_SECRET,
};
