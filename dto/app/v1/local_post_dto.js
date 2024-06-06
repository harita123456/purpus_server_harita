const joi = require("joi");
const getAllfollowingpostDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
  page: joi.string().allow().label("Page"),
  limit: joi.string().allow().label("Limit"),
  language: joi.string().allow().label("language")
});

const getAllLocalpostDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
  page: joi.string().allow().label("Page"),
  limit: joi.string().allow().label("Limit"),
  lat: joi.string().allow().label("Latitude"),
  long: joi.string().allow().label("Longitude"),
  miles_distance: joi.string().allow().label("Miles distance"),
  trending: joi.string().allow().label("Trending"),
  newest: joi.string().allow().label("Newest"),
  top: joi.string().allow().label("Top"),
  language: joi.string().allow().label("language")
});

module.exports = {
  getAllfollowingpostDto,
  getAllLocalpostDto,
};
