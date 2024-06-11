const {
  successRes,
  errorRes,
  multiSuccessRes,
} = require("../../../../utils/common_fun");
const mongoose = require("mongoose");
const post = require("../../../../models/M_post");
const users = require("../../../../models/M_user");
const interest = require("../../../../models/M_interest");
const pollvotes = require("../../../../models/M_poll_votes");
const save_post = require("../../../../models/M_save_post");
const block_user = require("../../../../models/M_block_user");
const like_post = require("../../../../models/M_like_post");
const follower_following = require("../../../../models/M_follower_following");
const user_interactions = require("../../../../models/M_user_interactions");
const user_impressions = require("../../../../models/M_user_impression");
const view_post = require("../../../../models/M_post_view");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffprobePath = require("@ffprobe-installer/ffprobe").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

// const getAllPosts = async (req, res) => {
//   try {
//     if (!req.body.user_id) {
//       var user_id = req.user._id;
//     } else {
//       var user_id = req.body.user_id;
//     }
//     var { page = 1, limit = 10, selected_id } = req.body;

//     const userWithPrivateAccount = await users.find({
//       is_private_account: true,
//       is_deleted: false,
//     });
//     const userBlockedByOthers = await block_user.find({
//       user_id: user_id,
//       is_deleted: false,
//     });
//     const usersBlockingCurrentUser = await block_user.find({
//       block_user_id: user_id,
//       is_deleted: false,
//     });

//     const userBlockedByOthersIds = userBlockedByOthers.map(
//       (block) => block.block_user_id
//     );
//     const usersBlockingCurrentUserIds = usersBlockingCurrentUser.map(
//       (block) => block.user_id
//     );

//     const user = await users.findOne({
//       _id: user_id,
//       is_deleted: false,
//     });
//     if (!user) {
//       return errorRes(res, "This user does not exist");
//     }

//     const queryObject = {};

//     queryObject.sub_interest_id = user.interested;

//     const user_following_data = await follower_following.find().where({
//       user_id: user_id,
//       is_deleted: false,
//       is_request: true,
//     });

//     const userOwnSubInterests = queryObject.sub_interest_id;

//     const following_user_Ids = user_following_data.map((data) => data.following_id);

//     const userWithPrivateAccountIds = userWithPrivateAccount.map((private) => private._id);

//     const blockedUserIds = [
//       ...userBlockedByOthersIds,
//       ...usersBlockingCurrentUserIds,
//     ];

//     const subinterestCountResult = await user_interactions.aggregate([
//       {
//         $match: {
//           user_id: new mongoose.Types.ObjectId(user_id),
//           sub_interest_id: { $ne: null },
//           // $or: [
//           //   { createdAt: { $gte: new Date("2024-01-30T00:00:00.000Z") } },
//           //   { updatedAt: { $gte: new Date("2024-01-30T00:00:00.000Z") } }
//           // ]
//         },
//       },
//       {
//         $group: {
//           _id: { $ifNull: ["$sub_interest_id", "null"] }, // Handle null values
//           count: { $sum: 1 },
//         },
//       },
//       {
//         $project: {
//           sub_interest_id: "$_id",
//           count: 1,
//           _id: 0,
//         },
//       },
//     ]);

//     const interestCountResult = await user_interactions.aggregate([
//       {
//         $match: {
//           user_id: new mongoose.Types.ObjectId(user_id),
//           interest_id: { $ne: null },
//           sub_interest_id: null,
//         },
//       },
//       {
//         $group: {
//           _id: {
//             interest_id: "$interest_id",
//             sub_interest_id: { $ifNull: ["$sub_interest_id", "null"] },
//           },
//           count: { $sum: 1 },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           interest_id: "$_id.interest_id",
//           sub_interest_id: "$_id.sub_interest_id",
//           count: 1,
//         },
//       },
//     ]);

//     const usersOwnPostsNotInView = await post.find({
//       user_id: user_id,
//       is_deleted: false,
//       is_repost: false,
//       is_local: false,
//       _id: {
//         $nin: await view_post.distinct('post_id', { user_id: user_id })
//       }
//     })
//       .limit(limit * 1)
//       .skip((page - 1) * limit)
//       .populate({
//         path: "user_id",
//         select:
//           "unique_name full_name post_type profile_url profile_picture full_name is_private_account is_verified",
//       })
//       .populate("interest_id sub_interest_id")
//       .populate({
//         path: "repost_id",
//         populate: {
//           path: "user_id",
//           select:
//             "unique_name full_name post_type profile_url profile_picture full_name is_private_account is_verified",
//         },
//       })
//       .sort({ createdAt: "desc" });

//     const newUserTrendingData = await post
//       .find({
//         sub_interest_id: { $in: userOwnSubInterests },
//         is_deleted: false,
//         is_local: false,
//         is_repost: false,
//         user_id: { $nin: blockedUserIds },
//         user_id: { $nin: userWithPrivateAccountIds },
//         impression_count: { $gte: 300 },
//       })
//       .populate({
//         path: "user_id",
//         select:
//           "unique_name full_name post_type profile_url profile_picture full_name is_private_account is_verified",
//       })
//       .populate("interest_id sub_interest_id")
//       .populate({
//         path: "repost_id",
//         populate: {
//           path: "user_id",
//           select:
//             "unique_name full_name post_type profile_url profile_picture full_name is_private_account is_verified",
//         },
//       })
//       .sort({ impression_count: -1 });

//     const sortedSubinterestCountResult = subinterestCountResult.sort((a, b) => b.count - a.count);
//     const sortedinterestCountResult = interestCountResult.sort((a, b) => b.count - a.count);

//     const totalCount = subinterestCountResult.reduce((acc, item) => acc + item.count, 0);
//     const percentageData = subinterestCountResult.map(item => ({
//       sub_interest_id: item.sub_interest_id,
//       count: item.count,
//       percentage: (item.count / totalCount) * 100,
//     }));

//     const subInterestIds = sortedSubinterestCountResult.map(result => result.sub_interest_id);

//     async function processUserPosts(userPosts, user_id) {
//       const processedPosts = await Promise.all(
//         userPosts.map(async (data) => {
//           const isLiked = await like_post.findOne({
//             user_id: user_id,
//             post_id: data._id,
//           });
//           const isSaved = await save_post.findOne({
//             user_id: user_id,
//             post_id: data._id,
//           });
//           const isPolled = await pollvotes.findOne({
//             user_id: user_id,
//             post_id: data._id,
//           });
//           var store_option_id = isPolled?.option_id;

//           const is_repost_you_status = await post.findOne({
//             user_id: user_id,
//             repost_id: data._id,
//             is_deleted: false,
//             is_repost: true,
//           });

//           const updatedPost = {
//             ...data.toObject(),
//             is_like: !!isLiked,
//             is_save: !!isSaved,
//             is_poll_response: !!isPolled,
//             store_option_id: store_option_id,
//             is_repost_you: !!is_repost_you_status,
//           };

//           if (post.is_repost && post.repost_id) {
//             const repostIsLiked = await like_post.findOne({
//               user_id: user_id,
//               post_id: data.repost_id._id,
//             });
//             const repostIsSaved = await save_post.findOne({
//               user_id: user_id,
//               post_id: data.repost_id._id,
//             });
//             const repostIsPolled = await pollvotes.findOne({
//               user_id: user_id,
//               post_id: data.repost_id._id,
//             });

//             var store_option_id = repostIsPolled?.option_id;
//             updatedPost.repost_id = {
//               ...data.repost_id.toObject(),
//               is_like: !!repostIsLiked,
//               is_save: !!repostIsSaved,
//               is_poll_response: !!repostIsPolled,
//               store_option_id: store_option_id,
//             };
//           }

//           return updatedPost;
//         })
//       );

//       processedPosts.forEach(async (post) => {
//         if (post?.user_id?.profile_picture) {
//           post.user_id.profile_picture =
//             process.env.BASE_URL + post.user_id.profile_picture;
//         }

//         if (post?.repost_id?.user_id?.profile_picture) {
//           post.repost_id.user_id.profile_picture =
//             process.env.BASE_URL + post.repost_id.user_id.profile_picture;
//         }

//         post?.post_media?.forEach((media) => {
//           if (media.file_type === "image" || media.file_type === "video") {
//             media.file_name = process.env.BASE_URL + media.file_name;
//             if (media.thumb_name) {
//               media.thumb_name = process.env.BASE_URL + media.thumb_name;
//             }
//           }
//         });

//         post?.repost_id?.post_media?.forEach((media) => {
//           if (media.file_type === "image" || media.file_type === "video") {
//             media.file_name = process.env.BASE_URL + media.file_name;
//             if (media.thumb_name) {
//               media.thumb_name = process.env.BASE_URL + media.thumb_name;
//             }
//           }
//         });
//       });

//       return processedPosts;
//     }

//     async function processUserPostsAggree(userPosts, user_id) {
//       const processedPosts = await Promise.all(
//         userPosts.map(async (data) => {
//           const isLiked = await like_post.findOne({
//             user_id: user_id,
//             post_id: data._id,
//           });
//           const isSaved = await save_post.findOne({
//             user_id: user_id,
//             post_id: data._id,
//           });
//           const isPolled = await pollvotes.findOne({
//             user_id: user_id,
//             post_id: data._id,
//           });
//           var store_option_id = isPolled?.option_id;

//           const is_repost_you_status = await post.findOne({
//             user_id: user_id,
//             repost_id: data._id,
//             is_deleted: false,
//             is_repost: true
//           })

//           const is_view_impression = await user_impressions.findOne({
//             user_id: user_id,
//             post_id: data._id,
//           });

//           const is_view_Post = await view_post.findOne({
//             user_id: user_id,
//             post_id: data._id,
//           });

//           const updatedPost = {
//             ...data,
//             is_like: !!isLiked,
//             is_save: !!isSaved,
//             is_poll_response: !!isPolled,
//             store_option_id: store_option_id,
//             is_repost_you: !!is_repost_you_status,
//             is_view_impression: !!is_view_impression,
//             is_view_Post: !!is_view_Post,
//           };
//           return updatedPost;
//         })
//       );

//       processedPosts.forEach(async (post) => {
//         if (post?.user_id?.profile_picture) {
//           post.user_id.profile_picture =
//             process.env.BASE_URL + post.user_id.profile_picture;
//         }

//         if (post?.repost_id?.user_id?.profile_picture) {
//           post.repost_id.user_id.profile_picture =
//             process.env.BASE_URL + post.repost_id.user_id.profile_picture;
//         }

//         post?.post_media?.forEach((media) => {
//           if (media.file_type === "image" || media.file_type === "video") {
//             media.file_name = process.env.BASE_URL + media.file_name;
//             if (media.thumb_name) {
//               media.thumb_name = process.env.BASE_URL + media.thumb_name;
//             }
//           }
//         });

//         post?.repost_id?.post_media?.forEach((media) => {
//           if (media.file_type === "image" || media.file_type === "video") {
//             media.file_name = process.env.BASE_URL + media.file_name;
//             if (media.thumb_name) {
//               media.thumb_name = process.env.BASE_URL + media.thumb_name;
//             }
//           }
//         });
//       });

//       return processedPosts;
//     }

//     const postWithPrivateAccountFalse = await post
//       .find({
//         $and: [
//           { sub_interest_id: { $in: subInterestIds } },
//           {
//             $or: [
//               { user_id: { $nin: blockedUserIds } },
//               { user_id: { $in: following_user_Ids } },
//             ],
//           },
//           { user_id: { $nin: userWithPrivateAccountIds, $ne: user_id } },
//           { is_deleted: false },
//           { is_local: false },
//           { is_repost: false },
//           { impression_count: { $lte: 300 } }
//         ],
//       })
//       .populate({
//         path: "user_id",
//         select:
//           "unique_name full_name post_type profile_url profile_picture full_name is_private_account is_verified",
//       })
//       .populate("interest_id sub_interest_id")
//       .populate({
//         path: "repost_id",
//         populate: {
//           path: "user_id",
//           select:
//             "unique_name full_name post_type profile_url profile_picture full_name is_private_account is_verified",
//         },
//       })
//       .sort({ createdAt: "desc" });

//     const postWithPrivateAccountTrue = await post
//       .find({
//         $and: [
//           { sub_interest_id: { $in: subInterestIds } },
//           {
//             user_id: { $in: following_user_Ids, $nin: blockedUserIds, $ne: user_id },
//           },
//           {
//             is_deleted: false,
//             is_local: false,
//             is_repost: false,
//             is_block: false,
//             impression_count: { $lte: 300 }
//           },
//         ]
//       })
//       .populate({
//         path: "user_id",
//         select:
//           "unique_name full_name post_type profile_url profile_picture full_name is_private_account is_verified",
//       })
//       .populate("interest_id sub_interest_id")
//       .populate({
//         path: "repost_id",
//         populate: {
//           path: "user_id",
//           select:
//             "unique_name full_name post_type profile_url profile_picture full_name is_private_account is_verified",
//         },
//       })
//       .sort({ createdAt: "desc" });

//     const filteredPosts = postWithPrivateAccountTrue.filter(
//       (post) =>
//         post.user_id.is_private_account === false &&
//         (!post.repost_id ||
//           !post.repost_id.user_id ||
//           post.repost_id.user_id.is_private_account === false)
//     );
//     var userPosts = filteredPosts.concat(postWithPrivateAccountFalse);

//     var userPosts = [
//       ...filteredPosts,
//       ...postWithPrivateAccountFalse.filter(
//         (post) =>
//           !filteredPosts.some((filteredPost) =>
//             filteredPost._id.equals(post._id)
//           )
//       ),
//     ];

//     const total_data_for_newestPostAlgorithm_300 = userPosts.length;

//     var withoutPaginatedPosts1 = userPosts.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
//     const startIndex = (page - 1) * parseInt(limit);
//     const endIndex = parseInt(startIndex) + parseInt(limit);
//     var paginatedPosts1 = withoutPaginatedPosts1.slice(startIndex, endIndex)

//     const newestPostAlgorithm_300 = paginatedPosts1

//     const combinedPosts = [...usersOwnPostsNotInView, ...newestPostAlgorithm_300];

//     const resultPosts = [];

//     if (usersOwnPostsNotInView.length === 0) {
//       for (let i = 0; i < 10 && i < newestPostAlgorithm_300.length; i++) {
//         resultPosts.push(newestPostAlgorithm_300[i]);
//       }
//     } else {
//       for (let i = 0; i < 5 && i < usersOwnPostsNotInView.length; i++) {
//         resultPosts.push(usersOwnPostsNotInView[i]);
//       }

//       for (let i = 0; i < 5 && resultPosts.length < 10 && i < newestPostAlgorithm_300.length; i++) {
//         resultPosts.push(newestPostAlgorithm_300[i]);
//       }
//     }

//     const total_data_userPostTrending_300_to_1000 = await post.countDocuments({
//       sub_interest_id: { $in: subInterestIds },
//       user_id: { $nin: blockedUserIds },
//       user_id: { $nin: userWithPrivateAccountIds },
//       is_deleted: false,
//       is_block: false,
//       is_local: false,
//       is_repost: false,
//       impression_count: { $gte: 300, $lte: 1000 }
//     });

//     const old_page_for_newestPostAlgorithm_300 = total_data_for_newestPostAlgorithm_300 / limit;
//     const abc = Math.ceil(old_page_for_newestPostAlgorithm_300);

//     const old_page_for_userPostTrending_300_to_1000 = total_data_userPostTrending_300_to_1000 / limit;
//     const abc1 = Math.ceil(old_page_for_userPostTrending_300_to_1000);

//     const xyz = abc + abc1;

//     var userPostTrending_300_to_1000 = [];
//     var userPostTrending_more_than_1000 = [];

//     if (resultPosts.length == 0) {
//       var original_page1 = page - abc;
//       var userPostTrending_300_to_1000 = await post.aggregate([
//         {
//           $match: {
//             sub_interest_id: { $in: subInterestIds },
//             user_id: { $nin: blockedUserIds },
//             user_id: { $nin: userWithPrivateAccountIds },
//             is_deleted: false,
//             is_block: false,
//             is_local: false,
//             is_repost: false,
//             impression_count: { $gte: 300, $lte: 1000 }
//           }
//         },
//         {
//           $lookup: {
//             from: "user_impressions",
//             localField: "sub_interest_id",
//             foreignField: "sub_interest_id",
//             as: "impressionsData"
//           }
//         },
//         {
//           $unwind: {
//             path: "$impressionsData",
//             preserveNullAndEmptyArrays: true
//           }
//         },
//         {
//           $group: {
//             _id: "$_id",
//             post: { $first: "$$ROOT" },
//             count: { $sum: 1 }
//           }
//         },
//         {
//           $addFields: {
//             percentage: {
//               $let: {
//                 vars: {
//                   percentageInfo: {
//                     $arrayElemAt: [
//                       {
//                         $filter: {
//                           input: percentageData,
//                           cond: { $eq: ["$$this.sub_interest_id", "$post.sub_interest_id"] }
//                         }
//                       },
//                       0
//                     ]
//                   }
//                 },
//                 in: { $ifNull: ["$$percentageInfo.percentage", 0] }
//               }
//             }
//           }
//         },
//         {
//           $replaceRoot: { newRoot: "$post" }
//         },
//         {
//           $lookup: {
//             from: "users",
//             localField: "user_id",
//             foreignField: "_id",
//             as: "user"
//           }
//         },
//         {
//           $lookup: {
//             from: "interests",
//             localField: "interest_id",
//             foreignField: "_id",
//             as: "interest"
//           }
//         },
//         {
//           $lookup: {
//             from: "sub_interests",
//             localField: "sub_interest_id",
//             foreignField: "_id",
//             as: "subInterest"
//           }
//         },
//         {
//           $addFields: {
//             user_id: { $arrayElemAt: ["$user", 0] },
//             interest_id: { $arrayElemAt: ["$interest", 0] },
//             sub_interest_id: { $arrayElemAt: ["$subInterest", 0] }
//           }
//         },
//         {
//           $project: {
//             _id: 1,
//             user_id: {
//               _id: 1,
//               full_name: 1,
//               profile_picture: 1,
//               unique_name: 1,
//               profile_url: 1,
//               is_verified: 1,
//               is_private_account: 1
//             },
//             interest_id: 1,
//             sub_interest_id: 1,
//             title: 1,
//             description: 1,
//             post_type: 1,
//             link_url: 1,
//             question: 1,
//             store_option_id: 1,
//             options: 1,
//             location: 1,
//             is_repost: 1,
//             vote_counter: 1,
//             repost_count: 1,
//             view_count: 1,
//             comment_count: 1,
//             like_count: 1,
//             is_local: 1,
//             is_block: 1,
//             is_deleted: 1,
//             post_media: 1,
//             createdAt: 1,
//             updatedAt: 1,
//             interaction_count: 1,
//             impression_count: 1
//           }
//         },
//         {
//           $sort: { percentage: -1, view_count: -1, createdAt: -1 }
//         },
//         {
//           $skip: (original_page1 - 1) * parseInt(limit),
//         },
//         {
//           $limit: parseInt(limit),
//         },
//       ]);
//     }

//     if (resultPosts.length == 0 && userPostTrending_300_to_1000.length == 0) {
//       var original_page2 = page - xyz;
//       var userPostTrending_more_than_1000 = await post.aggregate([
//         {
//           $match: {
//             sub_interest_id: { $in: subInterestIds },
//             user_id: { $nin: blockedUserIds },
//             user_id: { $nin: userWithPrivateAccountIds },
//             is_deleted: false,
//             is_block: false,
//             is_local: false,
//             is_repost: false,
//             impression_count: { $gte: 1000 }
//           }
//         },
//         {
//           $lookup: {
//             from: "user_impressions",
//             localField: "sub_interest_id",
//             foreignField: "sub_interest_id",
//             as: "impressionsData"
//           }
//         },
//         {
//           $unwind: {
//             path: "$impressionsData",
//             preserveNullAndEmptyArrays: true
//           }
//         },
//         {
//           $group: {
//             _id: "$_id",
//             post: { $first: "$$ROOT" },
//             count: { $sum: 1 }
//           }
//         },
//         {
//           $addFields: {
//             percentage: {
//               $let: {
//                 vars: {
//                   percentageInfo: {
//                     $arrayElemAt: [
//                       {
//                         $filter: {
//                           input: percentageData,
//                           cond: { $eq: ["$$this.sub_interest_id", "$post.sub_interest_id"] }
//                         }
//                       },
//                       0
//                     ]
//                   }
//                 },
//                 in: { $ifNull: ["$$percentageInfo.percentage", 0] }
//               }
//             }
//           }
//         },
//         {
//           $replaceRoot: { newRoot: "$post" }
//         },
//         {
//           $lookup: {
//             from: "users",
//             localField: "user_id",
//             foreignField: "_id",
//             as: "user"
//           }
//         },
//         {
//           $lookup: {
//             from: "interests",
//             localField: "interest_id",
//             foreignField: "_id",
//             as: "interest"
//           }
//         },
//         {
//           $lookup: {
//             from: "sub_interests",
//             localField: "sub_interest_id",
//             foreignField: "_id",
//             as: "subInterest"
//           }
//         },
//         {
//           $addFields: {
//             user_id: { $arrayElemAt: ["$user", 0] },
//             interest_id: { $arrayElemAt: ["$interest", 0] },
//             sub_interest_id: { $arrayElemAt: ["$subInterest", 0] }
//           }
//         },
//         {
//           $project: {
//             _id: 1,
//             user_id: {
//               _id: 1,
//               full_name: 1,
//               profile_picture: 1,
//               unique_name: 1,
//               profile_url: 1,
//               is_verified: 1,
//               is_private_account: 1
//             },
//             interest_id: 1,
//             sub_interest_id: 1,
//             title: 1,
//             description: 1,
//             post_type: 1,
//             link_url: 1,
//             question: 1,
//             store_option_id: 1,
//             options: 1,
//             location: 1,
//             is_repost: 1,
//             vote_counter: 1,
//             repost_count: 1,
//             view_count: 1,
//             comment_count: 1,
//             like_count: 1,
//             is_local: 1,
//             is_block: 1,
//             is_deleted: 1,
//             post_media: 1,
//             createdAt: 1,
//             updatedAt: 1,
//             interaction_count: 1,
//             impression_count: 1
//           }
//         },
//         {
//           $sort: { percentage: -1, view_count: -1, createdAt: -1 }
//         },
//         {
//           $skip: (original_page2 - 1) * parseInt(limit),
//         },
//         {
//           $limit: parseInt(limit),
//         },
//       ]);
//     }

//     if (!selected_id) {
//       if (resultPosts.length > 0) {
//         const post_for_display = await processUserPosts(resultPosts, user_id);

//         return multiSuccessRes(
//           res,
//           "Posts retrieved successfully",
//           post_for_display,
//           post_for_display.length
//         );
//       }

//       if (userPostTrending_300_to_1000.length > 0) {
//         const post_for_display = await processUserPostsAggree(userPostTrending_300_to_1000, user_id);

//         return multiSuccessRes(
//           res,
//           "Posts retrieved successfully",
//           post_for_display,
//           post_for_display.length
//         );
//       }

//       if (userPostTrending_more_than_1000.length > 0) {
//         const post_for_display = await processUserPostsAggree(userPostTrending_more_than_1000, user_id);

//         return multiSuccessRes(
//           res,
//           "Posts retrieved successfully",
//           post_for_display,
//           post_for_display.length
//         );
//       }
//       else {
//         return multiSuccessRes(
//           res,
//           "Posts retrieved successfully",
//           [],
//           0
//         );
//       }
//     }

//     if (selected_id) {
//       const userWithPrivateAccount = await users.find({
//         is_private_account: true,
//         is_deleted: false,
//       });
//       const userBlockedByOthers = await block_user.find({
//         user_id: user_id,
//         is_deleted: false,
//       });
//       const usersBlockingCurrentUser = await block_user.find({
//         block_user_id: user_id,
//         is_deleted: false,
//       });

//       const userBlockedByOthersIds = userBlockedByOthers.map(
//         (block) => block.block_user_id
//       );
//       const usersBlockingCurrentUserIds = usersBlockingCurrentUser.map(
//         (block) => block.user_id
//       );

//       const user = await users.findOne({
//         _id: user_id,
//         is_deleted: false,
//       });
//       if (!user) {
//         return errorRes(res, "This user does not exist");
//       }

//       const queryObject = {};

//       queryObject.interest_id = selected_id;

//       const user_following_data = await follower_following.find().where({
//         user_id: user_id,
//         is_deleted: false,
//         is_request: true,
//       });

//       const userOwnSubInterests = queryObject.interest_id;

//       const following_user_Ids = user_following_data.map((data) => data.following_id);

//       const userWithPrivateAccountIds = userWithPrivateAccount.map((private) => private._id);

//       const blockedUserIds = [
//         ...userBlockedByOthersIds,
//         ...usersBlockingCurrentUserIds,
//       ];

//       console.log("selected_id",selected_id)

//       const subinterestCountResult = await user_interactions.aggregate([
//         {
//           $match: {
//             user_id: new mongoose.Types.ObjectId(user_id),
//             interest_id: new mongoose.Types.ObjectId(selected_id),
//             sub_interest_id: { $ne: null },
//           },
//         },
//         {
//           $group: {
//             _id: { $ifNull: ["$sub_interest_id", "null"] },
//             count: { $sum: 1 },
//           },
//         },
//         {
//           $project: {
//             sub_interest_id: "$_id",
//             count: 1,
//             _id: 0,
//           },
//         },
//       ]);

//       const interestCountResult = await user_interactions.aggregate([
//         {
//           $match: {
//             user_id: new mongoose.Types.ObjectId(user_id),
//             interest_id: { $ne: null },
//             sub_interest_id: null,
//           },
//         },
//         {
//           $group: {
//             _id: {
//               interest_id: "$interest_id",
//               sub_interest_id: { $ifNull: ["$sub_interest_id", "null"] },
//             },
//             count: { $sum: 1 },
//           },
//         },
//         {
//           $project: {
//             _id: 0,
//             interest_id: "$_id.interest_id",
//             sub_interest_id: "$_id.sub_interest_id",
//             count: 1,
//           },
//         },
//       ]);

//       const usersOwnPostsNotInView = await post.find({
//         user_id: user_id,
//         interest_id: selected_id,
//         is_deleted: false,
//         is_repost: false,
//         is_local: false,
//         _id: {
//           $nin: await view_post.distinct('post_id', { user_id: user_id })
//         }
//       })
//         .limit(limit * 1)
//         .skip((page - 1) * limit)
//         .populate({
//           path: "user_id",
//           select:
//             "unique_name full_name post_type profile_url profile_picture full_name is_private_account is_verified",
//         })
//         .populate("interest_id sub_interest_id")
//         .populate({
//           path: "repost_id",
//           populate: {
//             path: "user_id",
//             select:
//               "unique_name full_name post_type profile_url profile_picture full_name is_private_account is_verified",
//           },
//         })
//         .sort({ createdAt: "desc" });

//       const newUserTrendingData = await post
//         .find({
//           sub_interest_id: { $in: userOwnSubInterests },
//           is_deleted: false,
//           is_local: false,
//           is_repost: false,
//           user_id: { $nin: blockedUserIds },
//           user_id: { $nin: userWithPrivateAccountIds },
//           impression_count: { $gte: 300 },
//         })
//         .populate({
//           path: "user_id",
//           select:
//             "unique_name full_name post_type profile_url profile_picture full_name is_private_account is_verified",
//         })
//         .populate("interest_id sub_interest_id")
//         .populate({
//           path: "repost_id",
//           populate: {
//             path: "user_id",
//             select:
//               "unique_name full_name post_type profile_url profile_picture full_name is_private_account is_verified",
//           },
//         })
//         .sort({ impression_count: -1 });

//       const sortedSubinterestCountResult = subinterestCountResult.sort((a, b) => b.count - a.count);
//       const sortedinterestCountResult = interestCountResult.sort((a, b) => b.count - a.count);

//       const totalCount = subinterestCountResult.reduce((acc, item) => acc + item.count, 0);
//       const percentageData = subinterestCountResult.map(item => ({
//         sub_interest_id: item.sub_interest_id,
//         count: item.count,
//         percentage: (item.count / totalCount) * 100,
//       }));

//       const subInterestIds = sortedSubinterestCountResult.map(result => result.sub_interest_id);

//       async function processUserPosts(userPosts, user_id) {
//         const processedPosts = await Promise.all(
//           userPosts.map(async (data) => {
//             const isLiked = await like_post.findOne({
//               user_id: user_id,
//               post_id: data._id,
//             });
//             const isSaved = await save_post.findOne({
//               user_id: user_id,
//               post_id: data._id,
//             });
//             const isPolled = await pollvotes.findOne({
//               user_id: user_id,
//               post_id: data._id,
//             });
//             var store_option_id = isPolled?.option_id;

//             const is_repost_you_status = await post.findOne({
//               user_id: user_id,
//               repost_id: data._id,
//               is_deleted: false,
//               is_repost: true,
//             });

//             const updatedPost = {
//               ...data.toObject(),
//               is_like: !!isLiked,
//               is_save: !!isSaved,
//               is_poll_response: !!isPolled,
//               store_option_id: store_option_id,
//               is_repost_you: !!is_repost_you_status,
//             };

//             if (post.is_repost && post.repost_id) {
//               const repostIsLiked = await like_post.findOne({
//                 user_id: user_id,
//                 post_id: data.repost_id._id,
//               });
//               const repostIsSaved = await save_post.findOne({
//                 user_id: user_id,
//                 post_id: data.repost_id._id,
//               });
//               const repostIsPolled = await pollvotes.findOne({
//                 user_id: user_id,
//                 post_id: data.repost_id._id,
//               });

//               var store_option_id = repostIsPolled?.option_id;
//               updatedPost.repost_id = {
//                 ...data.repost_id.toObject(),
//                 is_like: !!repostIsLiked,
//                 is_save: !!repostIsSaved,
//                 is_poll_response: !!repostIsPolled,
//                 store_option_id: store_option_id,
//               };
//             }
//             return updatedPost;
//           })
//         );

//         processedPosts.forEach(async (post) => {
//           if (post?.user_id?.profile_picture) {
//             post.user_id.profile_picture =
//               process.env.BASE_URL + post.user_id.profile_picture;
//           }

//           if (post?.repost_id?.user_id?.profile_picture) {
//             post.repost_id.user_id.profile_picture =
//               process.env.BASE_URL + post.repost_id.user_id.profile_picture;
//           }

//           post?.post_media?.forEach((media) => {
//             if (media.file_type === "image" || media.file_type === "video") {
//               media.file_name = process.env.BASE_URL + media.file_name;
//               if (media.thumb_name) {
//                 media.thumb_name = process.env.BASE_URL + media.thumb_name;
//               }
//             }
//           });

//           post?.repost_id?.post_media?.forEach((media) => {
//             if (media.file_type === "image" || media.file_type === "video") {
//               media.file_name = process.env.BASE_URL + media.file_name;
//               if (media.thumb_name) {
//                 media.thumb_name = process.env.BASE_URL + media.thumb_name;
//               }
//             }
//           });
//         });
//         return processedPosts;
//       }

//       async function processUserPostsAggree(userPosts, user_id) {
//         const processedPosts = await Promise.all(
//           userPosts.map(async (data) => {
//             const isLiked = await like_post.findOne({
//               user_id: user_id,
//               post_id: data._id,
//             });
//             const isSaved = await save_post.findOne({
//               user_id: user_id,
//               post_id: data._id,
//             });
//             const isPolled = await pollvotes.findOne({
//               user_id: user_id,
//               post_id: data._id,
//             });
//             var store_option_id = isPolled?.option_id;

//             const is_repost_you_status = await post.findOne({
//               user_id: user_id,
//               repost_id: data._id,
//               is_deleted: false,
//               is_repost: true
//             })

//             const is_view_impression = await user_impressions.findOne({
//               user_id: user_id,
//               post_id: data._id,
//             });

//             const is_view_Post = await view_post.findOne({
//               user_id: user_id,
//               post_id: data._id,
//             });

//             const updatedPost = {
//               ...data,
//               is_like: !!isLiked,
//               is_save: !!isSaved,
//               is_poll_response: !!isPolled,
//               store_option_id: store_option_id,
//               is_repost_you: !!is_repost_you_status,
//               is_view_impression: !!is_view_impression,
//               is_view_Post: !!is_view_Post,
//             };
//             return updatedPost;
//           })
//         );

//         processedPosts.forEach(async (post) => {
//           if (post?.user_id?.profile_picture) {
//             post.user_id.profile_picture =
//               process.env.BASE_URL + post.user_id.profile_picture;
//           }

//           if (post?.repost_id?.user_id?.profile_picture) {
//             post.repost_id.user_id.profile_picture =
//               process.env.BASE_URL + post.repost_id.user_id.profile_picture;
//           }

//           post?.post_media?.forEach((media) => {
//             if (media.file_type === "image" || media.file_type === "video") {
//               media.file_name = process.env.BASE_URL + media.file_name;
//               if (media.thumb_name) {
//                 media.thumb_name = process.env.BASE_URL + media.thumb_name;
//               }
//             }
//           });

//           post?.repost_id?.post_media?.forEach((media) => {
//             if (media.file_type === "image" || media.file_type === "video") {
//               media.file_name = process.env.BASE_URL + media.file_name;
//               if (media.thumb_name) {
//                 media.thumb_name = process.env.BASE_URL + media.thumb_name;
//               }
//             }
//           });
//         });
//         return processedPosts;
//       }

//       if (subinterestCountResult.length > 0) {
//         const postWithPrivateAccountFalse = await post
//           .find({
//             $and: [
//               { sub_interest_id: { $in: subInterestIds } },
//               {
//                 interest_id: new mongoose.Types.ObjectId(selected_id),
//               },
//               {
//                 $or: [
//                   { user_id: { $nin: blockedUserIds } },
//                   { user_id: { $in: following_user_Ids } },
//                 ],
//               },
//               { user_id: { $nin: userWithPrivateAccountIds, $ne: user_id } },
//               { is_deleted: false },
//               { is_local: false },
//               { is_repost: false },
//               { impression_count: { $lte: 300 } }
//             ],
//           })
//           .populate({
//             path: "user_id",
//             select:
//               "unique_name full_name post_type profile_url profile_picture full_name is_private_account is_verified",
//           })
//           .populate("interest_id sub_interest_id")
//           .populate({
//             path: "repost_id",
//             populate: {
//               path: "user_id",
//               select:
//                 "unique_name full_name post_type profile_url profile_picture full_name is_private_account is_verified",
//             },
//           })
//           .sort({ createdAt: "desc" });

//         const postWithPrivateAccountTrue = await post
//           .find({
//             $and: [
//               { sub_interest_id: { $in: subInterestIds } },
//               { interest_id: new mongoose.Types.ObjectId(selected_id) },
//               {
//                 user_id: { $in: following_user_Ids, $nin: blockedUserIds, $ne: user_id },
//               },
//               {
//                 is_deleted: false,
//                 is_local: false,
//                 is_repost: false,
//                 is_block: false,
//                 impression_count: { $lte: 300 }
//               },
//             ]
//           })
//           .populate({
//             path: "user_id",
//             select:
//               "unique_name full_name post_type profile_url profile_picture full_name is_private_account is_verified",
//           })
//           .populate("interest_id sub_interest_id")
//           .populate({
//             path: "repost_id",
//             populate: {
//               path: "user_id",
//               select:
//                 "unique_name full_name post_type profile_url profile_picture full_name is_private_account is_verified",
//             },
//           })
//           .sort({ createdAt: "desc" });

//         const filteredPosts = postWithPrivateAccountTrue.filter(
//           (post) =>
//             post.user_id.is_private_account === false &&
//             (!post.repost_id ||
//               !post.repost_id.user_id ||
//               post.repost_id.user_id.is_private_account === false)
//         );
//         var userPosts = filteredPosts.concat(postWithPrivateAccountFalse);

//         var userPosts = [
//           ...filteredPosts,
//           ...postWithPrivateAccountFalse.filter(
//             (post) =>
//               !filteredPosts.some((filteredPost) =>
//                 filteredPost._id.equals(post._id)
//               )
//           ),
//         ];

//         const common_data_Array = [];

//         if (userPosts.length > 0) {
//           userPosts?.map((data) => {
//             common_data_Array.push(data?._id);
//           })
//         }

//         const total_data_for_newestPostAlgorithm_300 = userPosts.length;

//         var withoutPaginatedPosts = userPosts.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
//         const startIndex = (page - 1) * parseInt(limit);
//         const endIndex = parseInt(startIndex) + parseInt(limit);
//         var paginatedPosts = withoutPaginatedPosts.slice(startIndex, endIndex)

//         const newestPostAlgorithm_300 = paginatedPosts

//         const combinedPosts = [...usersOwnPostsNotInView, ...newestPostAlgorithm_300];

//         const resultPosts = [];

//         if (usersOwnPostsNotInView.length === 0) {
//           for (let i = 0; i < 10 && i < newestPostAlgorithm_300.length; i++) {
//             resultPosts.push(newestPostAlgorithm_300[i]);
//           }
//         } else {
//           for (let i = 0; i < 5 && i < usersOwnPostsNotInView.length; i++) {
//             resultPosts.push(usersOwnPostsNotInView[i]);
//           }

//           for (let i = 0; i < 5 && resultPosts.length < 10 && i < newestPostAlgorithm_300.length; i++) {
//             resultPosts.push(newestPostAlgorithm_300[i]);
//           }
//         }

//         const total_data_userPostTrending_300_to_1000 = await post.countDocuments({
//           sub_interest_id: { $in: subInterestIds },
//           user_id: { $nin: blockedUserIds },
//           user_id: { $nin: userWithPrivateAccountIds },
//           is_deleted: false,
//           is_block: false,
//           is_local: false,
//           is_repost: false,
//           impression_count: { $gte: 300, $lte: 1000 }
//         });

//         const total_data_userPostTrending_more_than_1000 = await post.countDocuments({
//           sub_interest_id: { $in: subInterestIds },
//           user_id: { $nin: blockedUserIds },
//           user_id: { $nin: userWithPrivateAccountIds },
//           is_deleted: false,
//           is_block: false,
//           is_local: false,
//           is_repost: false,
//           impression_count: { $gte: 1000 }
//         });

//         const old_page_for_newestPostAlgorithm_300 = total_data_for_newestPostAlgorithm_300 / limit;
//         const abc = Math.ceil(old_page_for_newestPostAlgorithm_300);

//         const old_page_for_userPostTrending_300_to_1000 = total_data_userPostTrending_300_to_1000 / limit;
//         const abc1 = Math.ceil(old_page_for_userPostTrending_300_to_1000);

//         const old_page_for_userPostTrending_more_than_1000 = total_data_userPostTrending_more_than_1000 / limit;
//         const abc2 = Math.ceil(old_page_for_userPostTrending_more_than_1000);

//         const xyz = abc + abc1;
//         const xyz1 = abc + abc1 + abc2;

//         var userPostTrending_300_to_1000 = [];
//         var userPostTrending_more_than_1000 = [];
//         var userPostTrending_others_data = [];

//         if (resultPosts.length == 0) {
//           var original_page1 = page - abc;
//           var userPostTrending_300_to_1000 = await post.aggregate([
//             {
//               $match: {
//                 sub_interest_id: { $in: subInterestIds },
//                 user_id: { $nin: blockedUserIds },
//                 user_id: { $nin: userWithPrivateAccountIds },
//                 is_deleted: false,
//                 is_block: false,
//                 is_local: false,
//                 is_repost: false,
//                 impression_count: { $gte: 300, $lte: 1000 }
//               }
//             },
//             {
//               $lookup: {
//                 from: "user_impressions",
//                 localField: "sub_interest_id",
//                 foreignField: "sub_interest_id",
//                 as: "impressionsData"
//               }
//             },
//             {
//               $unwind: {
//                 path: "$impressionsData",
//                 preserveNullAndEmptyArrays: true
//               }
//             },
//             {
//               $group: {
//                 _id: "$_id",
//                 post: { $first: "$$ROOT" },
//                 count: { $sum: 1 }
//               }
//             },
//             {
//               $addFields: {
//                 percentage: {
//                   $let: {
//                     vars: {
//                       percentageInfo: {
//                         $arrayElemAt: [
//                           {
//                             $filter: {
//                               input: percentageData,
//                               cond: { $eq: ["$$this.sub_interest_id", "$post.sub_interest_id"] }
//                             }
//                           },
//                           0
//                         ]
//                       }
//                     },
//                     in: { $ifNull: ["$$percentageInfo.percentage", 0] }
//                   }
//                 }
//               }
//             },
//             {
//               $replaceRoot: { newRoot: "$post" }
//             },
//             {
//               $lookup: {
//                 from: "users",
//                 localField: "user_id",
//                 foreignField: "_id",
//                 as: "user"
//               }
//             },
//             {
//               $lookup: {
//                 from: "interests",
//                 localField: "interest_id",
//                 foreignField: "_id",
//                 as: "interest"
//               }
//             },
//             {
//               $lookup: {
//                 from: "sub_interests",
//                 localField: "sub_interest_id",
//                 foreignField: "_id",
//                 as: "subInterest"
//               }
//             },
//             {
//               $addFields: {
//                 user_id: { $arrayElemAt: ["$user", 0] },
//                 interest_id: { $arrayElemAt: ["$interest", 0] },
//                 sub_interest_id: { $arrayElemAt: ["$subInterest", 0] }
//               }
//             },
//             {
//               $project: {
//                 _id: 1,
//                 user_id: {
//                   _id: 1,
//                   full_name: 1,
//                   profile_picture: 1,
//                   unique_name: 1,
//                   profile_url: 1,
//                   is_verified: 1,
//                   is_private_account: 1
//                 },
//                 interest_id: 1,
//                 sub_interest_id: 1,
//                 title: 1,
//                 description: 1,
//                 post_type: 1,
//                 link_url: 1,
//                 question: 1,
//                 store_option_id: 1,
//                 options: 1,
//                 location: 1,
//                 is_repost: 1,
//                 vote_counter: 1,
//                 repost_count: 1,
//                 view_count: 1,
//                 comment_count: 1,
//                 like_count: 1,
//                 is_local: 1,
//                 is_block: 1,
//                 is_deleted: 1,
//                 post_media: 1,
//                 createdAt: 1,
//                 updatedAt: 1,
//                 interaction_count: 1,
//                 impression_count: 1
//               }
//             },
//             {
//               $sort: { percentage: -1, view_count: -1, createdAt: -1 }
//             },
//             {
//               $skip: (original_page1 - 1) * parseInt(limit),
//             },
//             {
//               $limit: parseInt(limit),
//             },
//           ]);
//         }

//         if (resultPosts.length == 0 && userPostTrending_300_to_1000.length == 0) {
//           var original_page2 = page - xyz;
//           var userPostTrending_more_than_1000 = await post.aggregate([
//             {
//               $match: {
//                 sub_interest_id: { $in: subInterestIds },
//                 user_id: { $nin: blockedUserIds },
//                 user_id: { $nin: userWithPrivateAccountIds },
//                 is_deleted: false,
//                 is_block: false,
//                 is_local: false,
//                 is_repost: false,
//                 impression_count: { $gte: 1000 }
//               }
//             },
//             {
//               $lookup: {
//                 from: "user_impressions",
//                 localField: "sub_interest_id",
//                 foreignField: "sub_interest_id",
//                 as: "impressionsData"
//               }
//             },
//             {
//               $unwind: {
//                 path: "$impressionsData",
//                 preserveNullAndEmptyArrays: true
//               }
//             },
//             {
//               $group: {
//                 _id: "$_id",
//                 post: { $first: "$$ROOT" },
//                 count: { $sum: 1 }
//               }
//             },
//             {
//               $addFields: {
//                 percentage: {
//                   $let: {
//                     vars: {
//                       percentageInfo: {
//                         $arrayElemAt: [
//                           {
//                             $filter: {
//                               input: percentageData,
//                               cond: { $eq: ["$$this.sub_interest_id", "$post.sub_interest_id"] }
//                             }
//                           },
//                           0
//                         ]
//                       }
//                     },
//                     in: { $ifNull: ["$$percentageInfo.percentage", 0] }
//                   }
//                 }
//               }
//             },
//             {
//               $replaceRoot: { newRoot: "$post" }
//             },
//             {
//               $lookup: {
//                 from: "users",
//                 localField: "user_id",
//                 foreignField: "_id",
//                 as: "user"
//               }
//             },
//             {
//               $lookup: {
//                 from: "interests",
//                 localField: "interest_id",
//                 foreignField: "_id",
//                 as: "interest"
//               }
//             },
//             {
//               $lookup: {
//                 from: "sub_interests",
//                 localField: "sub_interest_id",
//                 foreignField: "_id",
//                 as: "subInterest"
//               }
//             },
//             {
//               $addFields: {
//                 user_id: { $arrayElemAt: ["$user", 0] },
//                 interest_id: { $arrayElemAt: ["$interest", 0] },
//                 sub_interest_id: { $arrayElemAt: ["$subInterest", 0] }
//               }
//             },
//             {
//               $project: {
//                 _id: 1,
//                 user_id: {
//                   _id: 1,
//                   full_name: 1,
//                   profile_picture: 1,
//                   unique_name: 1,
//                   profile_url: 1,
//                   is_verified: 1,
//                   is_private_account: 1
//                 },
//                 interest_id: 1,
//                 sub_interest_id: 1,
//                 title: 1,
//                 description: 1,
//                 post_type: 1,
//                 link_url: 1,
//                 question: 1,
//                 store_option_id: 1,
//                 options: 1,
//                 location: 1,
//                 is_repost: 1,
//                 vote_counter: 1,
//                 repost_count: 1,
//                 view_count: 1,
//                 comment_count: 1,
//                 like_count: 1,
//                 is_local: 1,
//                 is_block: 1,
//                 is_deleted: 1,
//                 post_media: 1,
//                 createdAt: 1,
//                 updatedAt: 1,
//                 interaction_count: 1,
//                 impression_count: 1
//               }
//             },
//             {
//               $sort: { percentage: -1, view_count: -1, createdAt: -1 }
//             },
//             {
//               $skip: (original_page2 - 1) * parseInt(limit),
//             },
//             {
//               $limit: parseInt(limit),
//             },
//           ]);
//         }

//         const find_userPostTrending_300_to_1000 = await post.find({
//           sub_interest_id: { $in: subInterestIds },
//           user_id: { $nin: blockedUserIds },
//           user_id: { $nin: userWithPrivateAccountIds },
//           is_deleted: false,
//           is_block: false,
//           is_local: false,
//           is_repost: false,
//           impression_count: { $gte: 300, $lte: 1000 }
//         });

//         if (find_userPostTrending_300_to_1000.length > 0) {
//           find_userPostTrending_300_to_1000?.map((data) => {
//             common_data_Array.push(data?._id);
//           })
//         }

//         const find_userPostTrending_more_than_1000 = await post.find({
//           sub_interest_id: { $in: subInterestIds },
//           user_id: { $nin: blockedUserIds },
//           user_id: { $nin: userWithPrivateAccountIds },
//           is_deleted: false,
//           is_block: false,
//           is_local: false,
//           is_repost: false,
//           impression_count: { $gte: 1000 }
//         });

//         if (find_userPostTrending_more_than_1000.length > 0) {
//           find_userPostTrending_more_than_1000?.map((data) => {
//             common_data_Array.push(data?._id);
//           })
//         }

//         if (resultPosts.length == 0 && userPostTrending_300_to_1000.length == 0 && userPostTrending_more_than_1000.length == 0) {
//           var original_page3 = page - xyz1;

//           var userPostTrending_others_data = await post.aggregate([
//             {
//               $match: {
//                 user_id: { $nin: blockedUserIds },
//                 is_deleted: false,
//                 is_block: false,
//                 is_local: false,
//                 is_repost: false,
//                 interest_id: new mongoose.Types.ObjectId(selected_id),
//                 _id: {
//                   $nin: [
//                     ...await post.distinct('_id', { user_id: user_id }),
//                     ...await view_post.distinct('post_id', { user_id: user_id })
//                   ]
//                 },
//               }
//             },
//             {
//               $match: {
//                 _id: { $nin: common_data_Array }
//               }
//             },
//             {
//               $lookup: {
//                 from: "users",
//                 localField: "user_id",
//                 foreignField: "_id",
//                 as: "user"
//               }
//             },
//             {
//               $lookup: {
//                 from: "interests",
//                 localField: "interest_id",
//                 foreignField: "_id",
//                 as: "interest"
//               }
//             },
//             {
//               $lookup: {
//                 from: "sub_interests",
//                 localField: "sub_interest_id",
//                 foreignField: "_id",
//                 as: "subInterest"
//               }
//             },
//             {
//               $project: {
//                 _id: 1,
//                 user_id: { $arrayElemAt: ["$user", 0] },
//                 interest_id: { $arrayElemAt: ["$interest", 0] },
//                 sub_interest_id: { $arrayElemAt: ["$subInterest", 0] },
//                 title: 1,
//                 description: 1,
//                 post_type: 1,
//                 link_url: 1,
//                 question: 1,
//                 store_option_id: 1,
//                 options: 1,
//                 location: 1,
//                 is_repost: 1,
//                 vote_counter: 1,
//                 repost_count: 1,
//                 view_count: 1,
//                 comment_count: 1,
//                 like_count: 1,
//                 is_local: 1,
//                 is_block: 1,
//                 is_deleted: 1,
//                 post_media: 1,
//                 createdAt: 1,
//                 updatedAt: 1,
//                 interaction_count: 1,
//                 impression_count: 1
//               }
//             },
//             {
//               $project: {
//                 _id: 1,
//                 user_id: {
//                   _id: "$user_id._id",
//                   full_name: "$user_id.full_name",
//                   profile_picture: "$user_id.profile_picture",
//                   unique_name: "$user_id.unique_name",
//                   profile_url: "$user_id.profile_url",
//                   is_verified: "$user_id.is_verified",
//                   is_private_account: "$user_id.is_private_account"
//                 },
//                 interest_id: 1,
//                 sub_interest_id: 1,
//                 title: 1,
//                 description: 1,
//                 post_type: 1,
//                 link_url: 1,
//                 question: 1,
//                 store_option_id: 1,
//                 options: 1,
//                 location: 1,
//                 is_repost: 1,
//                 vote_counter: 1,
//                 repost_count: 1,
//                 view_count: 1,
//                 comment_count: 1,
//                 like_count: 1,
//                 is_local: 1,
//                 is_block: 1,
//                 is_deleted: 1,
//                 post_media: 1,
//                 createdAt: 1,
//                 updatedAt: 1,
//                 interaction_count: 1,
//                 impression_count: 1
//               }
//             },
//             {
//               $sort: { view_count: -1, createdAt: -1 }
//             },
//             {
//               $skip: (original_page3 - 1) * parseInt(limit),
//             },
//             {
//               $limit: parseInt(limit),
//             },
//           ]);
//         }

//         if (resultPosts.length > 0) {
//           const post_for_display = await processUserPosts(resultPosts, user_id);

//           return multiSuccessRes(
//             res,
//             "Posts retrieved successfully",
//             post_for_display,
//             post_for_display.length
//           );
//         }

//         if (userPostTrending_300_to_1000.length > 0) {
//           const post_for_display = await processUserPostsAggree(userPostTrending_300_to_1000, user_id);

//           return multiSuccessRes(
//             res,
//             "Posts retrieved successfully",
//             post_for_display,
//             post_for_display.length
//           );
//         }

//         if (userPostTrending_more_than_1000.length > 0) {
//           const post_for_display = await processUserPostsAggree(userPostTrending_more_than_1000, user_id);

//           return multiSuccessRes(
//             res,
//             "Posts retrieved successfully",
//             post_for_display,
//             post_for_display.length
//           );
//         }

//         if (userPostTrending_others_data.length > 0) {

//           const post_for_display = await processUserPostsAggree(userPostTrending_others_data, user_id);

//           return multiSuccessRes(
//             res,
//             "Posts retrieved successfully",
//             post_for_display,
//             post_for_display.length
//           );
//         } else {
//           return multiSuccessRes(
//             res,
//             "Posts retrieved successfully",
//             [],
//             0
//           );
//         }
//       } else {
//         var userPosts = await post.aggregate([
//           {
//             $match: {
//               user_id: { $nin: blockedUserIds },
//               is_deleted: false,
//               is_block: false,
//               is_local: false,
//               is_repost: false,
//               interest_id: new mongoose.Types.ObjectId(selected_id),
//               _id: {
//                 $nin: await view_post.distinct('post_id', { user_id: user_id })
//               },
//               view_count: { $gte: 1 }
//             }
//           },
//           {
//             $lookup: {
//               from: "users",
//               localField: "user_id",
//               foreignField: "_id",
//               as: "user"
//             }
//           },
//           {
//             $lookup: {
//               from: "interests",
//               localField: "interest_id",
//               foreignField: "_id",
//               as: "interest"
//             }
//           },
//           {
//             $lookup: {
//               from: "sub_interests",
//               localField: "sub_interest_id",
//               foreignField: "_id",
//               as: "subInterest"
//             }
//           },
//           {
//             $project: {
//               _id: 1,
//               user_id: { $arrayElemAt: ["$user", 0] },
//               interest_id: { $arrayElemAt: ["$interest", 0] },
//               sub_interest_id: { $arrayElemAt: ["$subInterest", 0] },
//               title: 1,
//               description: 1,
//               post_type: 1,
//               link_url: 1,
//               question: 1,
//               store_option_id: 1,
//               options: 1,
//               location: 1,
//               is_repost: 1,
//               vote_counter: 1,
//               repost_count: 1,
//               view_count: 1,
//               comment_count: 1,
//               like_count: 1,
//               is_local: 1,
//               is_block: 1,
//               is_deleted: 1,
//               post_media: 1,
//               createdAt: 1,
//               updatedAt: 1,
//               interaction_count: 1,
//               impression_count: 1
//             }
//           },
//           {
//             $project: {
//               _id: 1,
//               user_id: {
//                 _id: "$user_id._id",
//                 full_name: "$user_id.full_name",
//                 profile_picture: "$user_id.profile_picture",
//                 unique_name: "$user_id.unique_name",
//                 profile_url: "$user_id.profile_url",
//                 is_verified: "$user_id.is_verified",
//                 is_private_account: "$user_id.is_private_account"
//               },
//               interest_id: 1,
//               sub_interest_id: 1,
//               title: 1,
//               description: 1,
//               post_type: 1,
//               link_url: 1,
//               question: 1,
//               store_option_id: 1,
//               options: 1,
//               location: 1,
//               is_repost: 1,
//               vote_counter: 1,
//               repost_count: 1,
//               view_count: 1,
//               comment_count: 1,
//               like_count: 1,
//               is_local: 1,
//               is_block: 1,
//               is_deleted: 1,
//               post_media: 1,
//               createdAt: 1,
//               updatedAt: 1,
//               interaction_count: 1,
//               impression_count: 1
//             }
//           },
//           {
//             $sort: { view_count: -1, createdAt: -1 }
//           },
//           {
//             $skip: (page - 1) * parseInt(limit),
//           },
//           {
//             $limit: parseInt(limit),
//           },
//         ]);

//         const post_for_display = await processUserPostsAggree(userPosts, user_id);

//         return multiSuccessRes(
//           res,
//           "Posts retrieved successfully",
//           post_for_display,
//           post_for_display.length
//         );
//       }
//     }
//   } catch (error) {
//     console.log("Error:", error);
//     return errorRes(res, "Internal server error");
//   }
// };

// const getHomeInterests = async (req, res) => {
//   try {
//     var find_interest = await interest
//       .find({
//         is_deleted: false,
//       })
//       .select("interest color_code")
//       .sort({ createdAt: 1 });

//     return successRes(res, `Interests get successfully`, find_interest);
//   } catch (error) {
//     console.log("Error : ", error);
//     return errorRes(res, "Internal server error");
//   }
// };

// const getAllPostsBySubInterest = async (req, res) => {
//   try {
//     if (!req.body.user_id) {
//       var user_id = req.user._id;
//     } else {
//       var user_id = req.body.user_id;
//     }
//     var { page = 1, limit = 10, selected_id } = req.body;

//     const userPrivate = await users.find({
//       is_private_account: true,
//       is_deleted: false,
//     });
//     const userBlockedByOthers = await block_user.find({
//       user_id: user_id,
//       is_deleted: false,
//     });
//     const usersBlockingCurrentUser = await block_user.find({
//       block_user_id: user_id,
//       is_deleted: false,
//     });

//     const userPrivateIds = userPrivate.map((block) => block._id);
//     const userBlockedByOthersIds = userBlockedByOthers.map(
//       (block) => block.block_user_id
//     );
//     const usersBlockingCurrentUserIds = usersBlockingCurrentUser.map(
//       (block) => block.user_id
//     );

//     const blockedUserIds = [
//       ...userBlockedByOthersIds,
//       ...usersBlockingCurrentUserIds,
//       ...userPrivateIds,
//     ];

//     const queryObject = {};

//     if (selected_id) {
//       queryObject.sub_interest_id = selected_id;

//       var following_data = await follower_following.find().where({
//         user_id: user_id,
//         is_deleted: false,
//         is_request: true,
//       });

//       const following_user_Ids = following_data.map(
//         (data) => data.following_id
//       );

//       const userPostsPrivateFalse = await post
//         .find({
//           $and: [
//             {
//               $or: [
//                 { sub_interest_id: { $in: queryObject.sub_interest_id } },
//               ],
//             },
//             {
//               _id: {
//                 $nin: [
//                   ...await post.distinct('_id', { user_id: user_id }),
//                   ...await view_post.distinct('post_id', { user_id: user_id })
//                 ]
//               }
//             },
//             {
//               $or: [
//                 { user_id: { $nin: blockedUserIds } },
//                 { user_id: { $in: following_user_Ids } },
//               ],
//             },
//             { is_deleted: false, is_local: false, is_repost: false },
//           ],
//         })
//         .populate({
//           path: "user_id",
//           select:
//             "unique_name full_name post_type profile_url profile_picture full_name",
//         })
//         .populate("interest_id sub_interest_id")
//         .populate({
//           path: "repost_id",
//           populate: {
//             path: "user_id",
//             select:
//               "unique_name full_name post_type profile_url profile_picture full_name",
//           },
//         })
//         .sort({ createdAt: "desc" });

//       const userPostsPrivateTrue = await post
//         .find({
//           $or: [
//             { sub_interest_id: queryObject.sub_interest_id },
//           ],
//           _id: {
//             $nin: [
//               ...await post.distinct('_id', { user_id: user_id }),
//               ...await view_post.distinct('post_id', { user_id: user_id })
//             ]
//           },
//           user_id: { $nin: blockedUserIds },
//           is_deleted: false,
//           is_local: false,
//           is_repost: false
//         })
//         .populate({
//           path: "user_id",
//           select:
//             "unique_name full_name post_type profile_url profile_picture full_name",
//         })
//         .populate("interest_id sub_interest_id")
//         .populate({
//           path: "repost_id",
//           populate: {
//             path: "user_id",
//             select:
//               "unique_name full_name post_type profile_url profile_picture full_name",
//           },
//         })
//         .sort({ createdAt: "desc" });

//       const filteredPosts = userPostsPrivateTrue.filter(
//         (post) =>
//           post.user_id.is_private_account === false &&
//           (!post.repost_id ||
//             !post.repost_id.user_id ||
//             post.repost_id.user_id.is_private_account === false)
//       );
//       var userPosts = filteredPosts.concat(userPostsPrivateFalse);

//       var userPosts = [
//         ...filteredPosts,
//         ...userPostsPrivateFalse.filter(
//           (post) =>
//             !filteredPosts.some((filteredPost) =>
//               filteredPost._id.equals(post._id)
//             )
//         ),
//       ];
//       var withoutPaginatedPosts = userPosts.sort((a, b) => (a.view_count > b.view_count ? -1 : 1));
//       var userPostsCount = userPosts.length;
//       const startIndex = (page - 1) * parseInt(limit);
//       const endIndex = parseInt(startIndex) + parseInt(limit);
//       var paginatedPosts = withoutPaginatedPosts.slice(startIndex, endIndex)

//       if (userPostsCount === 0) {
//         var userPosts = await post.aggregate([
//           {
//             $match: {
//               user_id: { $nin: blockedUserIds },
//               is_deleted: false,
//               is_block: false,
//               is_local: false,
//               is_repost: false,
//               sub_interest_id: new mongoose.Types.ObjectId(queryObject?.sub_interest_id),
//               _id: {
//                 $nin: [...await post.distinct('_id', { user_id: user_id })]
//               },
//               view_count: { $gte: 1 }
//             }
//           },
//           {
//             $lookup: {
//               from: "users",
//               localField: "user_id",
//               foreignField: "_id",
//               as: "user"
//             }
//           },
//           {
//             $lookup: {
//               from: "interests",
//               localField: "interest_id",
//               foreignField: "_id",
//               as: "interest"
//             }
//           },
//           {
//             $lookup: {
//               from: "sub_interests",
//               localField: "sub_interest_id",
//               foreignField: "_id",
//               as: "subInterest"
//             }
//           },
//           {
//             $project: {
//               _id: 1,
//               user_id: { $arrayElemAt: ["$user", 0] },
//               interest_id: { $arrayElemAt: ["$interest", 0] },
//               sub_interest_id: { $arrayElemAt: ["$subInterest", 0] },
//               title: 1,
//               description: 1,
//               post_type: 1,
//               link_url: 1,
//               question: 1,
//               store_option_id: 1,
//               options: 1,
//               location: 1,
//               is_repost: 1,
//               vote_counter: 1,
//               repost_count: 1,
//               view_count: 1,
//               comment_count: 1,
//               like_count: 1,
//               is_local: 1,
//               is_block: 1,
//               is_deleted: 1,
//               post_media: 1,
//               createdAt: 1,
//               updatedAt: 1,
//               interaction_count: 1,
//               impression_count: 1
//             }
//           },
//           {
//             $project: {
//               _id: 1,
//               user_id: {
//                 _id: "$user_id._id",
//                 full_name: "$user_id.full_name",
//                 profile_picture: "$user_id.profile_picture",
//                 unique_name: "$user_id.unique_name",
//                 profile_url: "$user_id.profile_url",
//                 is_verified: "$user_id.is_verified",
//                 is_private_account: "$user_id.is_private_account"
//               },
//               interest_id: 1,
//               sub_interest_id: 1,
//               title: 1,
//               description: 1,
//               post_type: 1,
//               link_url: 1,
//               question: 1,
//               store_option_id: 1,
//               options: 1,
//               location: 1,
//               is_repost: 1,
//               vote_counter: 1,
//               repost_count: 1,
//               view_count: 1,
//               comment_count: 1,
//               like_count: 1,
//               is_local: 1,
//               is_block: 1,
//               is_deleted: 1,
//               post_media: 1,
//               createdAt: 1,
//               updatedAt: 1,
//               interaction_count: 1,
//               impression_count: 1
//             }
//           },
//           {
//             $sort: { createdAt: -1, view_count: -1 }
//           },
//           {
//             $skip: (page - 1) * parseInt(limit),
//           },
//           {
//             $limit: parseInt(limit),
//           },
//         ]);

//         userPosts = await Promise.all(
//           userPosts.map(async (data) => {
//             const isLiked = await like_post.findOne({
//               user_id: user_id,
//               post_id: data._id,
//             });
//             const isSaved = await save_post.findOne({
//               user_id: user_id,
//               post_id: data._id,
//             });
//             const isPolled = await pollvotes.findOne({
//               user_id: user_id,
//               post_id: data._id,
//             });
//             var store_option_id = isPolled?.option_id;

//             const is_repost_you_status = await post.findOne({
//               user_id: user_id,
//               repost_id: data._id,
//               is_deleted: false,
//               is_repost: true
//             })
//             const updatedPost = {
//               ...data,
//               is_like: !!isLiked,
//               is_save: !!isSaved,
//               is_poll_response: !!isPolled,
//               store_option_id: store_option_id,
//               is_repost_you: !!is_repost_you_status
//             };

//             if (post.is_repost && post.repost_id) {
//               const repostIsLiked = await like_post.findOne({
//                 user_id: user_id,
//                 post_id: data.repost_id._id,
//               });
//               const repostIsSaved = await save_post.findOne({
//                 user_id: user_id,
//                 post_id: data.repost_id._id,
//               });
//               const repostIsPolled = await pollvotes.findOne({
//                 user_id: user_id,
//                 post_id: data.repost_id._id,
//               });

//               var store_option_id = repostIsPolled?.option_id;
//               updatedPost.repost_id = {
//                 ...data.repost_id,
//                 is_like: !!repostIsLiked,
//                 is_save: !!repostIsSaved,
//                 is_poll_response: !!repostIsPolled,
//                 store_option_id: store_option_id,
//               };
//             }

//             return updatedPost;
//           })
//         );

//         userPosts.forEach(async (post) => {
//           if (post?.user_id?.profile_picture) {
//             post.user_id.profile_picture =
//               process.env.BASE_URL + post.user_id.profile_picture;
//           }

//           if (post?.repost_id?.user_id?.profile_picture) {
//             post.repost_id.user_id.profile_picture =
//               process.env.BASE_URL + post.repost_id.user_id.profile_picture;
//           }
//           post.post_media.forEach((media) => {
//             if (media.file_type === "image" || media.file_type === "video") {
//               media.file_name = process.env.BASE_URL + media.file_name;
//               if (media.thumb_name) {
//                 media.thumb_name = process.env.BASE_URL + media.thumb_name;
//               }
//             }
//           });

//           post?.repost_id?.post_media.forEach((media) => {
//             if (media.file_type === "image" || media.file_type === "video") {
//               media.file_name = process.env.BASE_URL + media.file_name;
//               if (media.thumb_name) {
//                 media.thumb_name = process.env.BASE_URL + media.thumb_name;
//               }
//             }
//           });
//         });

//         var userPostsCount = userPosts.length;
//         return multiSuccessRes(
//           res,
//           "Posts retrieved successfully",
//           userPosts,
//           userPostsCount
//         );

//       }

//       if (!paginatedPosts || paginatedPosts.length === 0) {
//         return successRes(res, "No posts found for this user", []);
//       }

//       paginatedPosts = await Promise.all(
//         paginatedPosts.map(async (data) => {
//           const isLiked = await like_post.findOne({
//             user_id: user_id,
//             post_id: data._id,
//           });
//           const isSaved = await save_post.findOne({
//             user_id: user_id,
//             post_id: data._id,
//           });
//           const isPolled = await pollvotes.findOne({
//             user_id: user_id,
//             post_id: data._id,
//           });
//           var store_option_id = isPolled?.option_id;

//           const is_repost_you_status = await post.findOne({
//             user_id: user_id,
//             repost_id: data._id,
//             is_deleted: false,
//             is_repost: true
//           })
//           const updatedPost = {
//             ...data.toObject(),
//             is_like: !!isLiked,
//             is_save: !!isSaved,
//             is_poll_response: !!isPolled,
//             store_option_id: store_option_id,
//             is_repost_you: !!is_repost_you_status
//           };

//           if (post.is_repost && post.repost_id) {
//             const repostIsLiked = await like_post.findOne({
//               user_id: user_id,
//               post_id: data.repost_id._id,
//             });
//             const repostIsSaved = await save_post.findOne({
//               user_id: user_id,
//               post_id: data.repost_id._id,
//             });
//             const repostIsPolled = await pollvotes.findOne({
//               user_id: user_id,
//               post_id: data.repost_id._id,
//             });

//             var store_option_id = repostIsPolled?.option_id;
//             updatedPost.repost_id = {
//               ...data.repost_id.toObject(),
//               is_like: !!repostIsLiked,
//               is_save: !!repostIsSaved,
//               is_poll_response: !!repostIsPolled,
//               store_option_id: store_option_id,
//             };
//           }
//           return updatedPost;
//         })
//       );

//       paginatedPosts.forEach(async (post) => {
//         if (post?.user_id?.profile_picture) {
//           post.user_id.profile_picture =
//             process.env.BASE_URL + post.user_id.profile_picture;
//         }

//         if (post?.repost_id?.user_id?.profile_picture) {
//           post.repost_id.user_id.profile_picture =
//             process.env.BASE_URL + post.repost_id.user_id.profile_picture;
//         }
//         post.post_media.forEach((media) => {
//           if (media.file_type === "image" || media.file_type === "video") {
//             media.file_name = process.env.BASE_URL + media.file_name;
//             if (media.thumb_name) {
//               media.thumb_name = process.env.BASE_URL + media.thumb_name;
//             }
//           }
//         });

//         post?.repost_id?.post_media.forEach((media) => {
//           if (media.file_type === "image" || media.file_type === "video") {
//             media.file_name = process.env.BASE_URL + media.file_name;
//             if (media.thumb_name) {
//               media.thumb_name = process.env.BASE_URL + media.thumb_name;
//             }
//           }
//         });
//       });

//       return multiSuccessRes(
//         res,
//         "Posts retrieved successfully",
//         paginatedPosts,
//         userPostsCount
//       );
//     }
//   } catch (error) {
//     console.log("Error:", error);
//     return errorRes(res, "Internal server error");
//   }
// };


const getAllPosts = async (req, res) => {
  try {
    // if (!req.body.user_id) {
    //   var user_id = req.user._id;
    // } else {
    //   var user_id = req.body.user_id;
    // }
    let user_id;
    if (!req.body.user_id) {
      user_id = req.user._id;
    } else {
      user_id = req.body.user_id;
    }
    var { page = 1, limit = 10, selected_id, language } = req.body;

    const userWithPrivateAccount = await users.find({
      is_private_account: true,
      is_deleted: false,
    });
    const userBlockedByOthers = await block_user.find({
      user_id: user_id,
      is_deleted: false,
    });
    const usersBlockingCurrentUser = await block_user.find({
      block_user_id: user_id,
      is_deleted: false,
    });

    const userBlockedByOthersIds = userBlockedByOthers.map(
      (block) => block.block_user_id
    );
    const usersBlockingCurrentUserIds = usersBlockingCurrentUser.map(
      (block) => block.user_id
    );

    const user = await users.findOne({
      _id: user_id,
      is_deleted: false,
    });
    if (!user) {
      return errorRes(res, "This user does not exist");
    }

    const queryObject = {};

    queryObject.sub_interest_id = user.interested;

    const user_following_data = await follower_following.find().where({
      user_id: user_id,
      is_deleted: false,
      is_request: true,
    });

    const following_user_Ids = user_following_data.map((data) => data.following_id);

    const userWithPrivateAccountIds = userWithPrivateAccount.map((private) => private._id);

    const blockedUserIds = [
      ...userBlockedByOthersIds,
      ...usersBlockingCurrentUserIds,
    ];

    const subinterestCountResult = await user_interactions.aggregate([
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(user_id),
          sub_interest_id: { $ne: null },
          // $or: [
          //   { createdAt: { $gte: new Date("2024-01-30T00:00:00.000Z") } },
          //   { updatedAt: { $gte: new Date("2024-01-30T00:00:00.000Z") } }
          // ]
        },
      },
      {
        $group: {
          _id: { $ifNull: ["$sub_interest_id", "null"] }, // Handle null values
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          sub_interest_id: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    const usersOwnPostsNotInView = await post.find({
      user_id: user_id,
      is_deleted: false,
      is_repost: false,
      is_local: false,
      _id: {
        $nin: await view_post.distinct('post_id', { user_id: user_id })
      }
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate({
        path: "user_id",
        select:
          "unique_name full_name post_type profile_url profile_picture full_name is_private_account is_verified",
      })
      .populate("interest_id sub_interest_id")
      .populate({
        path: "repost_id",
        populate: {
          path: "user_id",
          select:
            "unique_name full_name post_type profile_url profile_picture full_name is_private_account is_verified",
        },
      })
      .sort({ createdAt: "desc" });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // var sevenDaysTrendingPost = await post.aggregate([
    //   {
    //     $match: {
    //       createdAt: { $gte: sevenDaysAgo }
    //     }
    //   },
    //   {
    //     $lookup: {
    //       from: "user_impressions",
    //       localField: "sub_interest_id",
    //       foreignField: "sub_interest_id",
    //       as: "impressionsData"
    //     }
    //   },
    //   {
    //     $unwind: {
    //       path: "$impressionsData",
    //       preserveNullAndEmptyArrays: true
    //     }
    //   },
    //   {
    //     $group: {
    //       _id: "$_id",
    //       post: { $first: "$$ROOT" },
    //       count: { $sum: 1 }
    //     }
    //   },
    //   {
    //     $addFields: {
    //       percentage: {
    //         $let: {
    //           vars: {
    //             percentageInfo: {
    //               $arrayElemAt: [
    //                 {
    //                   $filter: {
    //                     input: percentageData,
    //                     cond: { $eq: ["$$this.sub_interest_id", "$post.sub_interest_id"] }
    //                   }
    //                 },
    //                 0
    //               ]
    //             }
    //           },
    //           in: { $ifNull: ["$$percentageInfo.percentage", 0] }
    //         }
    //       }
    //     }
    //   },
    //   {
    //     $replaceRoot: { newRoot: "$post" }
    //   },
    //   {
    //     $lookup: {
    //       from: "users",
    //       localField: "user_id",
    //       foreignField: "_id",
    //       as: "user"
    //     }
    //   },
    //   {
    //     $lookup: {
    //       from: "interests",
    //       localField: "interest_id",
    //       foreignField: "_id",
    //       as: "interest"
    //     }
    //   },
    //   {
    //     $lookup: {
    //       from: "sub_interests",
    //       localField: "sub_interest_id",
    //       foreignField: "_id",
    //       as: "subInterest"
    //     }
    //   },
    //   {
    //     $addFields: {
    //       user_id: { $arrayElemAt: ["$user", 0] },
    //       interest_id: { $arrayElemAt: ["$interest", 0] },
    //       sub_interest_id: { $arrayElemAt: ["$subInterest", 0] }
    //     }
    //   },
    //   {
    //     $project: {
    //       _id: 1,
    //       user_id: {
    //         _id: 1,
    //         full_name: 1,
    //         profile_picture: 1,
    //         unique_name: 1,
    //         profile_url: 1,
    //         is_verified: 1,
    //         is_private_account: 1
    //       },
    //       interest_id: 1,
    //       sub_interest_id: 1,
    //       title: 1,
    //       description: 1,
    //       post_type: 1,
    //       link_url: 1,
    //       question: 1,
    //       store_option_id: 1,
    //       options: 1,
    //       location: 1,
    //       is_repost: 1,
    //       vote_counter: 1,
    //       repost_count: 1,
    //       view_count: 1,
    //       comment_count: 1,
    //       like_count: 1,
    //       is_local: 1,
    //       is_block: 1,
    //       is_deleted: 1,
    //       post_media: 1,
    //       createdAt: 1,
    //       updatedAt: 1,
    //       interaction_count: 1,
    //       impression_count: 1
    //     }
    //   },
    //   {
    //     $sort: { like_count: -1 }
    //   },
    //   {
    //     $skip: (page - 1) * parseInt(limit),
    //   },
    //   {
    //     $limit: parseInt(limit),
    //   },
    // ]);

    const sortedSubinterestCountResult = subinterestCountResult.sort((a, b) => b.count - a.count);

    const totalCount = subinterestCountResult.reduce((acc, item) => acc + item.count, 0);
    const percentageData = subinterestCountResult.map(item => ({
      sub_interest_id: item.sub_interest_id,
      count: item.count,
      percentage: (item.count / totalCount) * 100,
    }));

    const subInterestIds = sortedSubinterestCountResult.map(result => result.sub_interest_id);

    async function processUserPosts(userPosts, user_id) {
      const processedPosts = await Promise.all(
        userPosts.map(async (data) => {
          const isLiked = await like_post.findOne({
            user_id: user_id,
            post_id: data._id,
          });
          const isSaved = await save_post.findOne({
            user_id: user_id,
            post_id: data._id,
          });
          const isPolled = await pollvotes.findOne({
            user_id: user_id,
            post_id: data._id,
          });
          var store_option_id = isPolled?.option_id;

          const is_repost_you_status = await post.findOne({
            user_id: user_id,
            repost_id: data._id,
            is_deleted: false,
            is_repost: true,
          });

          if (language === "hindi") {
            data.interest_id.interest = data.interest_id.hindi;
            data.sub_interest_id.sub_interest = data.sub_interest_id.hindi;
          } else if (language === "kannada") {
            data.interest_id.interest = data.interest_id.kannada;
            data.sub_interest_id.sub_interest = data.sub_interest_id.kannada;
          } else if (language === "telugu") {
            data.interest_id.interest = data.interest_id.telugu;
            data.sub_interest_id.sub_interest = data.sub_interest_id.telugu;
          }
          else if (language === "malayalam") {
            data.interest_id.interest = data.interest_id.malayalam;
            data.sub_interest_id.sub_interest = data.sub_interest_id.malayalam;
          }
          else if (language === "tamil") {
            data.interest_id.interest = data.interest_id.tamil;
            data.sub_interest_id.sub_interest = data.sub_interest_id.tamil;
          }

          const updatedPost = {
            ...data.toObject(),
            is_like: !!isLiked,
            is_save: !!isSaved,
            is_poll_response: !!isPolled,
            store_option_id: store_option_id,
            is_repost_you: !!is_repost_you_status,
          };

          if (post.is_repost && post.repost_id) {
            const repostIsLiked = await like_post.findOne({
              user_id: user_id,
              post_id: data.repost_id._id,
            });
            const repostIsSaved = await save_post.findOne({
              user_id: user_id,
              post_id: data.repost_id._id,
            });
            const repostIsPolled = await pollvotes.findOne({
              user_id: user_id,
              post_id: data.repost_id._id,
            });

            var store_option_id = repostIsPolled?.option_id;
            updatedPost.repost_id = {
              ...data.repost_id.toObject(),
              is_like: !!repostIsLiked,
              is_save: !!repostIsSaved,
              is_poll_response: !!repostIsPolled,
              store_option_id: store_option_id,
            };
          }

          return updatedPost;
        })
      );

      processedPosts.forEach(async (post) => {
        if (post?.user_id?.profile_picture) {
          post.user_id.profile_picture =
            process.env.BASE_URL + post.user_id.profile_picture;
        }

        if (post?.repost_id?.user_id?.profile_picture) {
          post.repost_id.user_id.profile_picture =
            process.env.BASE_URL + post.repost_id.user_id.profile_picture;
        }

        post?.post_media?.forEach((media) => {
          if (media.file_type === "image" || media.file_type === "video") {
            media.file_name = process.env.BASE_URL + media.file_name;
            if (media.thumb_name) {
              media.thumb_name = process.env.BASE_URL + media.thumb_name;
            }
          }
        });

        post?.repost_id?.post_media?.forEach((media) => {
          if (media.file_type === "image" || media.file_type === "video") {
            media.file_name = process.env.BASE_URL + media.file_name;
            if (media.thumb_name) {
              media.thumb_name = process.env.BASE_URL + media.thumb_name;
            }
          }
        });
      });

      return processedPosts;
    }

    async function processUserPostsAggree(userPosts, user_id) {
      const processedPosts = await Promise.all(
        userPosts.map(async (data) => {
          const isLiked = await like_post.findOne({
            user_id: user_id,
            post_id: data._id,
          });
          const isSaved = await save_post.findOne({
            user_id: user_id,
            post_id: data._id,
          });
          const isPolled = await pollvotes.findOne({
            user_id: user_id,
            post_id: data._id,
          });
          var store_option_id = isPolled?.option_id;

          const is_repost_you_status = await post.findOne({
            user_id: user_id,
            repost_id: data._id,
            is_deleted: false,
            is_repost: true
          })

          const is_view_impression = await user_impressions.findOne({
            user_id: user_id,
            post_id: data._id,
          });

          const is_view_Post = await view_post.findOne({
            user_id: user_id,
            post_id: data._id,
          });
          if (language === "hindi") {
            data.interest_id.interest = data.interest_id.hindi;
            data.sub_interest_id.sub_interest = data.sub_interest_id.hindi;
          } else if (language === "kannada") {
            data.interest_id.interest = data.interest_id.kannada;
            data.sub_interest_id.sub_interest = data.sub_interest_id.kannada;
          } else if (language === "telugu") {
            data.interest_id.interest = data.interest_id.telugu;
            data.sub_interest_id.sub_interest = data.sub_interest_id.telugu;
          }
          else if (language === "malayalam") {
            data.interest_id.interest = data.interest_id.malayalam;
            data.sub_interest_id.sub_interest = data.sub_interest_id.malayalam;
          }
          else if (language === "tamil") {
            data.interest_id.interest = data.interest_id.tamil;
            data.sub_interest_id.sub_interest = data.sub_interest_id.tamil;
          }
          const updatedPost = {
            ...data,
            is_like: !!isLiked,
            is_save: !!isSaved,
            is_poll_response: !!isPolled,
            store_option_id: store_option_id,
            is_repost_you: !!is_repost_you_status,
            is_view_impression: !!is_view_impression,
            is_view_Post: !!is_view_Post,
          };
          return updatedPost;
        })
      );

      processedPosts.forEach(async (post) => {
        if (post?.user_id?.profile_picture) {
          post.user_id.profile_picture =
            process.env.BASE_URL + post.user_id.profile_picture;
        }

        if (post?.repost_id?.user_id?.profile_picture) {
          post.repost_id.user_id.profile_picture =
            process.env.BASE_URL + post.repost_id.user_id.profile_picture;
        }

        post?.post_media?.forEach((media) => {
          if (media.file_type === "image" || media.file_type === "video") {
            media.file_name = process.env.BASE_URL + media.file_name;
            if (media.thumb_name) {
              media.thumb_name = process.env.BASE_URL + media.thumb_name;
            }
          }
        });

        post?.repost_id?.post_media?.forEach((media) => {
          if (media.file_type === "image" || media.file_type === "video") {
            media.file_name = process.env.BASE_URL + media.file_name;
            if (media.thumb_name) {
              media.thumb_name = process.env.BASE_URL + media.thumb_name;
            }
          }
        });
      });

      return processedPosts;
    }

    const postWithPrivateAccountFalse = await post
      .find({
        $and: [
          {
            _id: {
              $nin: await view_post.distinct('post_id', { user_id: user_id })
            }
          },
          { sub_interest_id: { $in: subInterestIds } },
          {
            $or: [
              { user_id: { $nin: blockedUserIds } },
              { user_id: { $in: following_user_Ids } },
            ],
          },
          { user_id: { $nin: userWithPrivateAccountIds, $ne: user_id } },
          { is_deleted: false },
          { is_local: false },
          { is_repost: false },
          { impression_count: { $lte: 300 } }
        ],
      })
      .populate({
        path: "user_id",
        select:
          "unique_name full_name post_type profile_url profile_picture full_name is_private_account is_verified",
      })
      .populate("interest_id sub_interest_id")
      .populate({
        path: "repost_id",
        populate: {
          path: "user_id",
          select:
            "unique_name full_name post_type profile_url profile_picture full_name is_private_account is_verified",
        },
      })
      .sort({ createdAt: "desc" });

    const postWith200To300T = await post
      .find({
        $and: [
          {
            _id: {
              $nin: await view_post.distinct('post_id', { user_id: user_id })
            }
          },
          { sub_interest_id: { $nin: subInterestIds } },
          {
            $or: [
              { user_id: { $nin: blockedUserIds } },
              { user_id: { $in: following_user_Ids } },
            ],
          },
          { user_id: { $nin: userWithPrivateAccountIds, $ne: user_id } },
          { is_deleted: false },
          { is_local: false },
          { is_repost: false },
          { impression_count: { $gte: 200, $lte: 300 } }
        ],
      })
      .populate({
        path: "user_id",
        select:
          "unique_name full_name post_type profile_url profile_picture full_name is_private_account is_verified",
      })
      .populate("interest_id sub_interest_id")
      .populate({
        path: "repost_id",
        populate: {
          path: "user_id",
          select:
            "unique_name full_name post_type profile_url profile_picture full_name is_private_account is_verified",
        },
      })
      .sort({ createdAt: "desc" });

    const postWithPrivateAccountTrue = await post
      .find({
        $and: [
          {
            _id: {
              $nin: await view_post.distinct('post_id', { user_id: user_id })
            }
          },
          { sub_interest_id: { $in: subInterestIds } },
          {
            user_id: { $in: following_user_Ids, $nin: blockedUserIds, $ne: user_id },
          },
          {
            is_deleted: false,
            is_local: false,
            is_repost: false,
            is_block: false,
            // impression_count: { $lte: 300 }
          },
        ]
      })
      .populate({
        path: "user_id",
        select:
          "unique_name full_name post_type profile_url profile_picture full_name is_private_account is_verified",
      })
      .populate("interest_id sub_interest_id")
      .populate({
        path: "repost_id",
        populate: {
          path: "user_id",
          select:
            "unique_name full_name post_type profile_url profile_picture full_name is_private_account is_verified",
        },
      })
      .sort({ createdAt: "desc" });

    const filteredPosts = postWithPrivateAccountTrue.filter(
      (post) =>
        post.user_id.is_private_account === false &&
        (!post.repost_id ||
          !post.repost_id.user_id ||
          post.repost_id.user_id.is_private_account === false)
    );
    var userPosts = filteredPosts.concat(postWithPrivateAccountFalse, postWith200To300T);

    var userPosts = [
      ...filteredPosts,
      ...postWithPrivateAccountFalse.filter(
        (post) =>
          !filteredPosts.some((filteredPost) =>
            filteredPost._id.equals(post._id)
          )
      ),
    ];

    const total_data_for_newestPostAlgorithm_300 = userPosts.length;
    //working
    // var withoutPaginatedPosts1 = userPosts.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
    // const startIndex = (page - 1) * parseInt(limit);
    // const endIndex = parseInt(startIndex) + parseInt(limit);
    // var paginatedPosts1 = withoutPaginatedPosts1.slice(startIndex, endIndex)

    // const shuffledPosts = [...userPosts];

    // // Shuffle the copied array
    // for (let i = shuffledPosts.length - 1; i > 0; i--) {
    //   const j = Math.floor(Math.random() * (i + 1));
    //   [shuffledPosts[i], shuffledPosts[j]] = [shuffledPosts[j], shuffledPosts[i]];
    // }

    // // Apply sorting based on createdAt while maintaining the randomness
    // const withoutPaginatedPosts1 = shuffledPosts.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));


    // const startIndex = (page - 1) * parseInt(limit);
    // const endIndex = parseInt(startIndex) + parseInt(limit);
    // const paginatedPosts1 = withoutPaginatedPosts1.slice(startIndex, endIndex);


    // const shuffledPosts = userPosts.sort(() => Math.random() - 0.5);

    // const startIndex = (page - 1) * parseInt(limit);
    // const endIndex = parseInt(startIndex) + parseInt(limit);
    // const paginatedPosts1 = shuffledPosts.slice(startIndex, endIndex);
    var newestPostAlgorithm_300 = []

    if (page == 1) {
      console.log("------------")
      const shuffledPosts = userPosts.sort(() => Math.random() - 0.5);

      const startIndex = (page - 1) * parseInt(limit);
      const endIndex = parseInt(startIndex) + parseInt(limit);
      var newestPostAlgorithm_300 = shuffledPosts.slice(startIndex, endIndex);
    } else {
      console.log("-----+++++++++++++-------")
      var withoutPaginatedPosts1 = userPosts.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
      // If original_page1 is not 1, don't shuffle, just slice the array directly
      const startIndex = (page - 1) * parseInt(limit);
      const endIndex = parseInt(startIndex) + parseInt(limit);
      var newestPostAlgorithm_300_data = withoutPaginatedPosts1.slice(startIndex, endIndex);
      function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
      }
      var newestPostAlgorithm_300 = shuffleArray([...newestPostAlgorithm_300_data]);
    }

    const resultPosts = [];

    if (usersOwnPostsNotInView.length === 0) {
      for (let i = 0; i < 10 && i < newestPostAlgorithm_300.length; i++) {
        resultPosts.push(newestPostAlgorithm_300[i]);
      }
    } else {
      for (let i = 0; i < 5 && i < usersOwnPostsNotInView.length; i++) {
        resultPosts.push(usersOwnPostsNotInView[i]);
      }

      for (let i = 0; i < 5 && resultPosts.length < 10 && i < newestPostAlgorithm_300.length; i++) {
        resultPosts.push(newestPostAlgorithm_300[i]);
      }
    }

    const total_data_userPostTrending_300_to_1000 = await post.countDocuments({
      sub_interest_id: { $in: subInterestIds },
      user_id: { $nin: blockedUserIds },
      user_id: { $nin: userWithPrivateAccountIds },
      is_deleted: false,
      is_block: false,
      is_local: false,
      is_repost: false,
      impression_count: { $gte: 300, $lte: 1000 },
      _id: {
        $nin: await view_post.distinct('post_id', { user_id: user_id })
      }
    });

    const total_data_userPostTrending_more_than_1000 = await post.countDocuments({
      sub_interest_id: { $in: subInterestIds },
      user_id: { $nin: blockedUserIds },
      user_id: { $nin: userWithPrivateAccountIds },
      is_deleted: false,
      is_block: false,
      is_local: false,
      is_repost: false,
      impression_count: { $gte: 1000 },
      _id: {
        $nin: await view_post.distinct('post_id', { user_id: user_id })
      }
    });

    const old_page_for_newestPostAlgorithm_300 = total_data_for_newestPostAlgorithm_300 / limit;
    const abc = Math.ceil(old_page_for_newestPostAlgorithm_300);

    const old_page_for_userPostTrending_300_to_1000 = total_data_userPostTrending_300_to_1000 / limit;
    const abc1 = Math.ceil(old_page_for_userPostTrending_300_to_1000);

    const old_page_for_userPostTrending_more_than_1000 = total_data_userPostTrending_more_than_1000 / limit;
    const abc2 = Math.ceil(old_page_for_userPostTrending_more_than_1000);

    const xyz = abc + abc1;
    const wxyz = abc + abc1 + abc2;

    var userPostTrending_300_to_1000 = [];
    var userPostTrending_more_than_1000 = [];
    var already_seen_posts_by_users = [];

    if (resultPosts.length == 0) {
      var original_page1 = page - abc;
      // userPostTrending_300_to_1000
      var userPostTrending_300_to_700 = await post.aggregate([
        {
          $match: {
            sub_interest_id: { $in: subInterestIds },
            user_id: { $nin: blockedUserIds },
            user_id: { $nin: userWithPrivateAccountIds },
            is_deleted: false,
            is_block: false,
            is_local: false,
            is_repost: false,
            impression_count: { $gte: 300, $lte: 700 },
            _id: {
              $nin: await view_post.distinct('post_id', { user_id: user_id })
            }
          }
        },
        {
          $lookup: {
            from: "user_impressions",
            localField: "sub_interest_id",
            foreignField: "sub_interest_id",
            as: "impressionsData"
          }
        },
        {
          $unwind: {
            path: "$impressionsData",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $group: {
            _id: "$_id",
            post: { $first: "$$ROOT" },
            count: { $sum: 1 }
          }
        },
        {
          $addFields: {
            percentage: {
              $let: {
                vars: {
                  percentageInfo: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: percentageData,
                          cond: { $eq: ["$$this.sub_interest_id", "$post.sub_interest_id"] }
                        }
                      },
                      0
                    ]
                  }
                },
                in: { $ifNull: ["$$percentageInfo.percentage", 0] }
              }
            }
          }
        },
        {
          $replaceRoot: { newRoot: "$post" }
        },
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "user"
          }
        },
        {
          $lookup: {
            from: "interests",
            localField: "interest_id",
            foreignField: "_id",
            as: "interest"
          }
        },
        {
          $lookup: {
            from: "sub_interests",
            localField: "sub_interest_id",
            foreignField: "_id",
            as: "subInterest"
          }
        },
        {
          $addFields: {
            user_id: { $arrayElemAt: ["$user", 0] },
            interest_id: { $arrayElemAt: ["$interest", 0] },
            sub_interest_id: { $arrayElemAt: ["$subInterest", 0] }
          }
        },
        {
          $project: {
            _id: 1,
            user_id: {
              _id: 1,
              full_name: 1,
              profile_picture: 1,
              unique_name: 1,
              profile_url: 1,
              is_verified: 1,
              is_private_account: 1
            },
            interest_id: 1,
            sub_interest_id: 1,
            title: 1,
            description: 1,
            post_type: 1,
            link_url: 1,
            question: 1,
            store_option_id: 1,
            options: 1,
            location: 1,
            is_repost: 1,
            vote_counter: 1,
            repost_count: 1,
            view_count: 1,
            comment_count: 1,
            like_count: 1,
            is_local: 1,
            is_block: 1,
            is_deleted: 1,
            post_media: 1,
            createdAt: 1,
            updatedAt: 1,
            interaction_count: 1,
            impression_count: 1
          }
        },
        {
          $sort: { percentage: -1, view_count: -1, createdAt: -1 }
        },
        // {
        //   $skip: (original_page1 - 1) * parseInt(limit),
        // },
        // {
        //   $limit: parseInt(limit),
        // },
      ]);
      var userPostTrending_700_to_1000 = await post.aggregate([
        {
          $match: {
            // sub_interest_id: { $in: subInterestIds },
            user_id: { $nin: blockedUserIds },
            user_id: { $nin: userWithPrivateAccountIds },
            is_deleted: false,
            is_block: false,
            is_local: false,
            is_repost: false,
            impression_count: { $gte: 700, $lte: 1000 },
            _id: {
              $nin: await view_post.distinct('post_id', { user_id: user_id })
            }
          }
        },
        {
          $lookup: {
            from: "user_impressions",
            localField: "sub_interest_id",
            foreignField: "sub_interest_id",
            as: "impressionsData"
          }
        },
        {
          $unwind: {
            path: "$impressionsData",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $group: {
            _id: "$_id",
            post: { $first: "$$ROOT" },
            count: { $sum: 1 }
          }
        },
        {
          $addFields: {
            percentage: {
              $let: {
                vars: {
                  percentageInfo: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: percentageData,
                          cond: { $eq: ["$$this.sub_interest_id", "$post.sub_interest_id"] }
                        }
                      },
                      0
                    ]
                  }
                },
                in: { $ifNull: ["$$percentageInfo.percentage", 0] }
              }
            }
          }
        },
        {
          $replaceRoot: { newRoot: "$post" }
        },
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "user"
          }
        },
        {
          $lookup: {
            from: "interests",
            localField: "interest_id",
            foreignField: "_id",
            as: "interest"
          }
        },
        {
          $lookup: {
            from: "sub_interests",
            localField: "sub_interest_id",
            foreignField: "_id",
            as: "subInterest"
          }
        },
        {
          $addFields: {
            user_id: { $arrayElemAt: ["$user", 0] },
            interest_id: { $arrayElemAt: ["$interest", 0] },
            sub_interest_id: { $arrayElemAt: ["$subInterest", 0] }
          }
        },
        {
          $project: {
            _id: 1,
            user_id: {
              _id: 1,
              full_name: 1,
              profile_picture: 1,
              unique_name: 1,
              profile_url: 1,
              is_verified: 1,
              is_private_account: 1
            },
            interest_id: 1,
            sub_interest_id: 1,
            title: 1,
            description: 1,
            post_type: 1,
            link_url: 1,
            question: 1,
            store_option_id: 1,
            options: 1,
            location: 1,
            is_repost: 1,
            vote_counter: 1,
            repost_count: 1,
            view_count: 1,
            comment_count: 1,
            like_count: 1,
            is_local: 1,
            is_block: 1,
            is_deleted: 1,
            post_media: 1,
            createdAt: 1,
            updatedAt: 1,
            interaction_count: 1,
            impression_count: 1
          }
        },
        {
          $sort: { impression_count: -1, createdAt: -1 }
        },
        // {
        //   $skip: (original_page1 - 1) * parseInt(limit),
        // },
        // {
        //   $limit: parseInt(limit),
        // },
      ]);

      var post_data_1 = userPostTrending_300_to_700.concat(userPostTrending_700_to_1000);
      // const startIndexData = (original_page1 - 1) * parseInt(limit);
      // const endIndexData = parseInt(startIndexData) + parseInt(limit);
      // var userPostTrending_300_to_1000 = post_data_1.slice(startIndexData, endIndexData)


      // const shuffledPostsdata = post_data_1.sort(() => Math.random() - 0.5);

      // const startIndexData = (original_page1 - 1) * parseInt(limit);
      // const endIndexData = parseInt(startIndexData) + parseInt(limit);
      // var userPostTrending_300_to_1000 = shuffledPostsdata.slice(startIndexData, endIndexData);

      if (original_page1 == 1) {
        console.log("------------")
        const shuffledPostsData = post_data_1.sort(() => Math.random() - 0.5);
        const startIndexData = (original_page1 - 1) * parseInt(limit);
        const endIndexData = parseInt(startIndexData) + parseInt(limit);
        var userPostTrending_300_to_1000 = shuffledPostsData.slice(startIndexData, endIndexData);
      } else {
        console.log("-----+++++++++++++-------")
        var withoutPaginatedPosts300_100 = post_data_1.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
        const startIndexData = (original_page1 - 1) * parseInt(limit);
        const endIndexData = parseInt(startIndexData) + parseInt(limit);
        var userPostTrending_300_to_1000_data = withoutPaginatedPosts300_100.slice(startIndexData, endIndexData);


        function shuffleArray(array) {
          for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
          }
          return array;
        }
        var userPostTrending_300_to_1000 = shuffleArray([...userPostTrending_300_to_1000_data]);
        // const startIndexData = (original_page1 - 1) * parseInt(limit);
        // const endIndexData = parseInt(startIndexData) + parseInt(limit);
        // var userPostTrending_300_to_1000 = post_data_1.slice(startIndexData, endIndexData)
      }


    }

    if (resultPosts.length == 0 && userPostTrending_300_to_1000.length == 0) {
      var original_page2 = page - xyz;
      var userPostTrending_more_than_1000 = await post.aggregate([
        {
          $match: {
            // sub_interest_id: { $in: subInterestIds },
            user_id: { $nin: blockedUserIds },
            user_id: { $nin: userWithPrivateAccountIds },
            is_deleted: false,
            is_block: false,
            is_local: false,
            is_repost: false,
            impression_count: { $gte: 1000 },
            _id: {
              $nin: await view_post.distinct('post_id', { user_id: user_id })
            }
          }
        },
        {
          $addFields: {
            randomCondition: {
              $cond: {
                if: { $eq: [original_page2, 1] }, // Check if original_page2 is 1
                then: true, // If true, apply sample
                else: false // If false, skip sample
              }
            }
          }
        },
        {
          $match: {
            randomCondition: true // Only apply sample if randomCondition is true
          }
        },
        {
          $sample: { size: 10 } // Specify the number of random documents you want to retrieve
        },
        {
          $lookup: {
            from: "user_impressions",
            localField: "sub_interest_id",
            foreignField: "sub_interest_id",
            as: "impressionsData"
          }
        },
        {
          $unwind: {
            path: "$impressionsData",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $group: {
            _id: "$_id",
            post: { $first: "$$ROOT" },
            count: { $sum: 1 }
          }
        },
        {
          $addFields: {
            percentage: {
              $let: {
                vars: {
                  percentageInfo: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: percentageData,
                          cond: { $eq: ["$$this.sub_interest_id", "$post.sub_interest_id"] }
                        }
                      },
                      0
                    ]
                  }
                },
                in: { $ifNull: ["$$percentageInfo.percentage", 0] }
              }
            }
          }
        },
        {
          $replaceRoot: { newRoot: "$post" }
        },
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "user"
          }
        },
        {
          $lookup: {
            from: "interests",
            localField: "interest_id",
            foreignField: "_id",
            as: "interest"
          }
        },
        {
          $lookup: {
            from: "sub_interests",
            localField: "sub_interest_id",
            foreignField: "_id",
            as: "subInterest"
          }
        },
        {
          $addFields: {
            user_id: { $arrayElemAt: ["$user", 0] },
            interest_id: { $arrayElemAt: ["$interest", 0] },
            sub_interest_id: { $arrayElemAt: ["$subInterest", 0] }
          }
        },
        {
          $project: {
            _id: 1,
            user_id: {
              _id: 1,
              full_name: 1,
              profile_picture: 1,
              unique_name: 1,
              profile_url: 1,
              is_verified: 1,
              is_private_account: 1
            },
            interest_id: 1,
            sub_interest_id: 1,
            title: 1,
            description: 1,
            post_type: 1,
            link_url: 1,
            question: 1,
            store_option_id: 1,
            options: 1,
            location: 1,
            is_repost: 1,
            vote_counter: 1,
            repost_count: 1,
            view_count: 1,
            comment_count: 1,
            like_count: 1,
            is_local: 1,
            is_block: 1,
            is_deleted: 1,
            post_media: 1,
            createdAt: 1,
            updatedAt: 1,
            interaction_count: 1,
            impression_count: 1
          }
        },
        {
          $sort: { impression_count: -1, createdAt: -1 }
        },
        {
          $skip: (original_page2 - 1) * parseInt(limit),
        },
        {
          $limit: parseInt(limit),
        },
      ]);
    }

    if (resultPosts.length == 0 && userPostTrending_300_to_1000.length == 0 && userPostTrending_more_than_1000.length == 0) {
      var original_page3 = page - wxyz;
      var already_seen_posts_by_users = await post.aggregate([
        {
          $match: {
            sub_interest_id: { $in: subInterestIds },
            user_id: { $nin: blockedUserIds },
            user_id: { $nin: userWithPrivateAccountIds },
            is_deleted: false,
            is_block: false,
            is_local: false,
            is_repost: false,
            impression_count: { $gte: 1 },
          }
        },
        {
          $addFields: {
            randomCondition: {
              $cond: {
                if: { $eq: [original_page3, 1] }, // Check if original_page2 is 1
                then: true, // If true, apply sample
                else: false // If false, skip sample
              }
            }
          }
        },
        {
          $match: {
            randomCondition: true // Only apply sample if randomCondition is true
          }
        },
        {
          $sample: { size: 10 } // Specify the number of random documents you want to retrieve
        },
        {
          $lookup: {
            from: "user_impressions",
            localField: "sub_interest_id",
            foreignField: "sub_interest_id",
            as: "impressionsData"
          }
        },
        {
          $unwind: {
            path: "$impressionsData",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $group: {
            _id: "$_id",
            post: { $first: "$$ROOT" },
            count: { $sum: 1 }
          }
        },
        {
          $addFields: {
            percentage: {
              $let: {
                vars: {
                  percentageInfo: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: percentageData,
                          cond: { $eq: ["$$this.sub_interest_id", "$post.sub_interest_id"] }
                        }
                      },
                      0
                    ]
                  }
                },
                in: { $ifNull: ["$$percentageInfo.percentage", 0] }
              }
            }
          }
        },
        {
          $replaceRoot: { newRoot: "$post" }
        },
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "user"
          }
        },
        {
          $lookup: {
            from: "interests",
            localField: "interest_id",
            foreignField: "_id",
            as: "interest"
          }
        },
        {
          $lookup: {
            from: "sub_interests",
            localField: "sub_interest_id",
            foreignField: "_id",
            as: "subInterest"
          }
        },
        {
          $addFields: {
            user_id: { $arrayElemAt: ["$user", 0] },
            interest_id: { $arrayElemAt: ["$interest", 0] },
            sub_interest_id: { $arrayElemAt: ["$subInterest", 0] }
          }
        },
        {
          $project: {
            _id: 1,
            user_id: {
              _id: 1,
              full_name: 1,
              profile_picture: 1,
              unique_name: 1,
              profile_url: 1,
              is_verified: 1,
              is_private_account: 1
            },
            interest_id: 1,
            sub_interest_id: 1,
            title: 1,
            description: 1,
            post_type: 1,
            link_url: 1,
            question: 1,
            store_option_id: 1,
            options: 1,
            location: 1,
            is_repost: 1,
            vote_counter: 1,
            repost_count: 1,
            view_count: 1,
            comment_count: 1,
            like_count: 1,
            is_local: 1,
            is_block: 1,
            is_deleted: 1,
            post_media: 1,
            createdAt: 1,
            updatedAt: 1,
            interaction_count: 1,
            impression_count: 1
          }
        },
        {
          $sort: { view_count: -1, createdAt: -1 }
        },
        {
          $skip: (original_page3 - 1) * parseInt(limit),
        },
        {
          $limit: parseInt(limit),
        },
      ]);
    }

    if (!selected_id) {
      if (resultPosts.length > 0) {
        const post_for_display = await processUserPosts(resultPosts, user_id);

        return multiSuccessRes(
          res,
          "Posts retrieved successfully",
          post_for_display,
          post_for_display.length
        );
      }

      if (userPostTrending_300_to_1000.length > 0) {
        const post_for_display = await processUserPostsAggree(userPostTrending_300_to_1000, user_id);

        return multiSuccessRes(
          res,
          "Posts retrieved successfully",
          post_for_display,
          post_for_display.length
        );
      }

      if (userPostTrending_more_than_1000.length > 0) {
        const post_for_display = await processUserPostsAggree(userPostTrending_more_than_1000, user_id);

        return multiSuccessRes(
          res,
          "Posts retrieved successfully",
          post_for_display,
          post_for_display.length
        );
      }

      if (already_seen_posts_by_users.length > 0) {
        const post_for_display = await processUserPostsAggree(already_seen_posts_by_users, user_id);

        return multiSuccessRes(
          res,
          "Posts retrieved successfully",
          post_for_display,
          post_for_display.length
        );
      }
      else {
        return multiSuccessRes(
          res,
          "Posts retrieved successfully",
          [],
          0
        );
      }
    }

    if (selected_id) {
      const userWithPrivateAccount = await users.find({
        is_private_account: true,
        is_deleted: false,
      });
      const userBlockedByOthers = await block_user.find({
        user_id: user_id,
        is_deleted: false,
      });
      const usersBlockingCurrentUser = await block_user.find({
        block_user_id: user_id,
        is_deleted: false,
      });

      const userBlockedByOthersIds = userBlockedByOthers.map(
        (block) => block.block_user_id
      );
      const usersBlockingCurrentUserIds = usersBlockingCurrentUser.map(
        (block) => block.user_id
      );

      const user = await users.findOne({
        _id: user_id,
        is_deleted: false,
      });
      if (!user) {
        return errorRes(res, "This user does not exist");
      }

      const queryObject = {};

      queryObject.interest_id = selected_id;

      const user_following_data = await follower_following.find().where({
        user_id: user_id,
        is_deleted: false,
        is_request: true,
      });

      const following_user_Ids = user_following_data.map((data) => data.following_id);

      const userWithPrivateAccountIds = userWithPrivateAccount.map((private) => private._id);

      const blockedUserIds = [
        ...userBlockedByOthersIds,
        ...usersBlockingCurrentUserIds,
      ];

      const subinterestCountResult = await user_interactions.aggregate([
        {
          $match: {
            user_id: new mongoose.Types.ObjectId(user_id),
            interest_id: new mongoose.Types.ObjectId(selected_id),
            sub_interest_id: { $ne: null },
          },
        },
        {
          $group: {
            _id: { $ifNull: ["$sub_interest_id", "null"] },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            sub_interest_id: "$_id",
            count: 1,
            _id: 0,
          },
        },
      ]);

      const usersOwnPostsNotInView = await post.find({
        user_id: user_id,
        interest_id: selected_id,
        is_deleted: false,
        is_repost: false,
        is_local: false,
        _id: {
          $nin: await view_post.distinct('post_id', { user_id: user_id })
        }
      })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate({
          path: "user_id",
          select:
            "unique_name full_name post_type profile_url profile_picture full_name is_private_account is_verified",
        })
        .populate("interest_id sub_interest_id")
        .populate({
          path: "repost_id",
          populate: {
            path: "user_id",
            select:
              "unique_name full_name post_type profile_url profile_picture full_name is_private_account is_verified",
          },
        })
        .sort({ createdAt: "desc" });

      const sortedSubinterestCountResult = subinterestCountResult.sort((a, b) => b.count - a.count);

      const totalCount = subinterestCountResult.reduce((acc, item) => acc + item.count, 0);
      const percentageData = subinterestCountResult.map(item => ({
        sub_interest_id: item.sub_interest_id,
        count: item.count,
        percentage: (item.count / totalCount) * 100,
      }));

      const subInterestIds = sortedSubinterestCountResult.map(result => result.sub_interest_id);

      async function processUserPosts(userPosts, user_id) {
        const processedPosts = await Promise.all(
          userPosts.map(async (data) => {
            const isLiked = await like_post.findOne({
              user_id: user_id,
              post_id: data._id,
            });
            const isSaved = await save_post.findOne({
              user_id: user_id,
              post_id: data._id,
            });
            const isPolled = await pollvotes.findOne({
              user_id: user_id,
              post_id: data._id,
            });
            var store_option_id = isPolled?.option_id;

            const is_repost_you_status = await post.findOne({
              user_id: user_id,
              repost_id: data._id,
              is_deleted: false,
              is_repost: true,
            });

            if (language === "hindi") {
              data.interest_id.interest = data.interest_id.hindi;
              data.sub_interest_id.sub_interest = data.sub_interest_id.hindi;
            } else if (language === "kannada") {
              data.interest_id.interest = data.interest_id.kannada;
              data.sub_interest_id.sub_interest = data.sub_interest_id.kannada;
            } else if (language === "telugu") {
              data.interest_id.interest = data.interest_id.telugu;
              data.sub_interest_id.sub_interest = data.sub_interest_id.telugu;
            }
            else if (language === "malayalam") {
              data.interest_id.interest = data.interest_id.malayalam;
              data.sub_interest_id.sub_interest = data.sub_interest_id.malayalam;
            }
            else if (language === "tamil") {
              data.interest_id.interest = data.interest_id.tamil;
              data.sub_interest_id.sub_interest = data.sub_interest_id.tamil;
            }
            const updatedPost = {
              ...data.toObject(),
              is_like: !!isLiked,
              is_save: !!isSaved,
              is_poll_response: !!isPolled,
              store_option_id: store_option_id,
              is_repost_you: !!is_repost_you_status,
            };

            if (post.is_repost && post.repost_id) {
              const repostIsLiked = await like_post.findOne({
                user_id: user_id,
                post_id: data.repost_id._id,
              });
              const repostIsSaved = await save_post.findOne({
                user_id: user_id,
                post_id: data.repost_id._id,
              });
              const repostIsPolled = await pollvotes.findOne({
                user_id: user_id,
                post_id: data.repost_id._id,
              });

              var store_option_id = repostIsPolled?.option_id;
              updatedPost.repost_id = {
                ...data.repost_id.toObject(),
                is_like: !!repostIsLiked,
                is_save: !!repostIsSaved,
                is_poll_response: !!repostIsPolled,
                store_option_id: store_option_id,
              };
            }
            return updatedPost;
          })
        );

        processedPosts.forEach(async (post) => {
          if (post?.user_id?.profile_picture) {
            post.user_id.profile_picture =
              process.env.BASE_URL + post.user_id.profile_picture;
          }

          if (post?.repost_id?.user_id?.profile_picture) {
            post.repost_id.user_id.profile_picture =
              process.env.BASE_URL + post.repost_id.user_id.profile_picture;
          }

          post?.post_media?.forEach((media) => {
            if (media.file_type === "image" || media.file_type === "video") {
              media.file_name = process.env.BASE_URL + media.file_name;
              if (media.thumb_name) {
                media.thumb_name = process.env.BASE_URL + media.thumb_name;
              }
            }
          });

          post?.repost_id?.post_media?.forEach((media) => {
            if (media.file_type === "image" || media.file_type === "video") {
              media.file_name = process.env.BASE_URL + media.file_name;
              if (media.thumb_name) {
                media.thumb_name = process.env.BASE_URL + media.thumb_name;
              }
            }
          });
        });
        return processedPosts;
      }

      async function processUserPostsAggree(userPosts, user_id) {
        const processedPosts = await Promise.all(
          userPosts.map(async (data) => {
            const isLiked = await like_post.findOne({
              user_id: user_id,
              post_id: data._id,
            });
            const isSaved = await save_post.findOne({
              user_id: user_id,
              post_id: data._id,
            });
            const isPolled = await pollvotes.findOne({
              user_id: user_id,
              post_id: data._id,
            });
            var store_option_id = isPolled?.option_id;

            const is_repost_you_status = await post.findOne({
              user_id: user_id,
              repost_id: data._id,
              is_deleted: false,
              is_repost: true
            })

            const is_view_impression = await user_impressions.findOne({
              user_id: user_id,
              post_id: data._id,
            });

            const is_view_Post = await view_post.findOne({
              user_id: user_id,
              post_id: data._id,
            });
            if (language === "hindi") {
              data.interest_id.interest = data.interest_id.hindi;
              data.sub_interest_id.sub_interest = data.sub_interest_id.hindi;
            } else if (language === "kannada") {
              data.interest_id.interest = data.interest_id.kannada;
              data.sub_interest_id.sub_interest = data.sub_interest_id.kannada;
            } else if (language === "telugu") {
              data.interest_id.interest = data.interest_id.telugu;
              data.sub_interest_id.sub_interest = data.sub_interest_id.telugu;
            }
            else if (language === "malayalam") {
              data.interest_id.interest = data.interest_id.malayalam;
              data.sub_interest_id.sub_interest = data.sub_interest_id.malayalam;
            }
            else if (language === "tamil") {
              data.interest_id.interest = data.interest_id.tamil;
              data.sub_interest_id.sub_interest = data.sub_interest_id.tamil;
            }

            const updatedPost = {
              ...data,
              is_like: !!isLiked,
              is_save: !!isSaved,
              is_poll_response: !!isPolled,
              store_option_id: store_option_id,
              is_repost_you: !!is_repost_you_status,
              is_view_impression: !!is_view_impression,
              is_view_Post: !!is_view_Post,
            };
            return updatedPost;
          })
        );

        processedPosts.forEach(async (post) => {
          if (post?.user_id?.profile_picture) {
            post.user_id.profile_picture =
              process.env.BASE_URL + post.user_id.profile_picture;
          }

          if (post?.repost_id?.user_id?.profile_picture) {
            post.repost_id.user_id.profile_picture =
              process.env.BASE_URL + post.repost_id.user_id.profile_picture;
          }

          post?.post_media?.forEach((media) => {
            if (media.file_type === "image" || media.file_type === "video") {
              media.file_name = process.env.BASE_URL + media.file_name;
              if (media.thumb_name) {
                media.thumb_name = process.env.BASE_URL + media.thumb_name;
              }
            }
          });

          post?.repost_id?.post_media?.forEach((media) => {
            if (media.file_type === "image" || media.file_type === "video") {
              media.file_name = process.env.BASE_URL + media.file_name;
              if (media.thumb_name) {
                media.thumb_name = process.env.BASE_URL + media.thumb_name;
              }
            }
          });
        });
        return processedPosts;
      }

      if (subinterestCountResult.length > 0) {
        const postWithPrivateAccountFalse = await post
          .find({
            $and: [
              {
                _id: {
                  $nin: await view_post.distinct('post_id', { user_id: user_id })
                }
              },
              { sub_interest_id: { $in: subInterestIds } },
              {
                interest_id: new mongoose.Types.ObjectId(selected_id),
              },
              {
                $or: [
                  { user_id: { $nin: blockedUserIds } },
                  { user_id: { $in: following_user_Ids } },
                ],
              },
              { user_id: { $nin: userWithPrivateAccountIds, $ne: user_id } },
              { is_deleted: false },
              { is_local: false },
              { is_repost: false },
              { impression_count: { $lte: 300 } }
            ],
          })
          .populate({
            path: "user_id",
            select:
              "unique_name full_name post_type profile_url profile_picture full_name is_private_account is_verified",
          })
          .populate("interest_id sub_interest_id")
          .populate({
            path: "repost_id",
            populate: {
              path: "user_id",
              select:
                "unique_name full_name post_type profile_url profile_picture full_name is_private_account is_verified",
            },
          })
          .sort({ createdAt: "desc" });

        const postWith200To300T = await post
          .find({
            $and: [
              {
                _id: {
                  $nin: await view_post.distinct('post_id', { user_id: user_id })
                }
              },
              { sub_interest_id: { $nin: subInterestIds } },
              {
                interest_id: new mongoose.Types.ObjectId(selected_id),
              },
              {
                $or: [
                  { user_id: { $nin: blockedUserIds } },
                  { user_id: { $in: following_user_Ids } },
                ],
              },
              { user_id: { $nin: userWithPrivateAccountIds, $ne: user_id } },
              { is_deleted: false },
              { is_local: false },
              { is_repost: false },
              { impression_count: { $lte: 300 } }
            ],
          })
          .populate({
            path: "user_id",
            select:
              "unique_name full_name post_type profile_url profile_picture full_name is_private_account is_verified",
          })
          .populate("interest_id sub_interest_id")
          .populate({
            path: "repost_id",
            populate: {
              path: "user_id",
              select:
                "unique_name full_name post_type profile_url profile_picture full_name is_private_account is_verified",
            },
          })
          .sort({ createdAt: "desc" });

        const postWithPrivateAccountTrue = await post
          .find({
            $and: [
              { sub_interest_id: { $in: subInterestIds } },
              { interest_id: new mongoose.Types.ObjectId(selected_id) },
              {
                user_id: { $in: following_user_Ids, $nin: blockedUserIds, $ne: user_id },
              },
              {
                is_deleted: false,
                is_local: false,
                is_repost: false,
                is_block: false,
                impression_count: { $lte: 300 }
              },
            ]
          })
          .populate({
            path: "user_id",
            select:
              "unique_name full_name post_type profile_url profile_picture full_name is_private_account is_verified",
          })
          .populate("interest_id sub_interest_id")
          .populate({
            path: "repost_id",
            populate: {
              path: "user_id",
              select:
                "unique_name full_name post_type profile_url profile_picture full_name is_private_account is_verified",
            },
          })
          .sort({ createdAt: "desc" });

        const filteredPosts = postWithPrivateAccountTrue.filter(
          (post) =>
            post.user_id.is_private_account === false &&
            (!post.repost_id ||
              !post.repost_id.user_id ||
              post.repost_id.user_id.is_private_account === false)
        );
        var userPosts = filteredPosts.concat(postWithPrivateAccountFalse, postWith200To300T);

        // var userPosts = [
        //   ...filteredPosts,
        //   ...postWithPrivateAccountFalse.filter(
        //     (post) =>
        //       !filteredPosts.some((filteredPost) =>
        //         filteredPost._id.equals(post._id)
        //       )
        //   ),
        // ];

        userPosts = [
          ...filteredPosts,
          ...postWithPrivateAccountFalse.filter(
            (post) =>
              !filteredPosts.some((filteredPost) =>
                filteredPost._id.equals(post._id)
              )
          ),
        ];

        const common_data_Array = [];

        if (userPosts.length > 0) {
          userPosts?.map((data) => {
            common_data_Array.push(data?._id);
          })
        }

        const total_data_for_newestPostAlgorithm_300 = userPosts.length;
        //working without random
        // var withoutPaginatedPosts = userPosts.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
        // const startIndex = (page - 1) * parseInt(limit);
        // const endIndex = parseInt(startIndex) + parseInt(limit);
        // var paginatedPosts = withoutPaginatedPosts.slice(startIndex, endIndex)


        //  working with random 
        // const withoutPaginatedPostsshuffle = userPosts.sort(() => Math.random() - 0.5);

        // const startIndex = (page - 1) * parseInt(limit);
        // const endIndex = parseInt(startIndex) + parseInt(limit);
        // const paginatedPosts = withoutPaginatedPostsshuffle.slice(startIndex, endIndex);

        // const newestPostAlgorithm_300 = paginatedPosts

        var newestPostAlgorithm_300 = [];
        if (page == 1) {
          console.log("------------")
          const withoutPaginatedPostsshuffle = userPosts.sort(() => Math.random() - 0.5);

          const startIndex = (page - 1) * parseInt(limit);
          const endIndex = parseInt(startIndex) + parseInt(limit);
          var newestPostAlgorithm_300 = withoutPaginatedPostsshuffle.slice(startIndex, endIndex);
        } else {
          console.log("-----+++++++++++++-------")
          var withoutPaginatedPosts1 = userPosts.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
          // If original_page1 is not 1, don't shuffle, just slice the array directly
          const startIndex = (page - 1) * parseInt(limit);
          const endIndex = parseInt(startIndex) + parseInt(limit);
          var newestPostAlgorithm_300_data = withoutPaginatedPosts1.slice(startIndex, endIndex);


          function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
          }
          var newestPostAlgorithm_300 = shuffleArray([...newestPostAlgorithm_300_data]);
        }

        const resultPosts = [];

        if (usersOwnPostsNotInView.length === 0) {
          for (let i = 0; i < 10 && i < newestPostAlgorithm_300.length; i++) {
            resultPosts.push(newestPostAlgorithm_300[i]);
          }
        } else {
          for (let i = 0; i < 5 && i < usersOwnPostsNotInView.length; i++) {
            resultPosts.push(usersOwnPostsNotInView[i]);
          }

          for (let i = 0; i < 5 && resultPosts.length < 10 && i < newestPostAlgorithm_300.length; i++) {
            resultPosts.push(newestPostAlgorithm_300[i]);
          }
        }

        const total_data_userPostTrending_300_to_1000 = await post.countDocuments({
          sub_interest_id: { $in: subInterestIds },
          user_id: { $nin: blockedUserIds },
          user_id: { $nin: userWithPrivateAccountIds },
          is_deleted: false,
          is_block: false,
          is_local: false,
          is_repost: false,
          impression_count: { $gte: 300, $lte: 1000 },
          _id: {
            $nin: await view_post.distinct('post_id', { user_id: user_id })
          }
        });

        const total_data_userPostTrending_more_than_1000 = await post.countDocuments({
          sub_interest_id: { $in: subInterestIds },
          user_id: { $nin: blockedUserIds },
          user_id: { $nin: userWithPrivateAccountIds },
          is_deleted: false,
          is_block: false,
          is_local: false,
          is_repost: false,
          impression_count: { $gte: 1000 },
          _id: {
            $nin: await view_post.distinct('post_id', { user_id: user_id })
          }
        });

        const old_page_for_newestPostAlgorithm_300 = total_data_for_newestPostAlgorithm_300 / limit;
        const abc = Math.ceil(old_page_for_newestPostAlgorithm_300);

        const old_page_for_userPostTrending_300_to_1000 = total_data_userPostTrending_300_to_1000 / limit;
        const abc1 = Math.ceil(old_page_for_userPostTrending_300_to_1000);

        const old_page_for_userPostTrending_more_than_1000 = total_data_userPostTrending_more_than_1000 / limit;
        const abc2 = Math.ceil(old_page_for_userPostTrending_more_than_1000);

        const xyz = abc + abc1;
        const xyz1 = abc + abc1 + abc2;

        var userPostTrending_300_to_1000 = [];
        var userPostTrending_more_than_1000 = [];
        var userPostTrending_others_data = [];

        if (resultPosts.length == 0) {
          var original_page1 = page - abc;
          var userPostTrending_300_to_700 = await post.aggregate([
            {
              $match: {
                interest_id: new mongoose.Types.ObjectId(selected_id),
                sub_interest_id: { $in: subInterestIds },
                $and: [
                  { user_id: { $nin: blockedUserIds } },
                  { user_id: { $nin: userWithPrivateAccountIds } }
                ],
                // user_id: { $nin: blockedUserIds },
                // user_id: { $nin: userWithPrivateAccountIds },
                is_deleted: false,
                is_block: false,
                is_local: false,
                is_repost: false,
                impression_count: { $gte: 300, $lte: 700 },
                _id: {
                  $nin: await view_post.distinct('post_id', { user_id: user_id })
                }
              }
            },
            {
              $lookup: {
                from: "user_impressions",
                localField: "sub_interest_id",
                foreignField: "sub_interest_id",
                as: "impressionsData"
              }
            },
            {
              $unwind: {
                path: "$impressionsData",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $group: {
                _id: "$_id",
                post: { $first: "$$ROOT" },
                count: { $sum: 1 }
              }
            },
            {
              $addFields: {
                percentage: {
                  $let: {
                    vars: {
                      percentageInfo: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: percentageData,
                              cond: { $eq: ["$$this.sub_interest_id", "$post.sub_interest_id"] }
                            }
                          },
                          0
                        ]
                      }
                    },
                    in: { $ifNull: ["$$percentageInfo.percentage", 0] }
                  }
                }
              }
            },
            {
              $replaceRoot: { newRoot: "$post" }
            },
            {
              $lookup: {
                from: "users",
                localField: "user_id",
                foreignField: "_id",
                as: "user"
              }
            },
            {
              $lookup: {
                from: "interests",
                localField: "interest_id",
                foreignField: "_id",
                as: "interest"
              }
            },
            {
              $lookup: {
                from: "sub_interests",
                localField: "sub_interest_id",
                foreignField: "_id",
                as: "subInterest"
              }
            },
            {
              $addFields: {
                user_id: { $arrayElemAt: ["$user", 0] },
                interest_id: { $arrayElemAt: ["$interest", 0] },
                sub_interest_id: { $arrayElemAt: ["$subInterest", 0] }
              }
            },
            {
              $project: {
                _id: 1,
                user_id: {
                  _id: 1,
                  full_name: 1,
                  profile_picture: 1,
                  unique_name: 1,
                  profile_url: 1,
                  is_verified: 1,
                  is_private_account: 1
                },
                interest_id: 1,
                sub_interest_id: 1,
                title: 1,
                description: 1,
                post_type: 1,
                link_url: 1,
                question: 1,
                store_option_id: 1,
                options: 1,
                location: 1,
                is_repost: 1,
                vote_counter: 1,
                repost_count: 1,
                view_count: 1,
                comment_count: 1,
                like_count: 1,
                is_local: 1,
                is_block: 1,
                is_deleted: 1,
                post_media: 1,
                createdAt: 1,
                updatedAt: 1,
                interaction_count: 1,
                impression_count: 1
              }
            },
            {
              $sort: { percentage: -1, view_count: -1, createdAt: -1 }
            },
            // {
            //   $skip: (original_page1 - 1) * parseInt(limit),
            // },
            // {
            //   $limit: parseInt(limit),
            // },
          ]);

          var userPostTrending_700_to_1000 = await post.aggregate([
            {
              $match: {
                interest_id: new mongoose.Types.ObjectId(selected_id),
                // sub_interest_id: { $in: subInterestIds },

                $and: [
                  { user_id: { $nin: blockedUserIds } },
                  { user_id: { $nin: userWithPrivateAccountIds } }
                ],
                // user_id: { $nin: blockedUserIds },
                // user_id: { $nin: userWithPrivateAccountIds },
                is_deleted: false,
                is_block: false,
                is_local: false,
                is_repost: false,
                impression_count: { $gte: 700, $lte: 1000 },
                _id: {
                  $nin: await view_post.distinct('post_id', { user_id: user_id })
                }
              }
            },
            {
              $lookup: {
                from: "user_impressions",
                localField: "sub_interest_id",
                foreignField: "sub_interest_id",
                as: "impressionsData"
              }
            },
            {
              $unwind: {
                path: "$impressionsData",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $group: {
                _id: "$_id",
                post: { $first: "$$ROOT" },
                count: { $sum: 1 }
              }
            },
            {
              $addFields: {
                percentage: {
                  $let: {
                    vars: {
                      percentageInfo: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: percentageData,
                              cond: { $eq: ["$$this.sub_interest_id", "$post.sub_interest_id"] }
                            }
                          },
                          0
                        ]
                      }
                    },
                    in: { $ifNull: ["$$percentageInfo.percentage", 0] }
                  }
                }
              }
            },
            {
              $replaceRoot: { newRoot: "$post" }
            },
            {
              $lookup: {
                from: "users",
                localField: "user_id",
                foreignField: "_id",
                as: "user"
              }
            },
            {
              $lookup: {
                from: "interests",
                localField: "interest_id",
                foreignField: "_id",
                as: "interest"
              }
            },
            {
              $lookup: {
                from: "sub_interests",
                localField: "sub_interest_id",
                foreignField: "_id",
                as: "subInterest"
              }
            },
            {
              $addFields: {
                user_id: { $arrayElemAt: ["$user", 0] },
                interest_id: { $arrayElemAt: ["$interest", 0] },
                sub_interest_id: { $arrayElemAt: ["$subInterest", 0] }
              }
            },
            {
              $project: {
                _id: 1,
                user_id: {
                  _id: 1,
                  full_name: 1,
                  profile_picture: 1,
                  unique_name: 1,
                  profile_url: 1,
                  is_verified: 1,
                  is_private_account: 1
                },
                interest_id: 1,
                sub_interest_id: 1,
                title: 1,
                description: 1,
                post_type: 1,
                link_url: 1,
                question: 1,
                store_option_id: 1,
                options: 1,
                location: 1,
                is_repost: 1,
                vote_counter: 1,
                repost_count: 1,
                view_count: 1,
                comment_count: 1,
                like_count: 1,
                is_local: 1,
                is_block: 1,
                is_deleted: 1,
                post_media: 1,
                createdAt: 1,
                updatedAt: 1,
                interaction_count: 1,
                impression_count: 1
              }
            },
            {
              $sort: { impression_count: -1, createdAt: -1 }
            },
            // {
            //   $skip: (original_page1 - 1) * parseInt(limit),
            // },
            // {
            //   $limit: parseInt(limit),
            // },
          ]);

          var post_data_1 = userPostTrending_300_to_700.concat(userPostTrending_700_to_1000);
          // const shuffledPostsdata = post_data_1.sort(() => Math.random() - 0.5);
          // const startIndexData = (original_page1 - 1) * parseInt(limit);
          // const endIndexData = parseInt(startIndexData) + parseInt(limit);
          // var userPostTrending_300_to_1000 = shuffledPostsdata.slice(startIndexData, endIndexData)

          if (original_page1 == 1) {
            console.log("------------")
            const shuffledPostsData = post_data_1.sort(() => Math.random() - 0.5);
            const startIndexData = (original_page1 - 1) * parseInt(limit);
            const endIndexData = parseInt(startIndexData) + parseInt(limit);
            var userPostTrending_300_to_1000 = shuffledPostsData.slice(startIndexData, endIndexData);
          } else {
            console.log("-----+++++++++++++-------")
            var withoutPaginatedPosts300_100 = post_data_1.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
            const startIndexData = (original_page1 - 1) * parseInt(limit);
            const endIndexData = parseInt(startIndexData) + parseInt(limit);
            var userPostTrending_300_to_1000_data = withoutPaginatedPosts300_100.slice(startIndexData, endIndexData);

            function shuffleArray(array) {
              for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
              }
              return array;
            }
            var userPostTrending_300_to_1000 = shuffleArray([...userPostTrending_300_to_1000_data]);
            // const startIndexData = (original_page1 - 1) * parseInt(limit);
            // const endIndexData = parseInt(startIndexData) + parseInt(limit);
            // var userPostTrending_300_to_1000 = post_data_1.slice(startIndexData, endIndexData)
          }

        }

        if (resultPosts.length == 0 && userPostTrending_300_to_1000.length == 0) {
          var original_page2 = page - xyz;
          var userPostTrending_more_than_1000 = await post.aggregate([
            {
              $match: {
                interest_id: new mongoose.Types.ObjectId(selected_id),
                // sub_interest_id: { $in: subInterestIds },
                $and: [
                  { user_id: { $nin: blockedUserIds } },
                  { user_id: { $nin: userWithPrivateAccountIds } }
                ],
                // user_id: { $nin: blockedUserIds },
                // user_id: { $nin: userWithPrivateAccountIds },
                is_deleted: false,
                is_block: false,
                is_local: false,
                is_repost: false,
                impression_count: { $gte: 1000 },
                _id: {
                  $nin: await view_post.distinct('post_id', { user_id: user_id })
                }
              }
            },
            {
              $addFields: {
                randomCondition: {
                  $cond: {
                    if: { $eq: [original_page2, 1] }, // Check if original_page2 is 1
                    then: true, // If true, apply sample
                    else: false // If false, skip sample
                  }
                }
              }
            },
            {
              $match: {
                randomCondition: true // Only apply sample if randomCondition is true
              }
            },
            {
              $sample: { size: 10 } // Specify the number of random documents you want to retrieve
            },
            {
              $lookup: {
                from: "user_impressions",
                localField: "sub_interest_id",
                foreignField: "sub_interest_id",
                as: "impressionsData"
              }
            },
            {
              $unwind: {
                path: "$impressionsData",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $group: {
                _id: "$_id",
                post: { $first: "$$ROOT" },
                count: { $sum: 1 }
              }
            },
            {
              $addFields: {
                percentage: {
                  $let: {
                    vars: {
                      percentageInfo: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: percentageData,
                              cond: { $eq: ["$$this.sub_interest_id", "$post.sub_interest_id"] }
                            }
                          },
                          0
                        ]
                      }
                    },
                    in: { $ifNull: ["$$percentageInfo.percentage", 0] }
                  }
                }
              }
            },
            {
              $replaceRoot: { newRoot: "$post" }
            },
            {
              $lookup: {
                from: "users",
                localField: "user_id",
                foreignField: "_id",
                as: "user"
              }
            },
            {
              $lookup: {
                from: "interests",
                localField: "interest_id",
                foreignField: "_id",
                as: "interest"
              }
            },
            {
              $lookup: {
                from: "sub_interests",
                localField: "sub_interest_id",
                foreignField: "_id",
                as: "subInterest"
              }
            },
            {
              $addFields: {
                user_id: { $arrayElemAt: ["$user", 0] },
                interest_id: { $arrayElemAt: ["$interest", 0] },
                sub_interest_id: { $arrayElemAt: ["$subInterest", 0] }
              }
            },
            {
              $project: {
                _id: 1,
                user_id: {
                  _id: 1,
                  full_name: 1,
                  profile_picture: 1,
                  unique_name: 1,
                  profile_url: 1,
                  is_verified: 1,
                  is_private_account: 1
                },
                interest_id: 1,
                sub_interest_id: 1,
                title: 1,
                description: 1,
                post_type: 1,
                link_url: 1,
                question: 1,
                store_option_id: 1,
                options: 1,
                location: 1,
                is_repost: 1,
                vote_counter: 1,
                repost_count: 1,
                view_count: 1,
                comment_count: 1,
                like_count: 1,
                is_local: 1,
                is_block: 1,
                is_deleted: 1,
                post_media: 1,
                createdAt: 1,
                updatedAt: 1,
                interaction_count: 1,
                impression_count: 1
              }
            },
            {
              $sort: { impression_count: -1, createdAt: -1 }
            },
            {
              $skip: (original_page2 - 1) * parseInt(limit),
            },
            {
              $limit: parseInt(limit),
            },
          ]);
        }

        const find_userPostTrending_300_to_1000 = await post.find({
          interest_id: new mongoose.Types.ObjectId(selected_id),
          sub_interest_id: { $in: subInterestIds },
          user_id: { $nin: blockedUserIds },
          user_id: { $nin: userWithPrivateAccountIds },
          is_deleted: false,
          is_block: false,
          is_local: false,
          is_repost: false,
          impression_count: { $gte: 300, $lte: 1000 }
        });

        if (find_userPostTrending_300_to_1000.length > 0) {
          find_userPostTrending_300_to_1000?.map((data) => {
            common_data_Array.push(data?._id);
          })
        }

        const find_userPostTrending_more_than_1000 = await post.find({
          interest_id: new mongoose.Types.ObjectId(selected_id),
          sub_interest_id: { $in: subInterestIds },
          user_id: { $nin: blockedUserIds },
          user_id: { $nin: userWithPrivateAccountIds },
          is_deleted: false,
          is_block: false,
          is_local: false,
          is_repost: false,
          impression_count: { $gte: 1000 }
        });

        if (find_userPostTrending_more_than_1000.length > 0) {
          find_userPostTrending_more_than_1000?.map((data) => {
            common_data_Array.push(data?._id);
          })
        }

        if (resultPosts.length == 0 && userPostTrending_300_to_1000.length == 0 && userPostTrending_more_than_1000.length == 0) {
          var original_page3 = page - xyz1;

          var userPostTrending_others_data = await post.aggregate([
            {
              $match: {
                user_id: { $nin: blockedUserIds },
                is_deleted: false,
                is_block: false,
                is_local: false,
                is_repost: false,
                interest_id: new mongoose.Types.ObjectId(selected_id),
                _id: {
                  $nin: [
                    ...await post.distinct('_id', { user_id: user_id }),
                    ...await view_post.distinct('post_id', { user_id: user_id })
                  ]
                },
              }
            },
            {
              $addFields: {
                randomCondition: {
                  $cond: {
                    if: { $eq: [original_page3, 1] }, // Check if original_page2 is 1
                    then: true, // If true, apply sample
                    else: false // If false, skip sample
                  }
                }
              }
            },
            {
              $match: {
                randomCondition: true // Only apply sample if randomCondition is true
              }
            },
            {
              $sample: { size: 10 } // Specify the number of random documents you want to retrieve
            },
            {
              $match: {
                _id: { $nin: common_data_Array }
              }
            },
            {
              $lookup: {
                from: "users",
                localField: "user_id",
                foreignField: "_id",
                as: "user"
              }
            },
            {
              $lookup: {
                from: "interests",
                localField: "interest_id",
                foreignField: "_id",
                as: "interest"
              }
            },
            {
              $lookup: {
                from: "sub_interests",
                localField: "sub_interest_id",
                foreignField: "_id",
                as: "subInterest"
              }
            },
            {
              $project: {
                _id: 1,
                user_id: { $arrayElemAt: ["$user", 0] },
                interest_id: { $arrayElemAt: ["$interest", 0] },
                sub_interest_id: { $arrayElemAt: ["$subInterest", 0] },
                title: 1,
                description: 1,
                post_type: 1,
                link_url: 1,
                question: 1,
                store_option_id: 1,
                options: 1,
                location: 1,
                is_repost: 1,
                vote_counter: 1,
                repost_count: 1,
                view_count: 1,
                comment_count: 1,
                like_count: 1,
                is_local: 1,
                is_block: 1,
                is_deleted: 1,
                post_media: 1,
                createdAt: 1,
                updatedAt: 1,
                interaction_count: 1,
                impression_count: 1
              }
            },
            {
              $project: {
                _id: 1,
                user_id: {
                  _id: "$user_id._id",
                  full_name: "$user_id.full_name",
                  profile_picture: "$user_id.profile_picture",
                  unique_name: "$user_id.unique_name",
                  profile_url: "$user_id.profile_url",
                  is_verified: "$user_id.is_verified",
                  is_private_account: "$user_id.is_private_account"
                },
                interest_id: 1,
                sub_interest_id: 1,
                title: 1,
                description: 1,
                post_type: 1,
                link_url: 1,
                question: 1,
                store_option_id: 1,
                options: 1,
                location: 1,
                is_repost: 1,
                vote_counter: 1,
                repost_count: 1,
                view_count: 1,
                comment_count: 1,
                like_count: 1,
                is_local: 1,
                is_block: 1,
                is_deleted: 1,
                post_media: 1,
                createdAt: 1,
                updatedAt: 1,
                interaction_count: 1,
                impression_count: 1
              }
            },
            {
              $sort: { view_count: -1, createdAt: -1 }
            },
            {
              $skip: (original_page3 - 1) * parseInt(limit),
            },
            {
              $limit: parseInt(limit),
            },
          ]);
        }

        if (resultPosts.length > 0) {
          const post_for_display = await processUserPosts(resultPosts, user_id);

          return multiSuccessRes(
            res,
            "Posts retrieved successfully",
            post_for_display,
            post_for_display.length
          );
        }

        if (userPostTrending_300_to_1000.length > 0) {
          const post_for_display = await processUserPostsAggree(userPostTrending_300_to_1000, user_id);

          return multiSuccessRes(
            res,
            "Posts retrieved successfully",
            post_for_display,
            post_for_display.length
          );
        }

        if (userPostTrending_more_than_1000.length > 0) {
          const post_for_display = await processUserPostsAggree(userPostTrending_more_than_1000, user_id);

          return multiSuccessRes(
            res,
            "Posts retrieved successfully",
            post_for_display,
            post_for_display.length
          );
        }

        if (userPostTrending_others_data.length > 0) {

          const post_for_display = await processUserPostsAggree(userPostTrending_others_data, user_id);

          return multiSuccessRes(
            res,
            "Posts retrieved successfully",
            post_for_display,
            post_for_display.length
          );
        } else {
          return multiSuccessRes(
            res,
            "Posts retrieved successfully",
            [],
            0
          );
        }
      } else {
        var userPosts = await post.aggregate([
          {
            $match: {
              user_id: { $nin: blockedUserIds },
              is_deleted: false,
              is_block: false,
              is_local: false,
              is_repost: false,
              interest_id: new mongoose.Types.ObjectId(selected_id),
              _id: {
                $nin: await view_post.distinct('post_id', { user_id: user_id })
              },
              view_count: { $gte: 1 }
            }
          },
          {
            $lookup: {
              from: "users",
              localField: "user_id",
              foreignField: "_id",
              as: "user"
            }
          },
          {
            $lookup: {
              from: "interests",
              localField: "interest_id",
              foreignField: "_id",
              as: "interest"
            }
          },
          {
            $lookup: {
              from: "sub_interests",
              localField: "sub_interest_id",
              foreignField: "_id",
              as: "subInterest"
            }
          },
          {
            $project: {
              _id: 1,
              user_id: { $arrayElemAt: ["$user", 0] },
              interest_id: { $arrayElemAt: ["$interest", 0] },
              sub_interest_id: { $arrayElemAt: ["$subInterest", 0] },
              title: 1,
              description: 1,
              post_type: 1,
              link_url: 1,
              question: 1,
              store_option_id: 1,
              options: 1,
              location: 1,
              is_repost: 1,
              vote_counter: 1,
              repost_count: 1,
              view_count: 1,
              comment_count: 1,
              like_count: 1,
              is_local: 1,
              is_block: 1,
              is_deleted: 1,
              post_media: 1,
              createdAt: 1,
              updatedAt: 1,
              interaction_count: 1,
              impression_count: 1
            }
          },
          {
            $project: {
              _id: 1,
              user_id: {
                _id: "$user_id._id",
                full_name: "$user_id.full_name",
                profile_picture: "$user_id.profile_picture",
                unique_name: "$user_id.unique_name",
                profile_url: "$user_id.profile_url",
                is_verified: "$user_id.is_verified",
                is_private_account: "$user_id.is_private_account"
              },
              interest_id: 1,
              sub_interest_id: 1,
              title: 1,
              description: 1,
              post_type: 1,
              link_url: 1,
              question: 1,
              store_option_id: 1,
              options: 1,
              location: 1,
              is_repost: 1,
              vote_counter: 1,
              repost_count: 1,
              view_count: 1,
              comment_count: 1,
              like_count: 1,
              is_local: 1,
              is_block: 1,
              is_deleted: 1,
              post_media: 1,
              createdAt: 1,
              updatedAt: 1,
              interaction_count: 1,
              impression_count: 1
            }
          },
          {
            $sort: { view_count: -1, createdAt: -1 }
          },
          {
            $skip: (page - 1) * parseInt(limit),
          },
          {
            $limit: parseInt(limit),
          },
        ]);

        const post_for_display = await processUserPostsAggree(userPosts, user_id);

        return multiSuccessRes(
          res,
          "Posts retrieved successfully",
          post_for_display,
          post_for_display.length
        );
      }
    }
  } catch (error) {
    console.log("Error:", error);
    return errorRes(res, "Internal server error");
  }
};


const getHomeInterests = async (req, res) => {
  try {

    var { language } = req.body;
    // var find_interest = await interest
    //   .find({
    //     is_deleted: false,
    //   })
    //   .select("interest color_code")
    //   .sort({ createdAt: 1 });


    var pipeline = [];
    if (language) {
      pipeline.push(
        {
          $match: { is_deleted: false, is_block: false }
        },
        {
          $project: {
            _id: 1,
            interest: `$${language}`,
            color_code: 1
          }
        }
      );
    } else {
      pipeline.push(
        {
          $match: { is_deleted: false, is_block: false }
        },
        {
          $project: {
            _id: 1,
            interest: 1,
            color_code: 1
          }
        }
      );
    }
    pipeline.push(
      {
        $sort: { createdAt: 1 }
      }
    );
    var find_interest = await interest.aggregate(pipeline);


    return successRes(res, `Interests get successfully`, find_interest);
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const getAllPostsBySubInterest = async (req, res) => {
  try {
    // if (!req.body.user_id) {
    //   var user_id = req.user._id;
    // } else {
    //   var user_id = req.body.user_id;
    // }
    let user_id;
    if (!req.body.user_id) {
      user_id = req.user._id;
    } else {
      user_id = req.body.user_id;
    }
    var { page = 1, limit = 10, selected_id, language } = req.body;

    const userPrivate = await users.find({
      is_private_account: true,
      is_deleted: false,
    });
    const userBlockedByOthers = await block_user.find({
      user_id: user_id,
      is_deleted: false,
    });
    const usersBlockingCurrentUser = await block_user.find({
      block_user_id: user_id,
      is_deleted: false,
    });

    const userPrivateIds = userPrivate.map((block) => block._id);
    const userBlockedByOthersIds = userBlockedByOthers.map(
      (block) => block.block_user_id
    );
    const usersBlockingCurrentUserIds = usersBlockingCurrentUser.map(
      (block) => block.user_id
    );

    const blockedUserIds = [
      ...userBlockedByOthersIds,
      ...usersBlockingCurrentUserIds,
      ...userPrivateIds,
    ];

    const queryObject = {};

    if (selected_id) {
      queryObject.sub_interest_id = selected_id;

      var following_data = await follower_following.find().where({
        user_id: user_id,
        is_deleted: false,
        is_request: true,
      });

      const following_user_Ids = following_data.map(
        (data) => data.following_id
      );

      const userPostsPrivateFalse = await post
        .find({
          $and: [
            {
              $or: [
                { sub_interest_id: { $in: queryObject.sub_interest_id } },
              ],
            },
            {
              _id: {
                $nin: [
                  ...await post.distinct('_id', { user_id: user_id }),
                  ...await view_post.distinct('post_id', { user_id: user_id })
                ]
              }
            },
            {
              $or: [
                { user_id: { $nin: blockedUserIds } },
                { user_id: { $in: following_user_Ids } },
              ],
            },
            { is_deleted: false, is_local: false, is_repost: false },
          ],
        })
        .populate({
          path: "user_id",
          select:
            "unique_name full_name post_type profile_url profile_picture full_name",
        })
        .populate("interest_id sub_interest_id")
        .populate({
          path: "repost_id",
          populate: {
            path: "user_id",
            select:
              "unique_name full_name post_type profile_url profile_picture full_name",
          },
        })
        .sort({ createdAt: "desc" });

      const userPostsPrivateTrue = await post
        .find({
          $or: [
            { sub_interest_id: queryObject.sub_interest_id },
          ],
          _id: {
            $nin: [
              ...await post.distinct('_id', { user_id: user_id }),
              ...await view_post.distinct('post_id', { user_id: user_id })
            ]
          },
          user_id: { $nin: blockedUserIds },
          is_deleted: false,
          is_local: false,
          is_repost: false
        })
        .populate({
          path: "user_id",
          select:
            "unique_name full_name post_type profile_url profile_picture full_name",
        })
        .populate("interest_id sub_interest_id")
        .populate({
          path: "repost_id",
          populate: {
            path: "user_id",
            select:
              "unique_name full_name post_type profile_url profile_picture full_name",
          },
        })
        .sort({ createdAt: "desc" });

      const filteredPosts = userPostsPrivateTrue.filter(
        (post) =>
          post.user_id.is_private_account === false &&
          (!post.repost_id ||
            !post.repost_id.user_id ||
            post.repost_id.user_id.is_private_account === false)
      );
      var userPosts = filteredPosts.concat(userPostsPrivateFalse);

      var userPosts = [
        ...filteredPosts,
        ...userPostsPrivateFalse.filter(
          (post) =>
            !filteredPosts.some((filteredPost) =>
              filteredPost._id.equals(post._id)
            )
        ),
      ];
      // var withoutPaginatedPosts = userPosts.sort((a, b) => (a.view_count > b.view_count ? -1 : 1));
      var userPostsCount = userPosts.length;
      // const startIndex = (page - 1) * parseInt(limit);
      // const endIndex = parseInt(startIndex) + parseInt(limit);
      // var paginatedPosts = withoutPaginatedPosts.slice(startIndex, endIndex)

      var paginatedPosts = [];
      if (page == 1) {
        console.log("------------")
        const withoutPaginatedPosts = userPosts.sort(() => Math.random() - 0.5);

        const startIndex = (page - 1) * parseInt(limit);
        const endIndex = parseInt(startIndex) + parseInt(limit);
        var paginatedPosts = withoutPaginatedPosts.slice(startIndex, endIndex);
      } else {
        console.log("-----+++++++++++++-------")
        var withoutPaginatedPosts = userPosts.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
        // If original_page1 is not 1, don't shuffle, just slice the array directly
        const startIndex = (page - 1) * parseInt(limit);
        const endIndex = parseInt(startIndex) + parseInt(limit);
        var paginatedPosts_data = withoutPaginatedPosts.slice(startIndex, endIndex);

        function shuffleArray(array) {
          for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
          }
          return array;
        }
        var paginatedPosts = shuffleArray([...paginatedPosts_data]);
      }

      if (userPostsCount === 0) {
        var userPosts = await post.aggregate([
          {
            $match: {
              user_id: { $nin: blockedUserIds },
              is_deleted: false,
              is_block: false,
              is_local: false,
              is_repost: false,
              sub_interest_id: new mongoose.Types.ObjectId(queryObject?.sub_interest_id),
              _id: {
                $nin: [...await post.distinct('_id', { user_id: user_id })]
              },
              view_count: { $gte: 1 }
            }
          },
          {
            $addFields: {
              randomCondition: {
                $cond: {
                  if: { $eq: [page, 1] }, // Check if original_page2 is 1
                  then: true, // If true, apply sample
                  else: false // If false, skip sample
                }
              }
            }
          },
          {
            $match: {
              randomCondition: true // Only apply sample if randomCondition is true
            }
          },
          {
            $sample: { size: 10 } // Specify the number of random documents you want to retrieve
          },
          {
            $lookup: {
              from: "users",
              localField: "user_id",
              foreignField: "_id",
              as: "user"
            }
          },
          {
            $lookup: {
              from: "interests",
              localField: "interest_id",
              foreignField: "_id",
              as: "interest"
            }
          },
          {
            $lookup: {
              from: "sub_interests",
              localField: "sub_interest_id",
              foreignField: "_id",
              as: "subInterest"
            }
          },
          {
            $project: {
              _id: 1,
              user_id: { $arrayElemAt: ["$user", 0] },
              interest_id: { $arrayElemAt: ["$interest", 0] },
              sub_interest_id: { $arrayElemAt: ["$subInterest", 0] },
              title: 1,
              description: 1,
              post_type: 1,
              link_url: 1,
              question: 1,
              store_option_id: 1,
              options: 1,
              location: 1,
              is_repost: 1,
              vote_counter: 1,
              repost_count: 1,
              view_count: 1,
              comment_count: 1,
              like_count: 1,
              is_local: 1,
              is_block: 1,
              is_deleted: 1,
              post_media: 1,
              createdAt: 1,
              updatedAt: 1,
              interaction_count: 1,
              impression_count: 1
            }
          },
          {
            $project: {
              _id: 1,
              user_id: {
                _id: "$user_id._id",
                full_name: "$user_id.full_name",
                profile_picture: "$user_id.profile_picture",
                unique_name: "$user_id.unique_name",
                profile_url: "$user_id.profile_url",
                is_verified: "$user_id.is_verified",
                is_private_account: "$user_id.is_private_account"
              },
              interest_id: 1,
              sub_interest_id: 1,
              title: 1,
              description: 1,
              post_type: 1,
              link_url: 1,
              question: 1,
              store_option_id: 1,
              options: 1,
              location: 1,
              is_repost: 1,
              vote_counter: 1,
              repost_count: 1,
              view_count: 1,
              comment_count: 1,
              like_count: 1,
              is_local: 1,
              is_block: 1,
              is_deleted: 1,
              post_media: 1,
              createdAt: 1,
              updatedAt: 1,
              interaction_count: 1,
              impression_count: 1
            }
          },
          {
            $sort: { createdAt: -1, view_count: -1 }
          },
          {
            $skip: (page - 1) * parseInt(limit),
          },
          {
            $limit: parseInt(limit),
          },
        ]);

        userPosts = await Promise.all(
          userPosts.map(async (data) => {
            const isLiked = await like_post.findOne({
              user_id: user_id,
              post_id: data._id,
            });
            const isSaved = await save_post.findOne({
              user_id: user_id,
              post_id: data._id,
            });
            const isPolled = await pollvotes.findOne({
              user_id: user_id,
              post_id: data._id,
            });
            var store_option_id = isPolled?.option_id;

            const is_repost_you_status = await post.findOne({
              user_id: user_id,
              repost_id: data._id,
              is_deleted: false,
              is_repost: true
            })

            if (language === "hindi") {
              data.interest_id.interest = data.interest_id.hindi;
              data.sub_interest_id.sub_interest = data.sub_interest_id.hindi;
            } else if (language === "kannada") {
              data.interest_id.interest = data.interest_id.kannada;
              data.sub_interest_id.sub_interest = data.sub_interest_id.kannada;
            } else if (language === "telugu") {
              data.interest_id.interest = data.interest_id.telugu;
              data.sub_interest_id.sub_interest = data.sub_interest_id.telugu;
            }
            else if (language === "malayalam") {
              data.interest_id.interest = data.interest_id.malayalam;
              data.sub_interest_id.sub_interest = data.sub_interest_id.malayalam;
            }
            else if (language === "tamil") {
              data.interest_id.interest = data.interest_id.tamil;
              data.sub_interest_id.sub_interest = data.sub_interest_id.tamil;
            }
            const updatedPost = {
              ...data,
              is_like: !!isLiked,
              is_save: !!isSaved,
              is_poll_response: !!isPolled,
              store_option_id: store_option_id,
              is_repost_you: !!is_repost_you_status
            };

            if (post.is_repost && post.repost_id) {
              const repostIsLiked = await like_post.findOne({
                user_id: user_id,
                post_id: data.repost_id._id,
              });
              const repostIsSaved = await save_post.findOne({
                user_id: user_id,
                post_id: data.repost_id._id,
              });
              const repostIsPolled = await pollvotes.findOne({
                user_id: user_id,
                post_id: data.repost_id._id,
              });

              var store_option_id = repostIsPolled?.option_id;
              updatedPost.repost_id = {
                ...data.repost_id,
                is_like: !!repostIsLiked,
                is_save: !!repostIsSaved,
                is_poll_response: !!repostIsPolled,
                store_option_id: store_option_id,
              };
            }

            return updatedPost;
          })
        );

        userPosts.forEach(async (post) => {
          if (post?.user_id?.profile_picture) {
            post.user_id.profile_picture =
              process.env.BASE_URL + post.user_id.profile_picture;
          }

          if (post?.repost_id?.user_id?.profile_picture) {
            post.repost_id.user_id.profile_picture =
              process.env.BASE_URL + post.repost_id.user_id.profile_picture;
          }
          post.post_media.forEach((media) => {
            if (media.file_type === "image" || media.file_type === "video") {
              media.file_name = process.env.BASE_URL + media.file_name;
              if (media.thumb_name) {
                media.thumb_name = process.env.BASE_URL + media.thumb_name;
              }
            }
          });

          post?.repost_id?.post_media.forEach((media) => {
            if (media.file_type === "image" || media.file_type === "video") {
              media.file_name = process.env.BASE_URL + media.file_name;
              if (media.thumb_name) {
                media.thumb_name = process.env.BASE_URL + media.thumb_name;
              }
            }
          });
        });

        var userPostsCount = userPosts.length;
        return multiSuccessRes(
          res,
          "Posts retrieved successfully",
          userPosts,
          userPostsCount
        );

      }

      if (!paginatedPosts || paginatedPosts.length === 0) {
        return successRes(res, "No posts found for this user", []);
      }

      paginatedPosts = await Promise.all(
        paginatedPosts.map(async (data) => {
          const isLiked = await like_post.findOne({
            user_id: user_id,
            post_id: data._id,
          });
          const isSaved = await save_post.findOne({
            user_id: user_id,
            post_id: data._id,
          });
          const isPolled = await pollvotes.findOne({
            user_id: user_id,
            post_id: data._id,
          });
          var store_option_id = isPolled?.option_id;

          const is_repost_you_status = await post.findOne({
            user_id: user_id,
            repost_id: data._id,
            is_deleted: false,
            is_repost: true
          })
          if (language === "hindi") {
            data.interest_id.interest = data.interest_id.hindi;
            data.sub_interest_id.sub_interest = data.sub_interest_id.hindi;
          } else if (language === "kannada") {
            data.interest_id.interest = data.interest_id.kannada;
            data.sub_interest_id.sub_interest = data.sub_interest_id.kannada;
          } else if (language === "telugu") {
            data.interest_id.interest = data.interest_id.telugu;
            data.sub_interest_id.sub_interest = data.sub_interest_id.telugu;
          }
          else if (language === "malayalam") {
            data.interest_id.interest = data.interest_id.malayalam;
            data.sub_interest_id.sub_interest = data.sub_interest_id.malayalam;
          }
          else if (language === "tamil") {
            data.interest_id.interest = data.interest_id.tamil;
            data.sub_interest_id.sub_interest = data.sub_interest_id.tamil;
          }
          const updatedPost = {
            ...data.toObject(),
            is_like: !!isLiked,
            is_save: !!isSaved,
            is_poll_response: !!isPolled,
            store_option_id: store_option_id,
            is_repost_you: !!is_repost_you_status
          };

          if (post.is_repost && post.repost_id) {
            const repostIsLiked = await like_post.findOne({
              user_id: user_id,
              post_id: data.repost_id._id,
            });
            const repostIsSaved = await save_post.findOne({
              user_id: user_id,
              post_id: data.repost_id._id,
            });
            const repostIsPolled = await pollvotes.findOne({
              user_id: user_id,
              post_id: data.repost_id._id,
            });

            var store_option_id = repostIsPolled?.option_id;
            updatedPost.repost_id = {
              ...data.repost_id.toObject(),
              is_like: !!repostIsLiked,
              is_save: !!repostIsSaved,
              is_poll_response: !!repostIsPolled,
              store_option_id: store_option_id,
            };
          }
          return updatedPost;
        })
      );

      paginatedPosts.forEach(async (post) => {
        if (post?.user_id?.profile_picture) {
          post.user_id.profile_picture =
            process.env.BASE_URL + post.user_id.profile_picture;
        }

        if (post?.repost_id?.user_id?.profile_picture) {
          post.repost_id.user_id.profile_picture =
            process.env.BASE_URL + post.repost_id.user_id.profile_picture;
        }
        post.post_media.forEach((media) => {
          if (media.file_type === "image" || media.file_type === "video") {
            media.file_name = process.env.BASE_URL + media.file_name;
            if (media.thumb_name) {
              media.thumb_name = process.env.BASE_URL + media.thumb_name;
            }
          }
        });

        post?.repost_id?.post_media.forEach((media) => {
          if (media.file_type === "image" || media.file_type === "video") {
            media.file_name = process.env.BASE_URL + media.file_name;
            if (media.thumb_name) {
              media.thumb_name = process.env.BASE_URL + media.thumb_name;
            }
          }
        });
      });

      return multiSuccessRes(
        res,
        "Posts retrieved successfully",
        paginatedPosts,
        userPostsCount
      );
    }
  } catch (error) {
    console.log("Error:", error);
    return errorRes(res, "Internal server error");
  }
};

module.exports = {
  getAllPosts,
  getHomeInterests,
  getAllPostsBySubInterest,
};
