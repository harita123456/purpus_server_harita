const joi = require("joi");
const connectionListDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
  search: joi.string().allow().label("Search"),
  follower: joi.string().allow().label("Follower"),
  following: joi.string().allow().label("Following"),
  page: joi.string().allow().label("Page"),
  limit: joi.string().allow().label("Limit"),
});

const connectionCountDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
});

const connectionSuggestionDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
  language: joi.string().allow().label("language")
});

const allInterestuserDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
  interest_id: joi.string().allow().label("interest_id"),
  excludeUser: joi.string().allow().label("excludeUser"),
  includeUser: joi.string().allow().label("includeUser"),
  page: joi.string().allow().label("Page"),
  limit: joi.string().allow().label("Limit"),
});

module.exports = {
  connectionListDto,
  connectionCountDto,
  connectionSuggestionDto,
  allInterestuserDto
};
