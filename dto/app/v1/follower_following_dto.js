const joi = require("joi");
const followUserDto = joi.object().keys({
  following_id: joi.string().required().label("Following id"),
});

const unFollowUserDto = joi.object().keys({
  following_user_id: joi.string().required().label("Following user id"),
});

const acceptfollowrequestDto = joi.object().keys({
  noti_id: joi.string().required().label("Notification id"),
  follow_status: joi.string().allow().label("Follow status"),
});

const followerListDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
  search: joi.string().allow().label("Search"),
  page: joi.string().allow().label("Page"),
  limit: joi.string().allow().label("Limit"),
});

const followingListDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
  search: joi.string().allow().label("Search"),
  page: joi.string().allow().label("Page"),
  limit: joi.string().allow().label("Limit"),
});

module.exports = {
  followUserDto,
  unFollowUserDto,
  acceptfollowrequestDto,
  followerListDto,
  followingListDto,
};
