const joi = require("joi");
const createPostDto = joi.object().keys({
    user_id: joi.string().allow().label("User id"),
    repost_id: joi.string().allow().label("Repost id"),
    interest_id: joi.string().allow().label("Interest id"),
    sub_interest_id: joi.string().allow().label("Sub interest id"),
    title: joi.string().allow().label("Title"),
    description: joi.string().allow().label("Description"),
    post_type: joi.string().allow().label("Post type"),
    question: joi.string().allow().label("Question"),
    is_local: joi.string().allow().label("Is local"),
    options: joi.string().allow().label("Options"),
    location: joi.string().allow().label("Location"),
    link_url: joi.string().allow().label("Link url"),
    post_media: joi.string().allow().label("Post media"),
});

const editPostDto = joi.object().keys({
    user_id: joi.string().allow().label("User id"),
    post_id: joi.string().allow().label("Post id"),
    interest_id: joi.string().allow().label("Interest id"),
    sub_interest_id: joi.string().allow().label("Sub interest id"),
    title: joi.string().allow().label("Title"),
    description: joi.string().allow().label("Description"),
    post_type: joi.string().allow().label("Post type"),
    question: joi.string().allow().label("Question"),
    options: joi.string().allow().label("Options"),
    location: joi.string().allow().label("Location"),
    link_url: joi.string().allow().label("Link url"),
    delete_post_image_ids: joi.string().allow().label("Delete post image IDs"),
    post_media: joi.string().allow().label("Post media"),
});

const removepostImageDto = joi.object().keys({
    post_id: joi.string().allow().label("Post id"),
    post_media_id: joi.string().allow().label("Post media id"),
    file_name: joi.string().allow().label("File name"),
});

const getAllPostsDto = joi.object().keys({
    user_id: joi.string().allow().label("User id"),
    page: joi.string().allow().label("Page"),
    limit: joi.string().allow().label("Limit"),
});

const savePostDto = joi.object().keys({
    user_id: joi.string().allow().label("User id"),
    post_id: joi.string().allow().label("Post id"),
    is_saved: joi.string().allow().label("Is saved"),
    interest_id: joi.string().allow().label("Interest id"),
    sub_interest_id: joi.string().allow().label("Sub interest id"),
});

const deletePostDto = joi.object().keys({
    post_id: joi.string().required().label("Post id"),
});

const pollLikeDto = joi.object().keys({
    user_id: joi.string().allow().label("User id"),
    option_id: joi.string().allow().label("Option id"),
    post_id: joi.string().allow().label("Post id"),
});

const likePostDto = joi.object().keys({
    user_id: joi.string().allow().label("User id"),
    post_id: joi.string().allow().label("Post id"),
    is_liked: joi.string().allow().label("Is liked"),
    interest_id: joi.string().allow().label("Interest id"),
    sub_interest_id: joi.string().allow().label("Sub interest id"),
});

const getAllSavedPostsDto = joi.object().keys({
    user_id: joi.string().allow().label("User id"),
    page: joi.string().allow().label("Page"),
    limit: joi.string().allow().label("Limit"),
    language: joi.string().allow().label("language"),
});

const getAllLikedPostsDto = joi.object().keys({
    user_id: joi.string().allow().label("User id"),
    page: joi.string().allow().label("Page"),
    limit: joi.string().allow().label("Limit"),
    language: joi.string().allow().label("language"),
});

const createRepostDto = joi.object().keys({
    user_id: joi.string().allow().label("User id"),
    repost_id: joi.string().allow().label("Repost id"),
    title: joi.string().allow().label("Title"),
    post_type: joi.string().allow().label("Post type"),
    location: joi.string().allow().label("Location"),
    description: joi.string().allow().label("Description"),
    is_local: joi.string().allow().label("Is local"),
    interest_id: joi.string().allow().label("Interest id"),
    sub_interest_id: joi.string().allow().label("Sub interest id"),
});

const createPostreportDto = joi.object().keys({
    user_id: joi.string().allow().label("User id"),
    post_id: joi.string().allow().label("Post id"),
    reason_report: joi.string().allow().label("Reason report"),
});

const addCommentDto = joi.object().keys({
    user_id: joi.string().allow().label("User id"),
    post_id: joi.string().required().label("Post id"),
    content: joi.string().allow().label("Content"),
    parent_comment_id: joi.string().allow().label("Parent comment id"),
    reply_comment_id: joi.string().allow().label("Reply comment id"),
    mention_user_id: joi.string().allow().label("Mention user id"),
    is_sub_comment: joi.string().allow().label("Is sub comment"),
    interest_id: joi.string().allow().label("Interest id"),
    sub_interest_id: joi.string().allow().label("Sub interest id"),
});

const editCommentDto = joi.object().keys({
    user_id: joi.string().allow().label("User id"),
    comment_id: joi.string().required().label("Comment id"),
    post_id: joi.string().allow().label("Post id"),
    content: joi.string().allow().label("Content"),
    parent_comment_id: joi.string().allow().label("Parent comment id"),
    reply_comment_id: joi.string().allow().label("Reply comment id"),
    mention_user_id: joi.string().allow().label("Mention user id"),
    is_sub_comment: joi.string().allow().label("Is sub comment"),
});

const deleteCommentDto = joi.object().keys({
    user_id: joi.string().allow().label("User id"),
    comment_id: joi.string().required().label("Comment id"),
    is_sub_comment: joi.string().required().label("Is sub comment"),
});

const getAllCommentsDto = joi.object().keys({
    user_id: joi.string().allow().label("User id"),
    post_id: joi.string().allow().label("Comment id"),
    page: joi.string().allow().label("Page"),
    limit: joi.string().allow().label("Limit"),
    filter: joi.string().allow().label("Filter"),
});

const getUserCommentDetailsDto = joi.object().keys({
    user_id: joi.string().allow().label("User id"),
    page: joi.string().allow().label("Page"),
    limit: joi.string().allow().label("Limit"),
});

const getAllReplyCommentsDto = joi.object().keys({
    user_id: joi.string().allow().label("User id"),
    post_id: joi.string().allow().label("Post id"),
    parent_comment_id: joi.string().allow().label("Parent comment id"),
    page: joi.string().allow().label("Page"),
    limit: joi.string().allow().label("Limit"),
});

const likeCommentDto = joi.object().keys({
    user_id: joi.string().allow().label("User id"),
    comment_id: joi.string().required().label("Comment id"),
    is_liked: joi.string().required().label("Is liked"),
});

const postViewDto = joi.object().keys({
    user_id: joi.string().allow().label("User id"),
    post_id: joi.string().allow().label("Post id"),
    interest_id: joi.string().allow().label("Interest id"),
    sub_interest_id: joi.string().allow().label("Sub interest id"),
});

const getPostdetailsDto = joi.object().keys({
    user_id: joi.string().allow().label("User id"),
    post_id: joi.string().allow().label("Post id"),
    language: joi.string().allow().label("language"),
});

const commentReportDto = joi.object().keys({
    user_id: joi.string().allow().label("User id"),
    post_id: joi.string().allow().label("Post id"),
    comment_id: joi.string().allow().label("Comment id"),
    reason_comment_report: joi.string().allow().label("Reason comment report"),
});

const getUserPostlistDto = joi.object().keys({
    user_id: joi.string().allow().label("User id"),
    page: joi.string().allow().label("Page"),
    limit: joi.string().allow().label("Limit"),
    is_repost: joi.string().allow().label("Is repost"),
    language: joi.string().allow().label("language"),
});

const createImpressionsDto = joi.object().keys({
    user_id: joi.string().required().label("User id"),
    post_id: joi.string().required().label("Post id"),
});

module.exports = {
    createPostDto,
    editPostDto,
    removepostImageDto,
    getAllPostsDto,
    savePostDto,
    deletePostDto,
    pollLikeDto,
    likePostDto,
    getAllSavedPostsDto,
    getAllLikedPostsDto,
    createRepostDto,
    createPostreportDto,
    addCommentDto,
    editCommentDto,
    deleteCommentDto,
    getAllCommentsDto,
    getUserCommentDetailsDto,
    getAllReplyCommentsDto,
    likeCommentDto,
    postViewDto,
    getPostdetailsDto,
    commentReportDto,
    getUserPostlistDto,
    createImpressionsDto
}