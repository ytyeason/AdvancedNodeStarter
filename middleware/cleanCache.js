const { clearHash } = require("@services/cache");

module.exports = async (req, res, next) => {
  // make sure we call the next function, in this case,
  // it's the route handler, after route handler is complete,
  // it's going to come back to this function
  await next();

  clearHash(req.user.id);
};
