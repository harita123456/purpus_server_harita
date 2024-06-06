const router = require("express").Router();
const multipart = require("connect-multiparty");
const multipartMiddleware = multipart();
const userAuth = require("../../../middlewares/auth");
const validateRequest = require("../../../middlewares/validation");

const {
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
} = require("../../../dto/app/v1/post_dto");

const {
  createPost,
  getAllPosts,
  editPost,
  savePost,
  likePost,
  getAllSavedPosts,
  getAllLikedPosts,
  removepostImage,
  deletePost,
  pollLike,
  createRepost,
  createPostreport,
  addComment,
  editComment,
  deleteComment,
  getAllComments,
  getUserCommentDetails,
  getAllReplyComments,
  likeComment,
  postView,
  getPostdetails,
  commentReport,
  getUserPostlist,
  undoRepost,
  create_impressions
} = require("../../../api/controller/app/v1/C_post");

router.post(
  "/create_post",
  multipartMiddleware,
  userAuth,
  validateRequest(createPostDto),
  createPost
);

router.post(
  "/get_all_posts",
  multipartMiddleware,
  userAuth,
  validateRequest(getAllPostsDto),
  getAllPosts
);

router.post(
  "/save_post",
  multipartMiddleware,
  userAuth,
  validateRequest(savePostDto),
  savePost
);

router.post(
  "/like_post",
  multipartMiddleware,
  userAuth,
  validateRequest(likePostDto),
  likePost
);

router.post(
  "/get_all_save_post",
  multipartMiddleware,
  userAuth,
  validateRequest(getAllSavedPostsDto),
  getAllSavedPosts
);

router.post(
  "/get_all_like_post",
  multipartMiddleware,
  userAuth,
  validateRequest(getAllLikedPostsDto),
  getAllLikedPosts
);

router.post(
  "/edit_post",
  multipartMiddleware,
  userAuth,
  validateRequest(editPostDto),
  editPost
);

router.post(
  "/removepost_Image",
  multipartMiddleware,
  validateRequest(removepostImageDto),
  removepostImage
);

router.post(
  "/delete_post",
  multipartMiddleware,
  validateRequest(deletePostDto),
  deletePost
);

router.post(
  "/poll_vote",
  multipartMiddleware,
  userAuth,
  validateRequest(pollLikeDto),
  pollLike
);

router.post(
  "/create_repost",
  multipartMiddleware,
  userAuth,
  validateRequest(createRepostDto),
  createRepost
);

router.post(
  "/create_post_report",
  multipartMiddleware,
  validateRequest(createPostreportDto),
  createPostreport
);

router.post(
  "/add_comment",
  multipartMiddleware,
  userAuth,
  validateRequest(addCommentDto),
  addComment
);

router.post(
  "/edit_comment",
  multipartMiddleware,
  userAuth,
  validateRequest(editCommentDto),
  editComment
);

router.post(
  "/delete_comment",
  multipartMiddleware,
  userAuth,
  validateRequest(deleteCommentDto),
  deleteComment
);

router.post(
  "/all_comments",
  multipartMiddleware,
  userAuth,
  validateRequest(getAllCommentsDto),
  getAllComments
);

router.post(
  "/get_user_comment",
  multipartMiddleware,
  userAuth,
  validateRequest(getUserCommentDetailsDto),
  getUserCommentDetails
);

router.post(
  "/all_reply_comments",
  multipartMiddleware,
  userAuth,
  validateRequest(getAllReplyCommentsDto),
  getAllReplyComments
);

router.post(
  "/like_comment",
  multipartMiddleware,
  userAuth,
  validateRequest(likeCommentDto),
  likeComment
);

router.post(
  "/view_post",
  multipartMiddleware,
  userAuth,
  validateRequest(postViewDto),
  postView
);

router.post(
  "/get_post_details",
  multipartMiddleware,
  userAuth,
  validateRequest(getPostdetailsDto),
  getPostdetails
);

router.post(
  "/get_user_post_list",
  multipartMiddleware,
  userAuth,
  validateRequest(getUserPostlistDto),
  getUserPostlist
);

router.post(
  "/create_comment_report",
  multipartMiddleware,
  userAuth,
  validateRequest(commentReportDto),
  commentReport
);

router.post(
  "/undo_repost",
  multipartMiddleware,
  userAuth,
  undoRepost
);

router.post(
  "/create_user_impressions",
  multipartMiddleware,
  userAuth,
  validateRequest(createImpressionsDto),
  create_impressions
);

module.exports = router;
