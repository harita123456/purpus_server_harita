const joi = require("joi");
const getAllPostsDto = joi.object().keys({
    user_id: joi.string().allow().label("User id"),
    selected_id: joi.string().allow().label("Selected id"),
    page: joi.string().allow().label("Page"),
    limit: joi.string().allow().label("Limit"),
    language: joi.string().allow().label("language")
});

const getAllPostsBySubInterestDto = joi.object().keys({
    user_id: joi.string().allow().label("User id"),
    selected_id: joi.string().allow().label("Selected id"),
    page: joi.string().allow().label("Page"),
    limit: joi.string().allow().label("Limit"),
    language: joi.string().allow().label("language")
});

module.exports = {
    getAllPostsDto,
    getAllPostsBySubInterestDto
}