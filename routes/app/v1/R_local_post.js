const router = require("express").Router();
const multipart = require("connect-multiparty");
const multipartMiddleware = multipart();
const userAuth = require("../../../middlewares/auth");
const validateRequest = require("../../../middlewares/validation");
const {
  getAllfollowingpostDto,
  getAllLocalpostDto,
} = require("../../../dto/app/v1/local_post_dto");

const {
  getAllfollowingpost,
  getAllLocalpost,
} = require("../../../api/controller/app/v1/C_local_post");

router.post(
  "/get_all_following_post",
  multipartMiddleware,
  userAuth,
  validateRequest(getAllfollowingpostDto),
  getAllfollowingpost
);

router.post(
  "/get_all_local_post",
  multipartMiddleware,
  userAuth,
  validateRequest(getAllLocalpostDto),
  getAllLocalpost
);

module.exports = router;
