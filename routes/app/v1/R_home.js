const router = require("express").Router();
const multipart = require("connect-multiparty");
const multipartMiddleware = multipart();
const userAuth = require("../../../middlewares/auth");
const validateRequest = require("../../../middlewares/validation");
const { getAllPostsDto, getAllPostsBySubInterestDtoo } = require("../../../dto/app/v1/home_dto");

const {
  getAllPosts,
  getHomeInterests,
  getAllPostsBySubInterest,
} = require("../../../api/controller/app/v1/C_home");

router.post(
  "/get_all_posts",
  multipartMiddleware,
  userAuth,
  validateRequest(getAllPostsDto),
  getAllPosts
);

router.post("/get_home_interests", multipartMiddleware, getHomeInterests);

router.post(
  "/get_all_posts_by_sub_interest",
  multipartMiddleware,
  userAuth,
  getAllPostsBySubInterest
);

module.exports = router;
