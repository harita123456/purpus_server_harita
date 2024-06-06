const router = require("express").Router();
const multipart = require("connect-multiparty");
const multipartMiddleware = multipart();
const userAuth = require("../../../middlewares/auth");
const validateRequest = require("../../../middlewares/validation");
const {
  followUserDto,
  unFollowUserDto,
  acceptfollowrequestDto,
  followerListDto,
  followingListDto,
} = require("../../../dto/app/v1/follower_following_dto");

const {
  followUser,
  unFollowUser,
  removeFollowUser,
  acceptfollowrequest,
  followerList,
  followingList,
} = require("../../../api/controller/app/v1/C_follower_following");

router.post(
  "/follow_user",
  multipartMiddleware,
  userAuth,
  validateRequest(followUserDto),
  followUser
);

router.post(
  "/unfollow_user",
  multipartMiddleware,
  userAuth,
  validateRequest(unFollowUserDto),
  unFollowUser
);

router.post(
  "/remove_followuser",
  multipartMiddleware,
  userAuth,
  removeFollowUser
);

router.post(
  "/accept_decline_request",
  multipartMiddleware,
  userAuth,
  validateRequest(acceptfollowrequestDto),
  acceptfollowrequest
);

router.post(
  "/follower_list",
  multipartMiddleware,
  userAuth,
  validateRequest(followerListDto),
  followerList
);

router.post(
  "/following_list",
  multipartMiddleware,
  userAuth,
  validateRequest(followingListDto),
  followingList
);

module.exports = router;
