var logger = require("./../utils/logger");
module.exports = function (router) {
  router.get("*", function (req, res) {
    logger.info("404 Hit", req.method, req.url);
    res.status(400);
  });
};
