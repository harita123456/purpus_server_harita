const {
  successRes,
  errorRes,
  multiSuccessRes,
} = require("../../../../utils/common_fun");
const fs = require("fs");
const path = require("path");
const { unlink } = require("fs");

const util = require("util");
const outputPath = path.join(__dirname, "../../../../");
const { dateTime } = require("../../../../utils/date_time");
const post = require("../../../../models/M_post");
const users = require("../../../../models/M_user");
const interest = require("../../../../models/M_interest");
const subinterest = require("../../../../models/M_sub_interest");
const pollvotes = require("../../../../models/M_poll_votes");
const postReport = require("../../../../models/M_post_report");
const save_post = require("../../../../models/M_save_post");
const like_post = require("../../../../models/M_like_post");
const like_comment = require("../../../../models/M_like_comment");
const comment_post = require("../../../../models/M_comment_post");
const block_user = require("../../../../models/M_block_user");
const view_post = require("../../../../models/M_post_view");
const comment_report = require("../../../../models/M_comment_report");
const notifications = require("../../../../models/M_notification");
const user_session = require("../../../../models/M_user_session");
const user_interactions = require("../../../../models/M_user_interactions");
const user_impressions = require("../../../../models/M_user_impression");

const {
  notiSendMultipleDevice,
} = require("../../../../utils/notification_send");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffprobePath = require("@ffprobe-installer/ffprobe").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const createPost = async (req, res) => {
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
    var {
      repost_id,
      interest_id,
      sub_interest_id,
      title,
      description,
      post_type,
      is_local,
      location,
      link_url,
      question,
      options,
    } = req.body;

    var { post_media } = req.files;

    let find_user = await users.findOne().where({
      _id: user_id,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, "This user not exists");
    }
    if (repost_id) {
      let find_repost = await post.findOne().where({
        _id: repost_id,
        is_deleted: false,
        is_local: false,
      });

      if (!find_repost) {
        return errorRes(res, "This repost not exists");
      }
    }

    if (interest_id) {
      let find_interest = await interest
        .findById(interest_id)
        .where({ is_deleted: false });
      if (!find_interest) {
        return errorRes(res, "This interest not exists");
      }
    }

    if (sub_interest_id) {
      let find_sub_interest = await subinterest
        .findById(sub_interest_id)
        .where({ is_deleted: false });
      if (!find_sub_interest) {
        return errorRes(res, "This subinterest not exists");
      }
    }

    var insert_data = {
      user_id,
      repost_id,
      interest_id,
      sub_interest_id,
      title,
      is_local,
      description,
      link_url,
      question,
      options,
    };

    if (location) {
      location = JSON.parse(location);

      if (location) {
        insert_data = {
          ...insert_data,
          location: location,
        }
      }
    }

    if (interest_id === process.env.OFF_TOPIC_ID) {
      insert_data =
      {
        ...insert_data,
        sub_interest_id: process.env.SUB_OFF_TOPIC_ID
      }
    }
    if (post_type == "text") {
      insert_data = {
        ...insert_data,
        post_type,
      };
    }

    if (post_type == "link") {
      insert_data = {
        ...insert_data,
        post_type,
      };
    }
    if (post_type == "media") {
      var check_media = util.isArray(post_media);

      insert_data = {
        ...insert_data,
        post_type,
      };

      // if (check_media == false) {
      //   var postmedia_array = [];
      //   postmedia_array.push(post_media);
      // } else {
      //   var postmedia_array = post_media;
      // }
      let postmedia_array;
      if (check_media == false) {
        postmedia_array = [];
        postmedia_array.push(post_media);
      } else {
        postmedia_array = post_media;
      }


      if (postmedia_array) {
        var multiplepost_media_array = [];
        for (var value of postmedia_array) {
          let file_extension = value.originalFilename
            .split(".")
            .pop()
            .toLowerCase();

          var file_name_gen =
            Math.floor(1000 + Math.random() * 9000) +
            "_" +
            Date.now() +
            "." +
            file_extension;

          if (
            file_extension == "mp4" ||
            file_extension == "mov" ||
            file_extension == "wmv" ||
            file_extension == "avi" ||
            file_extension == "avchd" ||
            file_extension == "mkv" ||
            file_extension == "m4a"
          ) {
            let thumbnail_path = file_name_gen.replace(/\.[^/.]+$/, ".jpeg");

            let file_data = {
              file_type: "video",
              file_name: `post_media/${file_name_gen}`,
              thumb_name: `post_media/${thumbnail_path}`,
            };
            let old_path = value.path;
            let new_path = "public/post_media/" + file_name_gen;
            let new_path_thumb = "public/post_media/" + thumbnail_path;

            await fs.promises.copyFile(old_path, new_path);

            ffmpeg(new_path)
              .screenshots({
                timestamps: ["50%"],
                filename: file_name_gen.replace(/\.[^/.]+$/, ".jpeg"),
                folder: "public/post_media",
              })
              .on("end", function () {
                console.log("Screenshots taken");
              })
              .on("error", function (err) {
                console.error("Error generating thumbnail: ", err);
              });

            await fs.readFile(old_path, function (err, data) {
              if (err) throw err;
              fs.writeFile(new_path, data, function (err) {
                if (err) throw err;
              });
              fs.writeFile(new_path_thumb, data, function (err) {
                if (err) throw err;
              });
            });

            multiplepost_media_array.push(file_data);
          }

          insert_data = {
            ...insert_data,
            post_media: multiplepost_media_array,
          };

          if (
            file_extension == "jpeg" ||
            file_extension == "jpg" ||
            file_extension == "png" ||
            file_extension == "raw" ||
            file_extension == "mpeg" ||
            file_extension == "jfif"
          ) {
            let file_data = {
              file_type: "image",
              file_name: `post_media/${file_name_gen}`,
            };
            let old_path = value.path;
            let new_path = "public/post_media/" + file_name_gen;
            await fs.readFile(old_path, function (err, data) {
              if (err) throw err;
              fs.writeFile(new_path, data, function (err) {
                if (err) throw err;
              });
            });

            multiplepost_media_array.push(file_data);
          }
          insert_data = {
            ...insert_data,
            post_media: multiplepost_media_array,
          };
        }
      }
    }
    if (options) {
      options = JSON.parse(options);
    }
    if (post_type == "poll") {
      insert_data = {
        ...insert_data,
        post_type,
        question,
        options: options,
      };
    }

    let create_post = await post.create(insert_data);

    await user_interactions.create({
      user_id: user_id,
      interest_id: interest_id,
      sub_interest_id: sub_interest_id,
      post_id: create_post._id,
      interaction_type: "post",
    })

    await post.findByIdAndUpdate(create_post._id, {
      $inc: { interaction_count: 1 },
    });

    create_post?.post_media.map((value) => {
      if (value?.file_type == "image") {
        value.file_name = process.env.BASE_URL + value.file_name;
      }
      if (value?.file_type == "video") {
        value.file_name = process.env.BASE_URL + value.file_name;
        value.thumb_name = process.env.BASE_URL + value.thumb_name;
      }
    });

    return successRes(res, "Post created successfully ", create_post);
  } catch (error) {
    console.log("Error : ", error);
    return
  }
};

const editPost = async (req, res) => {
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
    var {
      post_id,
      interest_id,
      sub_interest_id,
      title,
      description,
      post_type,
      location,
      link_url,
      question,
      delete_post_image_ids,
    } = req.body;
    var { post_media } = req.files;

    let find_user = await users.findOne().where({
      _id: user_id,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, "This user not exists");
    }
    if (post_id) {
      let find_post_id = await post.findOne().where({
        _id: post_id,
        is_deleted: false,
      });
      if (!find_post_id) {
        return errorRes(res, "This post not exists");
      }
    }
    if (interest_id) {
      let find_interest = await interest
        .findById(interest_id)
        .where({ is_deleted: false });
      if (!find_interest) {
        return errorRes(res, "This interest not exists");
      }
    }

    if (sub_interest_id) {
      let find_sub_interest = await subinterest
        .findById(sub_interest_id)
        .where({ is_deleted: false });
      if (!find_sub_interest) {
        return errorRes(res, "This subinterest not exists");
      }
    }
    if (delete_post_image_ids) {
      delete_post_image_ids = JSON.parse(delete_post_image_ids);
      for (var value1 of delete_post_image_ids) {
        var find_image = await post.findOne({
          _id: post_id,
          "post_media._id": value1,
        });

        if (find_image) {
          for (var value of find_image.post_media) {
            if (value._id == value1) {
              unlink(`${outputPath}/public/${value.file_name}`, (err) => {
                if (err) console.log(err);
              });
            }
          }
          await post.updateOne(
            { _id: post_id },
            { $pull: { post_media: { _id: value1 } } }
          );
        }
      }
    }

    var update_data = {
      user_id,
      interest_id,
      sub_interest_id,
      title,
      description,
      link_url,
      question,
    };

    if (location) {
      location = JSON.parse(location);

      if (location) {
        update_data = {
          ...update_data,
          location: location,
        }
      }
    }

    if (post_type == "text") {
      update_data = {
        ...update_data,
        post_type: post_type,
      };
    }
    if (post_type == "link") {
      update_data = {
        ...update_data,
        post_type: post_type,
      };
    }

    if (post_type == "media") {
      var check_media = util.isArray(post_media);

      // if (check_media == false) {
      //   var postmedia_array = [];
      //   postmedia_array.push(post_media);
      // } else {
      //   var postmedia_array = post_media;
      // }
      let postmedia_array;
      if (check_media == false) {
        postmedia_array = [];
        postmedia_array.push(post_media);
      } else {
        postmedia_array = post_media;
      }

      if (postmedia_array[0] != undefined) {
        var multiplepost_media_array = [];
        for (var value of postmedia_array) {
          let file_extension = value.originalFilename
            .split(".")
            .pop()
            .toLowerCase();
          var file_name_gen =
            Math.floor(1000 + Math.random() * 9000) +
            "_" +
            Date.now() +
            "." +
            file_extension;

          if (
            file_extension == "mp4" ||
            file_extension == "mov" ||
            file_extension == "wmv" ||
            file_extension == "avi" ||
            file_extension == "avchd" ||
            file_extension == "mkv" ||
            file_extension == "m4a"
          ) {
            let thumbnail_path = file_name_gen.replace(/\.[^/.]+$/, ".jpeg");

            let file_data = {
              file_type: "video",
              file_name: `post_media/${file_name_gen}`,
              thumb_name: `post_media/${thumbnail_path}`,
            };
            let old_path = value.path;
            let new_path = "public/post_media/" + file_name_gen;
            let new_path_thumb = "public/post_media/" + thumbnail_path;

            await fs.promises.copyFile(old_path, new_path);

            ffmpeg(new_path)
              .screenshots({
                timestamps: ["50%"],
                filename: file_name_gen.replace(/\.[^/.]+$/, ".jpeg"),
                folder: "public/post_media",
              })
              .on("end", function () {
                console.log("Screenshots taken");
              })
              .on("error", function (err) {
                console.error("Error generating thumbnail: ", err);
              });

            await fs.readFile(old_path, function (err, data) {
              if (err) throw err;
              fs.writeFile(new_path, data, function (err) {
                if (err) throw err;
              });
              fs.writeFile(new_path_thumb, data, function (err) {
                if (err) throw err;
              });
            });

            await post.findByIdAndUpdate(
              { _id: post_id },
              { $push: { post_media: file_data } },
              { new: true }
            );
          }

          if (
            file_extension == "jpeg" ||
            file_extension == "jpg" ||
            file_extension == "png" ||
            file_extension == "raw" ||
            file_extension == "mpeg" ||
            file_extension == "jfif"
          ) {
            let file_data = {
              file_type: "image",
              file_name: `post_media/${file_name_gen}`,
            };
            let old_path = value.path;
            let new_path = "public/post_media/" + file_name_gen;
            await fs.readFile(old_path, function (err, data) {
              if (err) throw err;
              fs.writeFile(new_path, data, function (err) {
                if (err) throw err;
              });
            });

            await post.findByIdAndUpdate(
              { _id: post_id },
              { $push: { post_media: file_data } },
              { new: true }
            );
          }
        }
      }
    }

    let updated_post = await post.findByIdAndUpdate(post_id, update_data, {
      new: true,
    });

    updated_post?.post_media.map((value) => {
      if (value?.file_type == "image") {
        value.file_name = process.env.BASE_URL + value.file_name;
      }
      if (value?.file_type == "video") {
        value.file_name = process.env.BASE_URL + value.file_name;
        value.thumb_name = process.env.BASE_URL + value.thumb_name;
      }
    });

    if (updated_post) {
      return successRes(res, "Post updated successfully ", updated_post);
    }
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const removepostImage = async (req, res) => {
  try {
    var { post_id, post_media_id, file_name } = req.body;

    await post.updateOne(
      { _id: post_id },
      { $pull: { post_media: { _id: post_media_id } } }
    );

    unlink(`${outputPath}/public/${file_name}`, (err) => {
      if (err) console.log(err);
    });

    return successRes(res, `media image deleted successfully`, []);
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

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
    var { page = 1, limit = 10 } = req.body;

    const blockedUsers = await block_user.find({
      $or: [
        {
          user_id: user_id,
          is_deleted: false,
        },
        {
          block_user_id: user_id,
          is_deleted: false,
        },
      ],
    });

    var blockedUserIds = [];

    if (blockedUsers) {
      blockedUsers.map((block) => {
        if (block.block_user_id == user_id) {
          blockedUserIds.push(block.block_user_id);
        }

        if (block.user_id == user_id) {
          blockedUserIds.push(block.block_user_id);
        }
      });
    }

    var find_user = await users.findOne().where({
      _id: user_id,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, "This user does not exist");
    }
    var userPosts = await post
      .find({
        is_deleted: false,
        is_block: false,
        is_local: false,
        user_id: { $eq: user_id, $nin: blockedUserIds },
      })
      .populate({
        path: "user_id",
        select:
          "unique_name full_name post_type profile_url profile_picture full_name",
      })
      .populate("interest_id sub_interest_id")
      .sort({ createdAt: "desc" })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    var userPostsCount = await post.countDocuments({
      user_id: { $eq: user_id, $nin: blockedUserIds },
      is_block: false,
      is_local: false,
      is_deleted: false,
    });

    if (!userPosts || userPosts.length === 0) {
      return successRes(res, "No posts found for this user", []);
    }

    userPosts = await Promise.all(
      userPosts.map(async (post) => {
        const isLiked = await like_post.findOne({
          user_id: user_id,
          post_id: post._id,
        });
        const isSaved = await save_post.findOne({
          user_id: user_id,
          post_id: post._id,
        });
        const isPolled = await pollvotes.findOne({
          user_id: user_id,
          post_id: post._id,
        });
        var store_option_id = isPolled?.option_id;

        const updatedPost = {
          ...post.toObject(),
          is_like: !!isLiked,
          is_save: !!isSaved,
          is_poll_response: !!isPolled,
          store_option_id: store_option_id,
        };

        if (post.is_repost && post.repost_id) {
          const repostIsLiked = await like_post.findOne({
            user_id: user_id,
            post_id: post.repost_id._id,
          });
          const repostIsSaved = await save_post.findOne({
            user_id: user_id,
            post_id: post.repost_id._id,
          });
          const repostIsPolled = await pollvotes.findOne({
            user_id: user_id,
            post_id: post.repost_id._id,
          });

          var store_option_id = repostIsPolled?.option_id;
          updatedPost.repost_id = {
            ...post.repost_id.toObject(),
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

    return multiSuccessRes(
      res,
      "Posts retrieved successfully",
      userPosts,
      userPostsCount
    );
  } catch (error) {
    console.error("Error:", error);
    return errorRes(res, "Internal server error");
  }
};

const savePost = async (req, res) => {
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
    var { post_id, is_saved, interest_id, sub_interest_id } = req.body;

    var find_user = await users.findOne().where({
      _id: user_id,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, "This user does not exist");
    }

    var find_post = await post.findOne().where({
      _id: post_id,
      is_block: false,
      is_deleted: false,
    });

    if (!find_post) {
      return errorRes(res, "This post does not exist");
    }

    var existingSave = await save_post.findOne().where({
      user_id,
      post_id,
    });

    if (is_saved === true || is_saved === "true") {
      if (existingSave) {
        return successRes(res, "Post saved successfully");
      } else {
        await save_post.create({
          user_id,
          post_id,
        });

        await user_interactions.create({
          user_id: user_id,
          interest_id: interest_id,
          sub_interest_id: sub_interest_id,
          post_id: post_id,
          interaction_type: "save",
        })

        await post.findByIdAndUpdate(post_id, {
          $inc: { interaction_count: 1 },
        });
        return successRes(res, "Post saved successfully");
      }
    }

    if (is_saved === false || is_saved === "false") {
      if (existingSave) {
        await save_post.deleteOne({ _id: existingSave._id });
        await user_interactions.deleteOne({
          user_id: user_id,
          interest_id: interest_id,
          sub_interest_id: sub_interest_id,
          post_id: post_id,
          interaction_type: "save",
        })
        await post.findByIdAndUpdate(post_id, {
          $inc: { interaction_count: -1 },
        });
        return successRes(res, "Post unsaved successfully");
      } else {
        return successRes(res, "Post unsaved successfully");
      }
    }
  } catch (error) {
    console.log("Error: ", error);
    return errorRes(res, "Internal server error");
  }
};

const deletePost = async (req, res) => {
  try {
    var { post_id } = req.body;

    const find_post = await post
      .findById({ _id: post_id })
      .where({ is_deleted: false, is_block: false });

    if (!find_post) {
      return errorRes(res, "Couldn't find post");
    }
    if (find_post?.repost_id) {
      await post.findByIdAndUpdate(
        { _id: find_post?.repost_id },
        { $inc: { repost_count: -1 } },
        { new: true }
      );
    }

    if (find_post) {
      await post.updateMany(
        {
          $and: [
            { repost_id: find_post._id },
            { is_deleted: false },
            {
              $or: [{ description: null }, { description: { $exists: false } }],
            },
          ],
        },
        { $set: { is_deleted: true } }
      );
    }
    var delete_post = await post.findByIdAndUpdate(
      { _id: post_id },
      { $set: { is_deleted: true } },
      { new: true }
    );

    if (delete_post) {
      return successRes(res, "Post deleted successfully ", delete_post);
    }
  } catch (error) {
    console.log("Error: ", error);
    return errorRes(res, "Internal server error");
  }
};

const pollLike = async (req, res) => {
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
    const { option_id, post_id } = req.body;

    const find_post = await post
      .findOne({ _id: post_id })
      .where({ is_deleted: false });

    if (!find_post) {
      return errorRes(res, "Couldn't find post");
    }

    const find_user = await users
      .findOne({ _id: user_id })
      .where({ is_deleted: false });

    if (!find_user) {
      return errorRes(res, "Couldn't find user");
    }

    var existingVote = await pollvotes.findOne({
      user_id: user_id,
      post_id: post_id,
    });
    if (existingVote) {
      existingVote = {
        ...existingVote._doc,
        is_response: true,
      };
    }
    if (existingVote) {
      return successRes(res, "User already response", existingVote);
    }

    var existingview = await view_post.findOne().where({
      user_id,
      post_id,
    });

    if (!existingview) {
      await view_post.create({
        user_id,
        post_id,
      });

      await post.findByIdAndUpdate(
        post_id,
        {
          $inc: { view_count: 1 },
        },
        { new: true }
      );
    }

    if (!existingVote) {
      const optionUpdate = {
        updateOne: {
          filter: { _id: post_id, "options._id": option_id },
          update: { $inc: { "options.$.option_vote": 1 } },
        },
      };

      const counterUpdate = {
        updateOne: {
          filter: { _id: post_id },
          update: { $inc: { vote_counter: 1 } },
        },
      };
      await post.bulkWrite([optionUpdate, counterUpdate]);
      await pollvotes.create({
        user_id,
        option_id,
        post_id,
      });
    }
    var find_post_data = await post
      .findOne({ _id: post_id })
      .where({ is_deleted: false });

    const options = find_post_data?.options;
    const totalVotes = options.reduce(
      (total, opt) => total + opt.option_vote,
      0
    );

    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      const calculatedPercentage = (option.option_vote / totalVotes) * 100 || 0;
      option.option_percentage = parseFloat(calculatedPercentage.toFixed(2));
    }
    const roundingDifference = 100 - options.reduce((total, opt) => total + opt.option_percentage, 0);

    const lastOption = options[options.length - 1];
    lastOption.option_percentage = parseFloat((lastOption.option_percentage + roundingDifference).toFixed(2));
    await post.updateOne(
      { _id: post_id },
      { $set: { options, store_option_id: option_id } },
      { new: true }
    );

    if (find_post_data) {
      return successRes(res, "your vote add successfully", find_post_data);
    }
  } catch (error) {
    console.log("Error: ", error);
    return errorRes(res, "Internal server error");
  }
};

const likePost = async (req, res) => {
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

    var login_user_name = req.user.full_name;
    var login_user_profile_picture = req.user.profile_picture
      ? process.env.BASE_URL + req.user.profile_picture
      : req.user.profile_url;

    var { post_id, is_liked, interest_id, sub_interest_id } = req.body;

    var find_user = await users.findOne().where({
      _id: user_id,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, "This user does not exist");
    }

    var find_post = await post.findOne().where({
      _id: post_id,
      is_deleted: false,
    });

    if (!find_post) {
      return errorRes(res, "This post does not exist");
    }

    var existingLike = await like_post.findOne().where({
      user_id,
      post_id,
    });

    if (is_liked === true || is_liked === "true") {
      if (existingLike) {
        return successRes(res, "Post liked successfully");
      } else {
        var existingview = await view_post.findOne().where({
          user_id,
          post_id,
        });

        if (!existingview) {
          await view_post.create({
            user_id,
            post_id,
          });

          await post.findByIdAndUpdate(
            post_id,
            {
              $inc: { view_count: 1 },
            },
            { new: true }
          );
        }
        await like_post.create({
          user_id,
          post_id,
        });

        const find_post = await post.findByIdAndUpdate(post_id, {
          $inc: { like_count: 1 },
        });

        await notifications.deleteMany({
          post_id: find_post?._id,
          noti_for: "like_post",
          receiver_id: find_post?.user_id,
        })

        if (
          user_id &&
          find_post &&
          user_id.toString() !== find_post.user_id.toString()
        ) {
          const currentDateTime = await dateTime();
          let noti_msg = login_user_name + " liked your post";
          var media;
          if (find_post.post_type == "media") {
            if (find_post.post_media[0]?.file_type == "image") {
              media =
                process.env.BASE_URL + find_post.post_media[0].file_name;
            }
            if (find_post.post_media[0]?.file_type == "video") {
              media =
                process.env.BASE_URL + find_post.post_media[0].thumb_name;
            }
          }

          let noti_title = "Post liked";
          let noti_for = "like_post";
          let noti_image = login_user_profile_picture;
          let notiData = {
            noti_image,
            noti_msg,
            noti_title,
            noti_for,
            media: media,
            id: find_post._id,
          };

          await notifications.create({
            noti_title,
            noti_msg: "liked your post",
            noti_for,
            sender_id: user_id,
            receiver_id: find_post?.user_id,
            post_id: find_post?._id,
            noti_date: currentDateTime,
            created_at: currentDateTime,
            updated_at: currentDateTime,
          });

          var find_token = await user_session.find({
            user_id: find_post?.user_id,
            is_deleted: false,
          });

          var device_token_array = [];
          for (var value of find_token) {
            var device_token = value.device_token;
            device_token_array.push(device_token);
          }

          if (device_token_array.length > 0) {
            notiData = { ...notiData, device_token: device_token_array };
            var noti_send = await notiSendMultipleDevice(notiData);

            if (noti_send.status == 200) {
              await users.findByIdAndUpdate(find_post?.user_id, {
                $inc: {
                  noti_badge: 1,
                },
              });
            }
          }
        }
        await user_interactions.create({
          user_id: user_id,
          interest_id: interest_id,
          sub_interest_id: sub_interest_id,
          post_id: post_id,
          interaction_type: "like",
        })

        await post.findByIdAndUpdate(post_id, {
          $inc: { interaction_count: 1 },
        });

        return successRes(res, "Post liked successfully");
      }
    }

    if (is_liked === false || is_liked === "false") {
      if (existingLike) {
        await like_post.deleteOne({ _id: existingLike._id });

        await notifications.findOneAndDelete({
          user_id: user_id,
          post_id: post_id,
        });

        await post.findByIdAndUpdate(post_id, { $inc: { like_count: -1 } });

        await user_interactions.deleteOne({
          user_id: user_id,
          interest_id: interest_id,
          sub_interest_id: sub_interest_id,
          post_id: post_id,
          interaction_type: "like",
        })
        await post.findByIdAndUpdate(post_id, {
          $inc: { interaction_count: -1 },
        });

        return successRes(res, "Post unliked successfully");
      }
    }
  } catch (error) {
    console.log("Error: ", error);
    return errorRes(res, "Internal server error");
  }
};

const getAllSavedPosts = async (req, res) => {
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
    var { page = 1, limit = 10, language } = req.body;


    var find_user = await users.findOne().where({
      _id: user_id,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, "This user does not exist");
    }

    var savedPosts = await save_post
      .find({ user_id })
      .populate({
        path: "user_id",
      })
      .populate({
        path: "post_id",
        populate: {
          path: "interest_id sub_interest_id",
        },
      })
      .sort({ createdAt: "desc" })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const modifiedPosts = savedPosts.map((post_id) => post_id?.post_id?._id);

    var userPosts = await post
      .find({
        _id: { $in: modifiedPosts },
        is_deleted: false,
        is_block: false
      })
      .populate({
        path: "user_id",
        select:
          "unique_name full_name post_type profile_url profile_picture full_name is_verified",
      })
      .sort({ createdAt: 1 })
      .populate({
        path: "repost_id",
        populate: {
          path: "user_id",
          select:
            "unique_name full_name post_type profile_url profile_picture full_name is_verified",
        },
      })
      .populate("interest_id")
      .populate("sub_interest_id");

    var savedPostsCount = await save_post.countDocuments({ user_id });

    if (!savedPosts || savedPosts.length === 0) {
      return successRes(res, "No saved posts found for this user", []);
    }

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
          ...data.toObject(),
          is_like: !!isLiked,
          is_save: !!isSaved,
          is_poll_response: !!isPolled,
          store_option_id: store_option_id,
          is_repost_you: !!is_repost_you_status,
          is_view_impression: !!is_view_impression,
          is_view_Post: !!is_view_Post,
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

          var store_option_id_update = repostIsPolled?.option_id;
          const is_repost_you_status = await post.findOne({
            user_id: user_id,
            repost_id: data?.repost_id?._id,
            is_deleted: false,
            is_repost: true
          })

          const is_view_impression = await user_impressions.findOne({
            user_id: user_id,
            post_id: data.repost_id._id
          });

          const is_view_Post = await view_post.findOne({
            user_id: user_id,
            post_id: data.repost_id._id
          });

          updatedPost.repost_id = {
            ...data.repost_id.toObject(),
            is_like: !!repostIsLiked,
            is_save: !!repostIsSaved,
            is_poll_response: !!repostIsPolled,
            store_option_id: store_option_id_update,
            is_repost_you: !!is_repost_you_status,
            is_view_impression: !!is_view_impression,
            is_view_Post: !!is_view_Post,
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

    return multiSuccessRes(
      res,
      "Retrieved saved posts successfully",
      userPosts,
      savedPostsCount
    );
  } catch (error) {
    console.log("Error: ", error);
    return errorRes(res, "Internal server error");
  }
};

const getAllLikedPosts = async (req, res) => {
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
    var { page = 1, limit = 10, language } = req.body;

    console.log("language", language)

    var find_user = await users.findOne().where({
      _id: user_id,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, "This user does not exist");
    }

    var likedPosts = await like_post
      .find({ user_id })
      .populate({
        path: "post_id",
        populate: {
          path: "interest_id sub_interest_id",
        },
      })
      .populate({
        path: "user_id",
      })
      .sort({ createdAt: "desc" })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const modifiedPosts = likedPosts.map((post_id) => post_id?.post_id?._id);

    var userPosts = await post
      .find({
        _id: { $in: modifiedPosts },
        is_deleted: false,
        is_block: false
      })

      .populate({
        path: "user_id",
        select:
          "unique_name full_name post_type profile_url profile_picture full_name is_verified",
      }).sort({ createdAt: 1 })
      .populate({
        path: "repost_id",
        populate: {
          path: "user_id",
          select:
            "unique_name full_name post_type profile_url profile_picture full_name is_verified",
        },
      })
      .populate("interest_id")
      .populate("sub_interest_id");

    var likedPostsCount = await like_post.countDocuments({ user_id });

    // if (!likedPosts || likedPosts.length === 0) {
    //   return successRes(res, "No liked posts found for this user", []);
    // }


    if (likedPosts.length == 0) {
      return successRes(res, "No liked posts found for this user", []);
    }

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
          ...data.toObject(),
          is_like: !!isLiked,
          is_save: !!isSaved,
          is_poll_response: !!isPolled,
          store_option_id: store_option_id,
          is_repost_you: !!is_repost_you_status,
          is_view_impression: !!is_view_impression,
          is_view_Post: !!is_view_Post,
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

          var store_option_id_update = repostIsPolled?.option_id;
          const is_repost_you_status = await post.findOne({
            user_id: user_id,
            repost_id: data?.repost_id?._id,
            is_deleted: false,
            is_repost: true
          })

          const is_view_impression = await user_impressions.findOne({
            user_id: user_id,
            post_id: data.repost_id._id
          });

          const is_view_Post = await view_post.findOne({
            user_id: user_id,
            post_id: data.repost_id._id
          });

          updatedPost.repost_id = {
            ...data.repost_id.toObject(),
            is_like: !!repostIsLiked,
            is_save: !!repostIsSaved,
            is_poll_response: !!repostIsPolled,
            store_option_id: store_option_id_update,
            is_repost_you: !!is_repost_you_status,
            is_view_impression: !!is_view_impression,
            is_view_Post: !!is_view_Post,
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

    return multiSuccessRes(
      res,
      "Retrieved liked posts successfully",
      userPosts,
      likedPostsCount
    );
  } catch (error) {
    console.log("Error: ", error);
    return errorRes(res, "Internal server error");
  }
};

const createRepost = async (req, res) => {
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

    var login_user_name = req.user.full_name;
    var login_user_profile_picture = req.user.profile_picture
      ? process.env.BASE_URL + req.user.profile_picture
      : req.user.profile_url;

    var {
      repost_id,
      title,
      post_type,
      location,
      description,
      is_local,
      interest_id,
      sub_interest_id
    } = req.body;

    let find_user = await users.findOne().where({
      _id: user_id,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, "This user not exists");
    }

    const existingRepost = await post.findOne({
      user_id,
      repost_id,
      is_deleted: false,
    });

    if (existingRepost) {
      return errorRes(res, "You have already reposted this post");
    }

    if (repost_id) {
      let find_repost = await post.findOne().where({
        _id: repost_id,
        is_deleted: false,
      });

      if (!find_repost) {
        return errorRes(res, "This repost not exists");
      }

      if (find_repost.user_id.equals(user_id)) {
        return errorRes(res, "This is your post, so you cannot repost it");
      }
    }

    let find_repost_data = await post.findOne().where({
      _id: repost_id,
      is_deleted: false,
    });

    var insert_data;
    if (post_type == "text") {
      insert_data = {
        ...insert_data,
        post_type,
      };
    }
    insert_data = {
      ...insert_data,
      user_id,
      repost_id,
      interest_id: find_repost_data?.interest_id,
      sub_interest_id: find_repost_data?.sub_interest_id,
      description,
      title,
      is_repost: true,
      repost_count: 1
    };

    if (is_local == true || is_local == "true") {
      let find_repost_data = await post.findOne().where({
        _id: repost_id,
        is_deleted: false,
        is_local: true,
      });

      if (!find_repost_data) {
        return errorRes(res, "Plz add local post id ");
      }

      insert_data = {
        ...insert_data,
        is_local: true,
      };
    }

    if (location) {
      location = JSON.parse(location);

      if (location) {
        insert_data = {
          ...insert_data,
          location: location,
        }
      }
    }

    await post.findOneAndUpdate(
      { _id: repost_id },
      { $inc: { repost_count: 1 } },
      { new: true }
    );

    var create_post = await post.create(insert_data);

    await user_interactions.create({
      user_id: user_id,
      interest_id: interest_id,
      sub_interest_id: sub_interest_id,
      post_id: repost_id,
      interaction_type: "repost",
    })

    await post.findByIdAndUpdate(repost_id, {
      $inc: { interaction_count: 1 },
    });

    const original_user = await post.findOne({
      _id: repost_id,
      is_deleted: false,
    });

    await notifications.deleteMany({
      noti_for: "repost",
      receiver_id: original_user?.user_id,
    })


    if (create_post) {
      const currentDateTime = await dateTime();

      let noti_msg = login_user_name + " re-posted your post ";
      var media;

      let noti_title = "Repost";
      let noti_for = "repost";
      let noti_image = login_user_profile_picture;
      let notiData = {
        noti_image,
        noti_msg,
        noti_title,
        noti_for,
        media: media,
        id: create_post._id,
      };

      await notifications.create({
        noti_title,
        noti_msg: "re-posted your post",
        noti_for,
        sender_id: user_id,
        receiver_id: original_user?.user_id,
        post_id: create_post._id,
        noti_date: currentDateTime,
        created_at: currentDateTime,
        updated_at: currentDateTime,
      });

      var find_token = await user_session.find({
        user_id: original_user?.user_id,
        is_deleted: false,
      });

      var device_token_array = [];
      for (var value of find_token) {
        var device_token = value.device_token;
        device_token_array.push(device_token);
      }

      if (device_token_array.length > 0) {
        notiData = { ...notiData, device_token: device_token_array };
        var noti_send = await notiSendMultipleDevice(notiData);

        if (noti_send.status == 200) {
          await users.findByIdAndUpdate(original_user?.user_id, {
            $inc: {
              noti_badge: 1,
            },
          });
        }
      }
    }

    var find_post = await post
      .findOne({ _id: create_post._id })
      .populate("repost_id");

    if (create_post) {
      return successRes(res, "Repost create successfully", find_post);
    }
  } catch (error) {
    console.log("Error: ", error);
    return
  }
};

const createPostreport = async (req, res) => {
  try {
    var { user_id, post_id, reason_report } = req.body;

    if (user_id) {
      var find_user = await users.findOne().where({
        _id: user_id,
        is_deleted: false,
      });
      if (!find_user) {
        return errorRes(res, "This user not exists");
      }
    }
    if (post_id) {
      var find_post = await post.findOne().where({
        _id: post_id,
        is_deleted: false,
      });
      if (!find_post) {
        return errorRes(res, "This post not exists");
      }
    }

    await post.findByIdAndUpdate(post_id, {
      $inc: { report_post_count: 1 },
    }, { new: true });

    var insert_data = {
      user_id,
      post_id,
      reason_report,
    };
    var create_report = await postReport.create(insert_data);

    if (create_report) {
      return successRes(res, "Report sent successfully", create_report);
    }
  } catch (error) {
    console.log("Error: ", error);
    return errorRes(res, "Internal server error");
  }
};

const addComment = async (req, res) => {
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
    var login_user_name = req.user.full_name;
    var login_user_profile_picture = req.user.profile_picture
      ? process.env.BASE_URL + req.user.profile_picture
      : req.user.profile_url;

    var {
      post_id,
      content,
      parent_comment_id,
      reply_comment_id,
      mention_user_id,
      is_sub_comment,
      interest_id,
      sub_interest_id,
    } = req.body;

    var find_user = await users.findOne().where({
      _id: user_id,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, "This user does not exist");
    }

    var find_post = await post.findOne().where({
      _id: post_id,
      is_deleted: false,
    });

    if (!find_post) {
      return errorRes(res, "This post does not exist");
    }

    if (parent_comment_id) {
      var find_post = await comment_post.findOne().where({
        _id: parent_comment_id,
        is_deleted: false,
      });

      if (!find_post) {
        return errorRes(res, "This parent_comment_id does not exist");
      }
    }

    if (reply_comment_id) {
      var find_post_reply_comment = await comment_post.findOne().where({
        _id: reply_comment_id,
        is_deleted: false,
      });

      if (!find_post_reply_comment) {
        return errorRes(res, "This reply_comment_id does not exist");
      }
    }

    if (mention_user_id) {
      var find_user = await users.findOne().where({
        _id: mention_user_id,
        is_deleted: false,
      });

      if (!find_user) {
        return errorRes(res, "This mention_user_id does not exist");
      }
    }

    if (is_sub_comment == false || is_sub_comment == "false") {
      const newComment = new comment_post({
        user_id,
        post_id,
        content,
      });

      const savedComment = await newComment.save();

      var find_interaction = await user_interactions.findOne({
        user_id: user_id,
        interest_id: interest_id,
        sub_interest_id: sub_interest_id,
        post_id: post_id,
        interaction_type: "comment",
        is_comment: true,
      })

      if (!find_interaction) {
        await user_interactions.create({
          user_id: user_id,
          interest_id: interest_id,
          sub_interest_id: sub_interest_id,
          post_id: post_id,
          interaction_type: "comment",
          is_comment: true,
        })
        await post.findByIdAndUpdate(post_id, {
          $inc: { interaction_count: 1 },
        });
      }

      await notifications.deleteMany({
        post_id: post_id,
        noti_for: "post_comment"
      })

      if (savedComment) {
        var find_post = await post.findByIdAndUpdate(savedComment.post_id, {
          $inc: { comment_count: 1 },
        });

        if (
          user_id &&
          find_post &&
          user_id.toString() !== find_post.user_id.toString()
        ) {
          const currentDateTime = await dateTime();
          let noti_msg = login_user_name + " commented: " + content;
          var media;
          if (find_post.post_type == "media") {
            if (find_post.post_media[0]?.file_type == "image") {
              media =
                process.env.BASE_URL + find_post.post_media[0].file_name;
            }
            if (find_post.post_media[0]?.file_type == "video") {
              media =
                process.env.BASE_URL + find_post.post_media[0].thumb_name;
            }
          }

          let noti_title = "Post comment";
          let noti_for = "post_comment";
          let noti_image = login_user_profile_picture;
          let notiData = {
            noti_image,
            noti_msg,
            noti_title,
            noti_for,
            media: media,
            id: find_post._id,
          };

          await notifications.create({
            noti_title,
            noti_msg: "commented: " + content,
            noti_for,
            sender_id: user_id,
            receiver_id: find_post?.user_id,
            post_id: find_post?._id,
            noti_date: currentDateTime,
            created_at: currentDateTime,
            updated_at: currentDateTime,
          });

          var find_token = await user_session.find({
            user_id: find_post?.user_id,
            is_deleted: false,
          });

          var device_token_array = [];
          for (var value of find_token) {
            var device_token = value.device_token;
            device_token_array.push(device_token);
          }

          if (device_token_array.length > 0) {
            notiData = { ...notiData, device_token: device_token_array };
            var noti_send = await notiSendMultipleDevice(notiData);

            if (noti_send.status == 200) {
              await users.findByIdAndUpdate(find_post?.user_id, {
                $inc: {
                  noti_badge: 1,
                },
              });
            }
          }
        }
      }

      const getComment = await comment_post
        .find({ _id: savedComment._id, is_deleted: false })
        .populate({
          path: "user_id",
          select: "_id unique_name profile_url profile_picture full_name",
        });

      const getResponseComment = await Promise.all(
        getComment.map(async (parentComment) => {
          try {
            const isLiked = await like_comment.findOne({
              user_id: user_id,
              comment_id: parentComment._id,
            });
            const parentCommentWithLikeStatus = {
              ...parentComment.toObject(),
              is_like: !!isLiked,
            };
            return parentCommentWithLikeStatus;
          } catch (error) {
            console.error(
              "Error checking like status for parent comment:",
              error
            );
            return parentComment;
          }
        })
      );

      const addBaseUrlToProfilePicture = (user) => {
        if (user && user.profile_picture) {
          user.profile_picture = process.env.BASE_URL + user.profile_picture;
        }
      };

      getResponseComment.forEach((comment) => {
        addBaseUrlToProfilePicture(comment.user_id);
      });

      return successRes(res, "Comment added successfully", getResponseComment);
    }

    if (is_sub_comment == true || is_sub_comment == "true") {
      const newComment = new comment_post({
        user_id,
        post_id,
        content,
        parent_comment_id,
        reply_comment_id,
        mention_user_id,
        is_sub_comment,
      });

      const savedComment = await newComment.save();

      var find_interaction = await user_interactions.findOne({
        user_id: user_id,
        interest_id: interest_id,
        sub_interest_id: sub_interest_id,
        post_id: post_id,
        interaction_type: "comment",
        is_comment: true,
      })

      if (!find_interaction) {
        await user_interactions.create({
          user_id: user_id,
          interest_id: interest_id,
          sub_interest_id: sub_interest_id,
          post_id: post_id,
          interaction_type: "comment",
          is_comment: true,
        })
        await post.findByIdAndUpdate(post_id, {
          $inc: { interaction_count: 1 },
        });
      }

      if (savedComment) {
        var find_post = await post.findByIdAndUpdate(savedComment.post_id, {
          $inc: { comment_count: 1 },
        });
        await comment_post.findByIdAndUpdate(savedComment.reply_comment_id, {
          $inc: { comment_reply_count: 1 },
        });

        await users.findOne().where({
          _id: savedComment.mention_user_id,
          is_deleted: false,
        });

        if (user_id.toString() == savedComment.mention_user_id.toString()
          && user_id.toString() !== find_post.user_id.toString()) {

          await notifications.deleteMany({
            post_id: find_post._id,
            noti_for: "post_comment",
            receiver_id: find_post?.user_id,
          })

          const currentDateTime = await dateTime();
          let noti_msg = login_user_name + " commented: " + content;
          var media;
          if (find_post.post_type == "media") {
            if (find_post.post_media[0]?.file_type == "image") {
              media =
                process.env.BASE_URL + find_post.post_media[0].file_name;
            }
            if (find_post.post_media[0]?.file_type == "video") {
              media =
                process.env.BASE_URL + find_post.post_media[0].thumb_name;
            }
          }

          let noti_title = "Post comment";
          let noti_for = "post_comment";
          let noti_image = login_user_profile_picture;
          let notiData = {
            noti_image,
            noti_msg,
            noti_title,
            noti_for,
            media: media,
            id: find_post._id,
          };

          await notifications.create({
            noti_title,
            noti_msg: "commented: " + content,
            noti_for,
            sender_id: user_id,
            receiver_id: find_post?.user_id,
            post_id: find_post._id,
            noti_date: currentDateTime,
            created_at: currentDateTime,
            updated_at: currentDateTime,
          });

          var find_token = await user_session.find({
            user_id: find_post.user_id,
            is_deleted: false,
          });

          var device_token_array = [];
          for (var value of find_token) {
            var device_token = value.device_token;
            device_token_array.push(device_token);
          }

          if (device_token_array.length > 0) {
            notiData = { ...notiData, device_token: device_token_array };
            var noti_send = await notiSendMultipleDevice(notiData);

            if (noti_send.status == 200) {
              await users.findByIdAndUpdate(find_post?.user_id, {
                $inc: {
                  noti_badge: 1,
                },
              });
            }
          }
        }

        if (user_id.toString() !== savedComment.mention_user_id.toString()
          && user_id.toString() == find_post.user_id.toString()) {

          await notifications.deleteMany({
            post_id: find_post._id,
            noti_for: "post_comment",
            receiver_id: savedComment?.mention_user_id,
          })

          const currentDateTime = await dateTime();
          let noti_msg =
            login_user_name + " replied to your comment: " + content;
          var media;
          if (find_post.post_type == "media") {
            if (find_post.post_media[0]?.file_type == "image") {
              media =
                process.env.BASE_URL + find_post.post_media[0].file_name;
            }
            if (find_post.post_media[0]?.file_type == "video") {
              media =
                process.env.BASE_URL + find_post.post_media[0].thumb_name;
            }
          }

          let noti_title = "Comment reply";
          let noti_for = "post_comment";
          let noti_image = login_user_profile_picture;
          let notiData = {
            noti_image,
            noti_msg,
            noti_title,
            noti_for,
            media: media,
            id: find_post._id,
          };

          await notifications.create({
            noti_title,
            noti_msg: "replied to your comment: " + content,
            noti_for,
            sender_id: user_id,
            receiver_id: savedComment?.mention_user_id,
            post_id: find_post._id,
            noti_date: currentDateTime,
            created_at: currentDateTime,
            updated_at: currentDateTime,
          });

          var find_token = await user_session.find({
            user_id: savedComment?.mention_user_id,
            is_deleted: false,
          });

          var device_token_array = [];
          for (var value of find_token) {
            var device_token = value.device_token;
            device_token_array.push(device_token);
          }

          if (device_token_array.length > 0) {
            notiData = { ...notiData, device_token: device_token_array };
            var noti_send = await notiSendMultipleDevice(notiData);

            if (noti_send.status == 200) {
              await users.findByIdAndUpdate(savedComment?.mention_user_id, {
                $inc: {
                  noti_badge: 1,
                },
              });
            }
          }
        }

        if (user_id.toString() !== savedComment.mention_user_id.toString()
          && user_id.toString() !== find_post.user_id.toString()) {

          if (savedComment.mention_user_id.toString() == find_post.user_id.toString()) {

            await notifications.deleteMany({
              post_id: find_post?._id,
              noti_for: "post_comment",
              receiver_id: savedComment?.mention_user_id,
            })

            const currentDateTime = await dateTime();
            let noti_msg =
              login_user_name + " replied to your comment: " + content;
            var media;
            if (find_post.post_type == "media") {
              if (find_post.post_media[0]?.file_type == "image") {
                media =
                  process.env.BASE_URL + find_post.post_media[0].file_name;
              }
              if (find_post.post_media[0]?.file_type == "video") {
                media =
                  process.env.BASE_URL + find_post.post_media[0].thumb_name;
              }
            }

            let noti_title = "Comment reply";
            let noti_for = "post_comment";
            let noti_image = login_user_profile_picture;
            let notiData = {
              noti_image,
              noti_msg,
              noti_title,
              noti_for,
              media: media,
              id: find_post._id,
            };

            await notifications.create({
              noti_title,
              noti_msg: "replied to your comment: " + content,
              noti_for,
              sender_id: user_id,
              receiver_id: savedComment?.mention_user_id,
              post_id: find_post?._id,
              noti_date: currentDateTime,
              created_at: currentDateTime,
              updated_at: currentDateTime,
            });

            var find_token = await user_session.find({
              user_id: savedComment?.mention_user_id,
              is_deleted: false,
            });

            var device_token_array = [];
            for (var val of find_token) {
              var device_token = val.device_token;
              device_token_array.push(device_token);
            }

            if (device_token_array.length > 0) {
              notiData = { ...notiData, device_token: device_token_array };
              var noti_send = await notiSendMultipleDevice(notiData);

              if (noti_send.status == 200) {


                await users.findByIdAndUpdate(savedComment?.mention_user_id, {
                  $inc: {
                    noti_badge: 1,
                  },
                });
              }
            }
          } else {
            const send_noti_comment = "send_noti_comment";
            const send_noti_reply = "send_noti_reply";

            if (send_noti_comment) {
              await notifications.deleteMany({
                post_id: find_post?._id,
                noti_for: "post_comment",
                receiver_id: find_post?.user_id,
              })

              const currentDateTime = await dateTime();
              let noti_msg = login_user_name + " commented: " + content;
              let media;
              if (find_post.post_type == "media") {
                if (find_post.post_media[0]?.file_type == "image") {
                  media =
                    process.env.BASE_URL + find_post.post_media[0].file_name;
                }
                if (find_post.post_media[0]?.file_type == "video") {
                  media =
                    process.env.BASE_URL + find_post.post_media[0].thumb_name;
                }
              }

              let noti_title = "Post comment";
              let noti_for = "post_comment";
              let noti_image = login_user_profile_picture;
              let notiData = {
                noti_image,
                noti_msg,
                noti_title,
                noti_for,
                media: media,
                id: find_post._id,
              };

              await notifications.create({
                noti_title,
                noti_msg: "commented: " + content,
                noti_for,
                sender_id: user_id,
                receiver_id: find_post?.user_id,
                post_id: find_post?._id,
                noti_date: currentDateTime,
                created_at: currentDateTime,
                updated_at: currentDateTime,
              });

              var find_token = await user_session.find({
                user_id: find_post?.user_id,
                is_deleted: false,
              });

              var device_token_array = [];
              for (var data of find_token) {
                var device_token = data.device_token;
                device_token_array.push(device_token);
              }

              if (device_token_array.length > 0) {
                notiData = { ...notiData, device_token: device_token_array };
                var noti_send = await notiSendMultipleDevice(notiData);

                if (noti_send.status == 200) {
                  await users.findByIdAndUpdate(find_post?.user_id, {
                    $inc: {
                      noti_badge: 1,
                    },
                  });
                }
              }
            }

            if (send_noti_reply) {
              await notifications.deleteMany({
                post_id: find_post?._id,
                noti_for: "post_comment",
                receiver_id: savedComment?.mention_user_id,
              })

              const currentDateTime = await dateTime();
              let noti_msg =
                login_user_name + " replied to your comment: " + content;
              var media;
              if (find_post.post_type == "media") {
                if (find_post.post_media[0]?.file_type == "image") {
                  media =
                    process.env.BASE_URL + find_post.post_media[0].file_name;
                }
                if (find_post.post_media[0]?.file_type == "video") {
                  media =
                    process.env.BASE_URL + find_post.post_media[0].thumb_name;
                }
              }

              let noti_title = "Comment reply";
              let noti_for = "post_comment";
              let noti_image = login_user_profile_picture;
              let notiData = {
                noti_image,
                noti_msg,
                noti_title,
                noti_for,
                media: media,
                id: find_post._id,
              };

              await notifications.create({
                noti_title,
                noti_msg: "replied to your comment: " + content,
                noti_for,
                sender_id: user_id,
                receiver_id: savedComment?.mention_user_id,
                post_id: find_post?._id,
                noti_date: currentDateTime,
                created_at: currentDateTime,
                updated_at: currentDateTime,
              });

              var find_token = await user_session.find({
                user_id: savedComment?.mention_user_id,
                is_deleted: false,
              });

              var device_token_array = [];
              for (var values of find_token) {
                var device_token = values.device_token;
                device_token_array.push(device_token);
              }

              if (device_token_array.length > 0) {
                notiData = { ...notiData, device_token: device_token_array };
                var noti_send = await notiSendMultipleDevice(notiData);

                if (noti_send.status == 200) {
                  await users.findByIdAndUpdate(savedComment?.mention_user_id, {
                    $inc: {
                      noti_badge: 1,
                    },
                  });
                }
              }
            }
          }
        }
      }

      const getComment = await comment_post
        .find({ _id: savedComment._id, is_deleted: false })
        .populate({
          path: "user_id",
          select: "_id unique_name profile_url profile_picture full_name",
        })
        .populate({
          path: "mention_user_id",
          select: "_id unique_name profile_url profile_picture full_name",
        });

      const getResponseComment = await Promise.all(
        getComment.map(async (parentComment) => {
          try {
            const isLiked = await like_comment.findOne({
              user_id: user_id,
              comment_id: parentComment._id,
            });
            const parentCommentWithLikeStatus = {
              ...parentComment.toObject(),
              is_like: !!isLiked,
            };
            return parentCommentWithLikeStatus;
          } catch (error) {
            console.error(
              "Error checking like status for parent comment:",
              error
            );
            return parentComment;
          }
        })
      );

      const addBaseUrlToProfilePicture = (user) => {
        if (user && user.profile_picture) {
          user.profile_picture = process.env.BASE_URL + user.profile_picture;
        }
      };

      getResponseComment.forEach((comment) => {
        addBaseUrlToProfilePicture(comment.user_id);
        addBaseUrlToProfilePicture(comment.mention_user_id);
      });

      return successRes(res, "Comment added successfully", getResponseComment);
    }

    const newComment = new comment_post({
      user_id,
      post_id,
      content,
      parent_comment_id,
      reply_comment_id,
      mention_user_id,
    });

    const savedComment = await newComment.save();

    if (savedComment) {
      await post.findByIdAndUpdate(savedComment.post_id, {
        $inc: { comment_count: 1 },
      });
    }

    return successRes(res, "Comment added successfully", savedComment);
  } catch (error) {
    console.log("Error: ", error);
    return errorRes(res, "Internal server error");
  }
};

const editComment = async (req, res) => {
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
    var {
      comment_id,

      post_id,
      content,
      parent_comment_id,
      reply_comment_id,
      mention_user_id,
    } = req.body;

    var existingComment = await comment_post.findOne().where({
      _id: comment_id,
      is_deleted: false,
    });

    if (!existingComment) {
      return errorRes(res, "This comment does not exist");
    }

    var find_user = await users.findOne().where({
      _id: user_id,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, "This user does not exist");
    }

    var find_post = await post.findOne().where({
      _id: post_id,
      is_deleted: false,
    });

    if (!find_post) {
      return errorRes(res, "This post does not exist");
    }

    if (parent_comment_id) {
      var find_post = await comment_post.findOne().where({
        _id: parent_comment_id,
        is_deleted: false,
      });

      if (!find_post) {
        return errorRes(res, "This parent_comment_id does not exist");
      }
    }

    if (reply_comment_id) {
      var find_post_reply_comment_id = await comment_post.findOne().where({
        _id: reply_comment_id,
        is_deleted: false,
      });

      if (!find_post_reply_comment_id) {
        return errorRes(res, "This reply_comment_id does not exist");
      }
    }

    if (mention_user_id) {
      var find_user = await users.findOne().where({
        _id: mention_user_id,
        is_deleted: false,
      });

      if (!find_user) {
        return errorRes(res, "This mention_user_id does not exist");
      }
    }

    const updatedComment = await comment_post.findByIdAndUpdate(
      comment_id,
      { $set: { content } },
      { new: true }
    );

    if (
      updatedComment.is_sub_comment == false ||
      updatedComment.is_sub_comment == "false"
    ) {
      const getComment = await comment_post
        .find({ _id: updatedComment._id, is_deleted: false })
        .populate({
          path: "user_id",
          select: "_id unique_name profile_url profile_picture full_name",
        });

      const getResponseComment = await Promise.all(
        getComment.map(async (parentComment) => {
          try {
            const isLiked = await like_comment.findOne({
              user_id: user_id,
              comment_id: parentComment._id,
            });
            const parentCommentWithLikeStatus = {
              ...parentComment.toObject(),
              is_like: !!isLiked,
            };
            return parentCommentWithLikeStatus;
          } catch (error) {
            console.error(
              "Error checking like status for parent comment:",
              error
            );
            return parentComment;
          }
        })
      );

      const addBaseUrlToProfilePicture = (user) => {
        if (user && user.profile_picture) {
          user.profile_picture = process.env.BASE_URL + user.profile_picture;
        }
      };

      getResponseComment.forEach((comment) => {
        addBaseUrlToProfilePicture(comment.user_id);
      });

      return successRes(
        res,
        "Comment updated successfully",
        getResponseComment
      );
    }

    if (
      updatedComment.is_sub_comment == true ||
      updatedComment.is_sub_comment == "true"
    ) {
      const getComment = await comment_post
        .find({ _id: updatedComment._id, is_deleted: false })
        .populate({
          path: "user_id",
          select: "_id unique_name profile_url profile_picture full_name",
        })
        .populate({
          path: "mention_user_id",
          select: "_id unique_name profile_url profile_picture full_name",
        });

      const getResponseComment = await Promise.all(
        getComment.map(async (parentComment) => {
          try {
            const isLiked = await like_comment.findOne({
              user_id: user_id,
              comment_id: parentComment._id,
            });
            const parentCommentWithLikeStatus = {
              ...parentComment.toObject(),
              is_like: !!isLiked,
            };
            return parentCommentWithLikeStatus;
          } catch (error) {
            console.error(
              "Error checking like status for parent comment:",
              error
            );
            return parentComment;
          }
        })
      );

      const addBaseUrlToProfilePicture = (user) => {
        if (user && user.profile_picture) {
          user.profile_picture = process.env.BASE_URL + user.profile_picture;
        }
      };

      getResponseComment.forEach((comment) => {
        addBaseUrlToProfilePicture(comment.user_id);
        addBaseUrlToProfilePicture(comment.mention_user_id);
      });

      return successRes(
        res,
        "Comment updated successfully",
        getResponseComment
      );
    }
  } catch (error) {
    console.log("Error: ", error);
    return errorRes(res, "Internal server error");
  }
};

const deleteComment = async (req, res) => {
  try {
    var { comment_id, is_sub_comment } = req.body;

    var existingComment = await comment_post.findOne().where({
      _id: comment_id,
      is_deleted: false,
    });

    if (!existingComment) {
      return errorRes(res, "This comment does not exist");
    }

    if (is_sub_comment == false || is_sub_comment == "false") {
      var subComments = await comment_post.find().where({
        parent_comment_id: existingComment._id,
        is_deleted: false,
      });

      for (const subComment of subComments) {
        await comment_post.findByIdAndUpdate(
          subComment._id,
          { $set: { is_deleted: true } },
          { new: true }
        );
      }

      const deletedComment = await comment_post.findByIdAndUpdate(
        comment_id,
        { $set: { is_deleted: true } },
        { new: true }
      );

      if (!deletedComment) {
        return errorRes(res, "Failed to delete the comment");
      }

      const totalcountminus = subComments.length + 1;

      await post.findByIdAndUpdate(deletedComment.post_id, {
        $inc: { comment_count: -totalcountminus },
      });
    }

    if (is_sub_comment == true || is_sub_comment == "true") {
      const deletedComment = await comment_post.findByIdAndUpdate(
        comment_id,
        { $set: { is_deleted: true } },
        { new: true }
      );

      if (!deletedComment) {
        return errorRes(res, "Failed to delete the comment");
      }

      await comment_post.findByIdAndUpdate(deletedComment.reply_comment_id, {
        $inc: { comment_reply_count: -1 },
      });
      await post.findByIdAndUpdate(deletedComment.post_id, {
        $inc: { comment_count: -1 },
      });
    }

    return successRes(res, "Comment deleted successfully");
  } catch (error) {
    console.log("Error: ", error);
    return errorRes(res, "Internal server error");
  }
};

const getAllComments = async (req, res) => {
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
    var { page = 1, limit = 10, post_id, filter } = req.body;

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

    const blockedUserIds = [
      ...userBlockedByOthersIds,
      ...usersBlockingCurrentUserIds,
    ];

    var find_user = await users.findOne().where({
      _id: user_id,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, "This user does not exist");
    }

    if (filter == "newest") {
      const parentComments = await comment_post
        .find({
          post_id: post_id,
          parent_comment_id: null,
          user_id: { $nin: blockedUserIds },
          is_deleted: false,
        })
        .populate({
          path: "user_id",
          select:
            "unique_name full_name post_type profile_url profile_picture full_name",
        })
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const parentCommentsWithLikeStatus = await Promise.all(
        parentComments.map(async (parentComment) => {
          try {
            const isLiked = await like_comment.findOne({
              user_id: user_id,
              comment_id: parentComment._id,
            });
            const parentCommentWithLikeStatus = {
              ...parentComment.toObject(),
              is_like: !!isLiked,
            };
            return parentCommentWithLikeStatus;
          } catch (error) {
            console.error(
              "Error checking like status for parent comment:",
              error
            );
            return parentComment;
          }
        })
      );

      const organizedComments = await Promise.all(
        parentCommentsWithLikeStatus.map(async (parentComment) => {
          const replies = await comment_post
            .find({
              post_id: post_id,
              parent_comment_id: parentComment._id,
              user_id: { $nin: blockedUserIds },
              is_deleted: false,
            })
            .populate({
              path: "user_id",
              select:
                "unique_name full_name post_type profile_url profile_picture full_name",
            })
            .populate({
              path: "mention_user_id",
              select:
                "unique_name full_name post_type profile_url profile_picture full_name",
            })
            .sort({ createdAt: -1 });

          const commentsWithLikeStatus = await Promise.all(
            replies.map(async (comment) => {
              try {
                const isLiked = await like_comment.findOne({
                  user_id: user_id,
                  comment_id: comment._id,
                });
                const commentWithLikeStatus = {
                  ...comment.toObject(),
                  is_like: !!isLiked,
                };
                return commentWithLikeStatus;
              } catch (error) {
                console.error("Error checking like status for comment:", error);
                return comment;
              }
            })
          );

          return {
            parentComment,
            replies: commentsWithLikeStatus,
          };
        })
      );

      var CommentPostsCount = await comment_post.countDocuments({
        post_id: post_id,
        parent_comment_id: null,
        user_id: { $nin: blockedUserIds },
        is_deleted: false,
      });

      if (!parentComments || parentComments.length === 0) {
        return successRes(res, "No comments found for this post", []);
      }

      const addBaseUrlToProfilePicture = (user) => {
        if (user && user.profile_picture) {
          user.profile_picture = process.env.BASE_URL + user.profile_picture;
        }
      };

      organizedComments.forEach((comment) => {
        addBaseUrlToProfilePicture(comment.parentComment.user_id);

        if (comment.replies && comment.replies.length > 0) {
          comment.replies.forEach((reply) => {
            addBaseUrlToProfilePicture(reply.user_id);
            addBaseUrlToProfilePicture(reply.mention_user_id);
          });
        }
      });

      return multiSuccessRes(
        res,
        "Retrieved comments successfully",
        organizedComments,
        CommentPostsCount
      );
    }

    if (filter == "most_popular") {
      const parentComments = await comment_post
        .find({
          post_id: post_id,
          parent_comment_id: null,
          user_id: { $nin: blockedUserIds },
          is_deleted: false,
        })
        .populate({
          path: "user_id",
          select:
            "unique_name full_name post_type profile_url profile_picture full_name",
        })
        .sort({ like_count: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const parentCommentsWithLikeStatus = await Promise.all(
        parentComments.map(async (parentComment) => {
          try {
            const isLiked = await like_comment.findOne({
              user_id: user_id,
              comment_id: parentComment._id,
            });
            const parentCommentWithLikeStatus = {
              ...parentComment.toObject(),
              is_like: !!isLiked,
            };
            return parentCommentWithLikeStatus;
          } catch (error) {
            console.error(
              "Error checking like status for parent comment:",
              error
            );
            return parentComment;
          }
        })
      );

      const organizedComments = await Promise.all(
        parentCommentsWithLikeStatus.map(async (parentComment) => {
          const replies = await comment_post
            .find({
              post_id: post_id,
              parent_comment_id: parentComment._id,
              user_id: { $nin: blockedUserIds },
              is_deleted: false,
            })
            .populate({
              path: "user_id",
              select:
                "unique_name full_name post_type profile_url profile_picture full_name",
            })
            .populate({
              path: "mention_user_id",
              select:
                "unique_name full_name post_type profile_url profile_picture full_name",
            })
            .sort({ like_count: -1 });

          const commentsWithLikeStatus = await Promise.all(
            replies.map(async (comment) => {
              try {
                const isLiked = await like_comment.findOne({
                  user_id: user_id,
                  comment_id: comment._id,
                });
                const commentWithLikeStatus = {
                  ...comment.toObject(),
                  is_like: !!isLiked,
                };
                return commentWithLikeStatus;
              } catch (error) {
                console.error("Error checking like status for comment:", error);
                return comment;
              }
            })
          );

          return {
            parentComment,
            replies: commentsWithLikeStatus,
          };
        })
      );

      var CommentPostsCount = await comment_post.countDocuments({
        post_id: post_id,
        parent_comment_id: null,
        user_id: { $nin: blockedUserIds },
        is_deleted: false,
      });

      if (!parentComments || parentComments.length === 0) {
        return successRes(res, "No comments found for this post", []);
      }

      const addBaseUrlToProfilePicture = (user) => {
        if (user && user.profile_picture) {
          user.profile_picture = process.env.BASE_URL + user.profile_picture;
        }
      };

      organizedComments.forEach((comment) => {
        addBaseUrlToProfilePicture(comment.parentComment.user_id);

        if (comment.replies && comment.replies.length > 0) {
          comment.replies.forEach((reply) => {
            addBaseUrlToProfilePicture(reply.user_id);
            addBaseUrlToProfilePicture(reply.mention_user_id);
          });
        }
      });
      return multiSuccessRes(
        res,
        "Retrieved comments successfully",
        organizedComments,
        CommentPostsCount
      );
    }

    if (filter == "trending") {
      const timeFrameInHours = 24;

      const parentComments = await comment_post
        .find({
          post_id: post_id,
          parent_comment_id: null,
          user_id: { $nin: blockedUserIds },
          is_deleted: false,
          createdAt: {
            $gte: new Date(Date.now() - timeFrameInHours * 60 * 60 * 1000),
          },
        })
        .populate({
          path: "user_id",
          select:
            "unique_name full_name post_type profile_url profile_picture full_name is_verified",
        })
        .sort({ comment_reply_count: -1, createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const parentCommentsWithLikeStatus = await Promise.all(
        parentComments.map(async (parentComment) => {
          try {
            const isLiked = await like_comment.findOne({
              user_id: user_id,
              comment_id: parentComment._id,
            });
            const parentCommentWithLikeStatus = {
              ...parentComment.toObject(),
              is_like: !!isLiked,
            };
            return parentCommentWithLikeStatus;
          } catch (error) {
            console.error(
              "Error checking like status for parent comment:",
              error
            );
            return parentComment;
          }
        })
      );

      const organizedComments = await Promise.all(
        parentCommentsWithLikeStatus.map(async (parentComment) => {
          const replies = await comment_post
            .find({
              post_id: post_id,
              parent_comment_id: parentComment._id,
              user_id: { $nin: blockedUserIds },
              is_deleted: false,
              createdAt: {
                $gte: new Date(Date.now() - timeFrameInHours * 60 * 60 * 1000),
              },
            })
            .populate({
              path: "user_id",
              select:
                "unique_name full_name post_type profile_url profile_picture full_name is_verified",
            })
            .populate({
              path: "mention_user_id",
              select:
                "unique_name full_name post_type profile_url profile_picture full_name is_verified",
            })
            .sort({ comment_reply_count: -1, createdAt: -1 });

          const commentsWithLikeStatus = await Promise.all(
            replies.map(async (comment) => {
              try {
                const isLiked = await like_comment.findOne({
                  user_id: user_id,
                  comment_id: comment._id,
                });
                const commentWithLikeStatus = {
                  ...comment.toObject(),
                  is_like: !!isLiked,
                };
                return commentWithLikeStatus;
              } catch (error) {
                console.error("Error checking like status for comment:", error);
                return comment;
              }
            })
          );

          return {
            parentComment,
            replies: commentsWithLikeStatus,
          };
        })
      );

      var CommentPostsCount = await comment_post.countDocuments({
        post_id: post_id,
        parent_comment_id: null,
        user_id: { $nin: blockedUserIds },
        is_deleted: false,
      });

      // if (!parentComments || parentComments.length === 0) {

      if (parentComments.length == 0) {
        const parentComments1 = await comment_post
          .find({
            post_id: post_id,
            parent_comment_id: null,
            user_id: { $nin: blockedUserIds },
            is_deleted: false,
          })
          .populate({
            path: "user_id",
            select:
              "unique_name full_name post_type profile_url profile_picture full_name is_verified",
          })
          .sort({ comment_reply_count: -1 })
          .limit(limit * 1)
          .skip((page - 1) * limit);

        const parentCommentsWithLikeStatus = await Promise.all(
          parentComments1.map(async (parentComment) => {
            try {
              const isLiked = await like_comment.findOne({
                user_id: user_id,
                comment_id: parentComment._id,
              });
              const parentCommentWithLikeStatus = {
                ...parentComment.toObject(),
                is_like: !!isLiked,
              };
              return parentCommentWithLikeStatus;
            } catch (error) {
              console.error(
                "Error checking like status for parent comment:",
                error
              );
              return parentComment;
            }
          })
        );

        const organizedComments = await Promise.all(
          parentCommentsWithLikeStatus.map(async (parentComment) => {
            const replies = await comment_post
              .find({
                post_id: post_id,
                parent_comment_id: parentComment._id,
                user_id: { $nin: blockedUserIds },
                is_deleted: false,
              })
              .populate({
                path: "user_id",
                select:
                  "unique_name full_name post_type profile_url profile_picture full_name is_verified",
              })
              .populate({
                path: "mention_user_id",
                select:
                  "unique_name full_name post_type profile_url profile_picture full_name is_verified",
              })
              .sort({ comment_reply_count: -1 });

            const commentsWithLikeStatus = await Promise.all(
              replies.map(async (comment) => {
                try {
                  const isLiked = await like_comment.findOne({
                    user_id: user_id,
                    comment_id: comment._id,
                  });
                  const commentWithLikeStatus = {
                    ...comment.toObject(),
                    is_like: !!isLiked,
                  };
                  return commentWithLikeStatus;
                } catch (error) {
                  console.error(
                    "Error checking like status for comment:",
                    error
                  );
                  return comment;
                }
              })
            );

            return {
              parentComment,
              replies: commentsWithLikeStatus,
            };
          })
        );

        var CommentPostsCount = await comment_post.countDocuments({
          post_id: post_id,
          parent_comment_id: null,
          user_id: { $nin: blockedUserIds },
          is_deleted: false,
        });

        // if (!parentComments1 || parentComments1.length === 0) {

        if (parentComments1.length == 0) {
          return successRes(res, "No comments found for this post", []);
        }

        return multiSuccessRes(
          res,
          "Retrieved comments successfully",
          organizedComments,
          CommentPostsCount
        );
      }

      const addBaseUrlToProfilePicture = (user) => {
        if (user && user.profile_picture) {
          user.profile_picture = process.env.BASE_URL + user.profile_picture;
        }
      };

      organizedComments.forEach((comment) => {
        addBaseUrlToProfilePicture(comment.parentComment.user_id);

        if (comment.replies && comment.replies.length > 0) {
          comment.replies.forEach((reply) => {
            addBaseUrlToProfilePicture(reply.user_id);
            addBaseUrlToProfilePicture(reply.mention_user_id);
          });
        }
      });
      return multiSuccessRes(
        res,
        "Retrieved comments successfully",
        organizedComments,
        CommentPostsCount
      );
    }
    var parentComments = await comment_post
      .find({
        post_id: post_id,
        parent_comment_id: null,
        user_id: { $nin: blockedUserIds },
        is_deleted: false,
      })
      .populate({
        path: "user_id",
        select:
          "unique_name full_name post_type profile_url profile_picture full_name is_verified",
      })
      .sort({ createdAt: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const parentCommentsWithLikeStatus = await Promise.all(
      parentComments.map(async (parentComment) => {
        try {
          const isLiked = await like_comment.findOne({
            user_id: user_id,
            comment_id: parentComment._id,
          });
          const parentCommentWithLikeStatus = {
            ...parentComment.toObject(),
            is_like: !!isLiked,
          };
          return parentCommentWithLikeStatus;
        } catch (error) {
          console.error(
            "Error checking like status for parent comment:",
            error
          );
          return parentComment;
        }
      })
    );

    const organizedComments = await Promise.all(
      parentCommentsWithLikeStatus.map(async (parentComment) => {
        const replies = await comment_post
          .find({
            post_id: post_id,
            parent_comment_id: parentComment._id,
            user_id: { $nin: blockedUserIds },
            is_deleted: false,
          })
          .populate({
            path: "user_id",
            select:
              "unique_name full_name post_type profile_url profile_picture full_name is_verified",
          })
          .populate({
            path: "mention_user_id",
            select:
              "unique_name full_name post_type profile_url profile_picture full_name is_verified",
          })
          .sort({ createdAt: 1 });

        const commentsWithLikeStatus = await Promise.all(
          replies.map(async (comment) => {
            try {
              const isLiked = await like_comment.findOne({
                user_id: user_id,
                comment_id: comment._id,
              });
              const commentWithLikeStatus = {
                ...comment.toObject(),
                is_like: !!isLiked,
              };
              return commentWithLikeStatus;
            } catch (error) {
              console.error("Error checking like status for comment:", error);
              return comment;
            }
          })
        );

        return {
          parentComment,
          replies: commentsWithLikeStatus,
        };
      })
    );

    var CommentPostsCount = await comment_post.countDocuments({
      post_id: post_id,
      parent_comment_id: null,
      user_id: { $nin: blockedUserIds },
      is_deleted: false,
    });

    if (!parentComments || parentComments.length === 0) {
      return successRes(res, "No comments found for this post", []);
    }

    const addBaseUrlToProfilePicture = (user) => {
      if (user && user.profile_picture) {
        user.profile_picture = process.env.BASE_URL + user.profile_picture;
      }
    };

    organizedComments.forEach((comment) => {
      addBaseUrlToProfilePicture(comment.parentComment.user_id);

      if (comment.replies && comment.replies.length > 0) {
        comment.replies.forEach((reply) => {
          addBaseUrlToProfilePicture(reply.user_id);
          addBaseUrlToProfilePicture(reply.mention_user_id);
        });
      }
    });

    return multiSuccessRes(
      res,
      "Retrieved comments successfully",
      organizedComments,
      CommentPostsCount
    );
  } catch (error) {
    console.log("Error: ", error);
    return errorRes(res, "Internal server error");
  }
};

const getUserCommentDetails = async (req, res) => {
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
    var { page = 1, limit = 10 } = req.body;
    var find_user = await users.findOne().where({
      _id: user_id,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, "This user does not exist");
    }

    var find_comment = await comment_post
      .find({
        user_id: user_id,
        is_deleted: false,
      })
      .populate({
        path: "user_id",
        select: "unique_name profile_url profile_picture full_name is_verified",
      })
      .populate({
        path: "post_id",
        select: "user_id",
        populate: {
          path: "user_id",
          select: "full_name unique_name is_verified",
        },
      })
      .populate({
        path: "mention_user_id",
        select: "full_name unique_name is_verified",
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    var find_comment_Count = await comment_post.countDocuments({
      user_id: user_id,
      is_deleted: false,
    });

    const formattedComments = await Promise.all(
      find_comment.map(async (comment) => {
        let target_id;
        if (comment.is_sub_comment == false) {
          target_id = comment.post_id.user_id;
        } else {
          target_id = comment.mention_user_id;
        }

        const isLiked = await like_comment.findOne({
          user_id: user_id,
          comment_id: comment._id,
        });

        const formattedComment = {
          ...comment.toObject(),
          target_id,
          is_like: !!isLiked,
        };

        if (formattedComment?.user_id?.profile_picture) {
          formattedComment.user_id.profile_picture =
            process.env.BASE_URL + formattedComment.user_id.profile_picture;
        }

        if (formattedComment?.repost_id?.user_id?.profile_picture) {
          formattedComment.repost_id.user_id.profile_picture =
            process.env.BASE_URL +
            formattedComment.repost_id.user_id.profile_picture;
        }

        formattedComment?.post_media?.forEach((media) => {
          if (media.file_type === "image" || media.file_type === "video") {
            media.file_name = process.env.BASE_URL + media.file_name;
            if (media.thumb_name) {
              media.thumb_name = process.env.BASE_URL + media.thumb_name;
            }
          }
        });

        formattedComment?.repost_id?.post_media?.forEach((media) => {
          if (media.file_type === "image" || media.file_type === "video") {
            media.file_name = process.env.BASE_URL + media.file_name;
            if (media.thumb_name) {
              media.thumb_name = process.env.BASE_URL + media.thumb_name;
            }
          }
        });
        return formattedComment;
      })
    );

    return multiSuccessRes(
      res,
      "Comment details get successfully",
      formattedComments,
      find_comment_Count
    );
  } catch (error) {
    console.log("Error: ", error);
    return errorRes(res, "Internal server error");
  }
};

const getAllReplyComments = async (req, res) => {
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
    var { page = 1, limit = 10, post_id, parent_comment_id } = req.body;

    var find_user = await users.findOne().where({
      _id: user_id,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, "This user does not exist");
    }

    var parentComments = await comment_post
      .find({
        post_id: post_id,
        reply_comment_id: parent_comment_id,
        is_deleted: false,
      })
      .populate({
        path: "user_id",
        select:
          "unique_name full_name post_type profile_url profile_picture full_name",
      })
      .sort({ createdAt: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    parentComments = await Promise.all(
      parentComments.map(async (post) => {
        const isLiked = await like_comment.findOne({
          user_id: user_id,
          comment_id: post._id,
        });

        return {
          ...post.toObject(),
          is_like: !!isLiked,
        };
      })
    );

    var CommentPostsCount = await comment_post.countDocuments({
      post_id: post_id,
      reply_comment_id: parent_comment_id,
      is_deleted: false,
    });

    if (!parentComments || parentComments.length === 0) {
      return successRes(
        res,
        "No comments reply found for this main comment",
        []
      );
    }

    return multiSuccessRes(
      res,
      "Retrieved comments reply successfully",
      parentComments,
      CommentPostsCount
    );
  } catch (error) {
    console.log("Error: ", error);
    return errorRes(res, "Internal server error");
  }
};

const likeComment = async (req, res) => {
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
    var login_user_name = req.user.full_name;
    var login_user_profile_picture = req.user.profile_picture
      ? process.env.BASE_URL + req.user.profile_picture
      : req.user.profile_url;

    var { comment_id, is_liked } = req.body;

    var find_user = await users.findOne().where({
      _id: user_id,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, "This user does not exist");
    }

    var find_comment = await comment_post.findOne().where({
      _id: comment_id,
      is_deleted: false,
    });

    if (!find_comment) {
      return errorRes(res, "This comment does not exist");
    }

    var existingLike = await like_comment.findOne().where({
      user_id,
      comment_id,
    });

    if (is_liked === true || is_liked === "true") {
      if (existingLike) {
        return successRes(res, "Comment liked successfully");
      } else {
        await like_comment.create({
          user_id,
          comment_id,
        });

        const find_comment = await comment_post.findByIdAndUpdate(comment_id, {
          $inc: { like_count: 1 },
        });

        await notifications.deleteMany({
          noti_for: "like_comment",
          receiver_id: find_comment?.user_id,
        })

        if (
          user_id &&
          find_comment &&
          user_id.toString() !== find_comment.user_id.toString()
        ) {
          const currentDateTime = await dateTime();
          let noti_msg = login_user_name + " liked your comment";

          let noti_title = "Comment like";
          let noti_for = "like_comment";
          let noti_image = login_user_profile_picture;
          let notiData = {
            noti_image,
            noti_msg,
            noti_title,
            noti_for,
            id: find_comment._id,
          };

          await notifications.create({
            noti_title,
            noti_msg: "liked your comment",
            noti_for,
            sender_id: user_id,
            receiver_id: find_comment?.user_id,
            comment_id: find_comment?.comment_id,
            noti_date: currentDateTime,
            created_at: currentDateTime,
            updated_at: currentDateTime,
          });

          var find_token = await user_session.find({
            user_id: find_comment?.user_id,
            is_deleted: false,
          });

          var device_token_array = [];
          for (var value of find_token) {
            var device_token = value.device_token;
            device_token_array.push(device_token);
          }

          if (device_token_array.length > 0) {
            notiData = { ...notiData, device_token: device_token_array };
            var noti_send = await notiSendMultipleDevice(notiData);

            if (noti_send.status == 200) {
              await users.findByIdAndUpdate(find_comment?.user_id, {
                $inc: {
                  noti_badge: 1,
                },
              });
            }
          }
        }

        return successRes(res, "Comment liked successfully");
      }
    }

    if (is_liked === false || is_liked === "false") {
      if (existingLike) {
        await like_comment.deleteOne({ _id: existingLike._id });

        await comment_post.findByIdAndUpdate(comment_id, {
          $inc: { like_count: -1 },
        });

        return successRes(res, "Comment unliked successfully");
      } else {
        return successRes(res, "Comment unliked successfully");
      }
    }
  } catch (error) {
    console.log("Error: ", error);
    return errorRes(res, "Internal server error");
  }
};

const postView = async (req, res) => {
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
    var { post_id, interest_id, sub_interest_id } = req.body;

    var find_user = await users.findOne().where({
      _id: user_id,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, "This user does not exist");
    }

    var find_post = await post.findOne().where({
      _id: post_id,
      is_deleted: false,
      is_block: false
    });

    if (!find_post) {
      return errorRes(res, "This post does not exist");
    }

    var existingLike = await view_post.findOne().where({
      user_id,
      post_id,
    });

    if (!existingLike) {
      await view_post.create({
        user_id,
        post_id,
      });

      await post.findByIdAndUpdate(
        post_id,
        {
          $inc: { view_count: 1 },
        },
        { new: true }
      );

      await user_interactions.create({
        user_id: user_id,
        interest_id: interest_id,
        sub_interest_id: sub_interest_id,
        post_id: post_id,
        interaction_type: "view",
      })

      await post.findByIdAndUpdate(post_id, {
        $inc: { interaction_count: 1 },
      });

      return successRes(res, "Post view successfully");
    } else {
      return errorRes(res, "You have already view this post");
    }
  } catch (error) {
    console.log("Error: ", error);
    return errorRes(res, "Internal server error");
  }
};

const getPostdetails = async (req, res) => {
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

    var login_user_id = req.user._id;
    var { post_id, language } = req.body;

    if (post_id) {
      var find_post = await post
        .findById(post_id)
        .where({ is_deleted: false, is_block: false })
        .populate("user_id")
        .populate("sub_interest_id")
        .populate({
          path: "repost_id",
          populate: {
            path: "user_id",
            select: "unique_name profile_url profile_picture full_name",
          },
        })
        .populate("interest_id");

      if (
        find_post?.user_id?.profile_picture &&
        !find_post?.user_id?.profile_picture.startsWith(process.env.BASE_URL)
      ) {
        find_post.user_id.profile_picture =
          process.env.BASE_URL + find_post.user_id.profile_picture;
      }
      if (
        find_post?.repost_id?.user_id?.profile_picture &&
        !find_post?.repost_id?.user_id?.profile_picture.startsWith(
          process.env.BASE_URL
        )
      ) {
        find_post.repost_id.user_id.profile_picture =
          process.env.BASE_URL + find_post.repost_id.user_id.profile_picture;
      }

      find_post?.post_media?.forEach((media) => {
        if (media.file_type === "image" || media.file_type === "video") {
          if (
            media?.file_name &&
            !media?.file_name.startsWith(process.env.BASE_URL)
          ) {
            media.file_name = process.env.BASE_URL + media.file_name;
          }
          if (
            media?.thumb_name &&
            !media?.thumb_name.startsWith(process.env.BASE_URL)
          ) {
            media.thumb_name = process.env.BASE_URL + media.thumb_name;
          }
        }
      });

      find_post?.repost_id?.post_media?.forEach((media) => {
        if (media.file_type === "image" || media.file_type === "video") {
          if (
            media?.file_name &&
            !media?.file_name.startsWith(process.env.BASE_URL)
          ) {
            media.file_name = process.env.BASE_URL + media.file_name;
          }
          if (
            media?.thumb_name &&
            !media?.thumb_name.startsWith(process.env.BASE_URL)
          ) {
            media.thumb_name = process.env.BASE_URL + media.thumb_name;
          }
        }
      });

      if (find_post?.is_repost == true || find_post?.is_repost == "true") {
        if (!Array.isArray(find_post)) {
          find_post = [find_post];
        }


        find_post = await Promise.all(
          find_post.map(async (data) => {
            const isLiked = await like_post.findOne({
              user_id: login_user_id,
              post_id: data._id,
            });
            const isSaved = await save_post.findOne({
              user_id: login_user_id,
              post_id: data._id,
            });
            const isPolled = await pollvotes.findOne({
              user_id: login_user_id,
              post_id: data._id,
            });
            var store_option_id = isPolled?.option_id;

            const is_view_impression = await user_impressions.findOne({
              user_id: login_user_id,
              post_id: data._id,
            });

            const is_view_Post = await view_post.findOne({
              user_id: login_user_id,
              post_id: data._id,
            });

            const is_repost_you_status = await post.findOne({
              user_id: login_user_id,
              repost_id: data?.repost_id?._id,
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
              is_repost_you: !!is_repost_you_status,
              is_view_impression: !!is_view_impression,
              is_view_Post: !!is_view_Post,
            };

            if (data.is_repost && data.repost_id) {
              const repostIsLiked = await like_post.findOne({
                user_id: login_user_id,
                post_id: data.repost_id._id,
              });
              const repostIsSaved = await save_post.findOne({
                user_id: login_user_id,
                post_id: data.repost_id._id,
              });
              const repostIsPolled = await pollvotes.findOne({
                user_id: login_user_id,
                post_id: data.repost_id._id,
              });
              var store_option_ids = repostIsPolled?.option_id;

              const is_repost_you_status = await post.findOne({
                user_id: login_user_id,
                repost_id: data?.repost_id?._id,
                is_deleted: false
              })

              const is_view_impression = await user_impressions.findOne({
                user_id: login_user_id,
                post_id: data.repost_id._id
              });

              const is_view_Post = await view_post.findOne({
                user_id: login_user_id,
                post_id: data.repost_id._id
              });

              updatedPost.repost_id = {
                ...data.repost_id.toObject(),
                is_like: !!repostIsLiked,
                is_save: !!repostIsSaved,
                is_poll_response: !!repostIsPolled,
                store_option_id: store_option_ids,
                is_repost_you: !!is_repost_you_status,
                is_view_impression: !!is_view_impression,
                is_view_Post: !!is_view_Post,
              };
            }

            return updatedPost;
          })
        );
        return successRes(res, `Post details get successfully`, find_post[0]);
      }
      if (!find_post) {
        return errorRes(res, "Couldn't found post");
      } else {
        const isLiked = await like_post.findOne({
          user_id: login_user_id,
          post_id: find_post._id,
        });
        const isSaved = await save_post.findOne({
          user_id: login_user_id,
          post_id: find_post._id,
        });
        const isPolled = await pollvotes.findOne({
          user_id: login_user_id,
          post_id: find_post._id,
        });

        const is_repost_you_status = await post.findOne({
          user_id: login_user_id,
          repost_id: find_post?._id,
          is_deleted: false,
          is_repost: true
        })
        var store_option_id = isPolled?.option_id;

        var find_repost = await post.find({
          repost_id: post_id,
          is_repost: true,
          is_deleted: false,
        });

        const is_view_impression = await user_impressions.findOne({
          user_id: user_id,
          post_id: find_post._id,
        });

        const is_view_Post = await view_post.findOne({
          user_id: user_id,
          post_id: find_post._id,
        });

        if (language === "hindi") {
          find_post.interest_id.interest = find_post.interest_id.hindi;
          find_post.sub_interest_id.sub_interest = find_post.sub_interest_id.hindi;
        } else if (language === "kannada") {
          find_post.interest_id.interest = find_post.interest_id.kannada;
          find_post.sub_interest_id.sub_interest = find_post.sub_interest_id.kannada;
        } else if (language === "telugu") {
          find_post.interest_id.interest = find_post.interest_id.telugu;
          find_post.sub_interest_id.sub_interest = find_post.sub_interest_id.telugu;
        }
        else if (language === "malayalam") {
          find_post.interest_id.interest = find_post.interest_id.malayalam;
          find_post.sub_interest_id.sub_interest = find_post.sub_interest_id.malayalam;
        }
        else if (language === "tamil") {
          find_post.interest_id.interest = find_post.interest_id.tamil;
          find_post.sub_interest_id.sub_interest = find_post.sub_interest_id.tamil;
        }
        find_post = {
          ...find_post._doc,
          repost: find_repost,
          is_like: !!isLiked,
          is_save: !!isSaved,
          is_poll_response: !!isPolled,
          store_option_id: store_option_id,
          is_repost_you: !!is_repost_you_status,
          is_view_impression: !!is_view_impression,
          is_view_Post: !!is_view_Post,
        };

        if (
          find_post?.user_id?.profile_picture &&
          !find_post?.user_id?.profile_picture.startsWith(process.env.BASE_URL)
        ) {
          find_post.user_id.profile_picture =
            process.env.BASE_URL + find_post.user_id.profile_picture;
        }

        find_post?.post_media?.forEach((media) => {
          if (media.file_type === "image" || media.file_type === "video") {
            if (
              media?.file_name &&
              !media?.file_name.startsWith(process.env.BASE_URL)
            ) {
              media.file_name = process.env.BASE_URL + media.file_name;
            }
            if (
              media?.thumb_name &&
              !media?.thumb_name.startsWith(process.env.BASE_URL)
            ) {
              media.thumb_name = process.env.BASE_URL + media.thumb_name;
            }
          }
        });

        return successRes(res, `Post details get successfully`, find_post);
      }
    }
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal Server Error!");
  }
};

const commentReport = async (req, res) => {
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

    var { comment_id, post_id, reason_comment_report } = req.body;

    var find_user = await users.findOne().where({
      _id: user_id,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, "This user does not exist");
    }

    var find_post = await post.findOne().where({
      _id: post_id,
      is_deleted: false,
      is_block: false
    });

    if (!find_post) {
      return errorRes(res, "This post does not exist");
    }

    var find_comment = await comment_post.findOne().where({
      _id: comment_id,
      is_deleted: false,
    });

    if (!find_comment) {
      return errorRes(res, "This comment  does not exist");
    }

    var create_report = await comment_report.create({
      user_id,
      comment_id,
      post_id,
      reason_comment_report,
    });

    if (create_report) {
      return successRes(
        res,
        "Comment report created successfully",
        create_report
      );
    }
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal Server Error!");
  }
};

const getUserPostlist = async (req, res) => {
  try {
    var login_user_id = req.user._id;

    var other_user_id = req.body.user_id;

    var { page = 1, limit = 10, is_repost, language } = req.body;

    const blockedUsers = await block_user.find({
      $or: [
        {
          user_id: login_user_id,
          is_deleted: false,
        },
        {
          block_user_id: login_user_id,
          is_deleted: false,
        },
      ],
    });

    var blockedUserIds = [];

    if (blockedUsers) {
      blockedUsers.map((block) => {
        if (block.block_user_id == login_user_id) {
          blockedUserIds.push(block.block_user_id);
        }

        if (block.user_id == login_user_id) {
          blockedUserIds.push(block.block_user_id);
        }
      });
    }
    if (is_repost == false || is_repost == "false") {
      var userPostsCount = await post.countDocuments({
        user_id: {
          $eq: other_user_id,
          $nin: blockedUserIds,
        },
        is_repost: false,
        is_block: false,
        is_deleted: false,
      });
      var find_post = await post
        .find()
        .where({
          user_id: {
            $eq: other_user_id,
            $nin: blockedUserIds,
          },
          is_repost: false,
          is_block: false,
          is_deleted: false,
        })
        .populate({
          path: "user_id",
          select:
            "profile_picture is_verified unique_name profile_url full_name",
        })
        .populate("sub_interest_id")
        .populate("interest_id")
        .sort({ createdAt: "desc" })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      if (!find_post || find_post.length === 0) {
        return successRes(res, "No posts found for this user", []);
      }
      find_post = await Promise.all(
        find_post.map(async (data) => {
          const isLiked = await like_post.findOne({
            user_id: login_user_id,
            post_id: data._id,
          });
          const isSaved = await save_post.findOne({
            user_id: login_user_id,
            post_id: data._id,
          });
          const isPolled = await pollvotes.findOne({
            user_id: login_user_id,
            post_id: data._id,
          });
          var store_option_id = isPolled?.option_id;

          const is_view_impression = await user_impressions.findOne({
            user_id: login_user_id,
            post_id: data._id,
          });

          const is_view_Post = await view_post.findOne({
            user_id: login_user_id,
            post_id: data._id,
          });

          const is_repost_you_status = await post.findOne({
            user_id: login_user_id,
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
            is_repost_you: !!is_repost_you_status,
            is_view_impression: !!is_view_impression,
            is_view_Post: !!is_view_Post,
          };
          return updatedPost;
        })
      );

      find_post?.forEach((post) => {
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

        post?.repost_id?.post_media?.forEach((media) => {
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
        "User post get successfully",
        find_post,
        userPostsCount
      );
    }

    if (is_repost == true || is_repost == "true") {
      var userrePostsCount = await post.countDocuments({
        user_id: {
          $eq: other_user_id,
          $nin: blockedUserIds,
        },
        is_deleted: false,
        is_block: false,
        is_repost: true,
      });

      var find_post = await post
        .find()
        .where({
          user_id: {
            $eq: other_user_id,
            $nin: blockedUserIds,
          },
          is_deleted: false,
          is_repost: true,
          is_block: false,
        })
        .populate({
          path: "user_id",
          select:
            "profile_picture is_verified unique_name profile_url full_name",
        })

        .populate("sub_interest_id")
        .populate("interest_id")
        .populate({
          path: "repost_id",
          populate: {
            path: "user_id",
            select:
              "profile_picture  is_verified unique_name profile_url full_name",
          },
        })
        .sort({ createdAt: "desc" })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      if (!find_post || find_post.length === 0) {
        return successRes(res, "No posts found for this user", []);
      }

      find_post = await Promise.all(
        find_post.map(async (data) => {
          const isLiked = await like_post.findOne({
            user_id: login_user_id,
            post_id: data._id,
          });
          const isSaved = await save_post.findOne({
            user_id: login_user_id,
            post_id: data._id,
          });
          const isPolled = await pollvotes.findOne({
            user_id: login_user_id,
            post_id: data._id,
          });
          var store_option_ids = isPolled?.option_id;

          const is_view_impression = await user_impressions.findOne({
            user_id: login_user_id,
            post_id: data._id,
          });

          const is_view_Post = await view_post.findOne({
            user_id: login_user_id,
            post_id: data._id,
          });

          const is_repost_you_status = await post.findOne({
            user_id: login_user_id,
            repost_id: data?.repost_id?._id,
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
            store_option_id: store_option_ids,
            is_repost_you: !!is_repost_you_status,
            is_view_impression: !!is_view_impression,
            is_view_Post: !!is_view_Post,
          };

          if (data.is_repost && data.repost_id) {
            const repostIsLiked = await like_post.findOne({
              user_id: login_user_id,
              post_id: data.repost_id._id,
            });
            const repostIsSaved = await save_post.findOne({
              user_id: login_user_id,
              post_id: data.repost_id._id,
            });
            const repostIsPolled = await pollvotes.findOne({
              user_id: login_user_id,
              post_id: data.repost_id._id,
            });
            var store_option_id = repostIsPolled?.option_id;

            const is_repost_you_status = await post.findOne({
              user_id: login_user_id,
              repost_id: data?.repost_id?._id,
              is_deleted: false
            })

            const is_view_impression = await user_impressions.findOne({
              user_id: login_user_id,
              post_id: data.repost_id._id
            });

            const is_view_Post = await view_post.findOne({
              user_id: login_user_id,
              post_id: data.repost_id._id
            });



            updatedPost.repost_id = {
              ...data.repost_id.toObject(),
              is_like: !!repostIsLiked,
              is_save: !!repostIsSaved,
              is_poll_response: !!repostIsPolled,
              store_option_id: store_option_id,
              is_repost_you: !!is_repost_you_status,
              is_view_impression: !!is_view_impression,
              is_view_Post: !!is_view_Post,
            };
          }

          return updatedPost;
        })
      );

      find_post?.forEach((post) => {
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

      return multiSuccessRes(
        res,
        "User repost get successfully",
        find_post,
        userrePostsCount
      );
    }
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal Server Error!");
  }
};

const undoRepost = async (req, res) => {
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
    var { repost_id, interest_id, sub_interest_id } = req.body;

    var find_repost = await post.findOne().where({
      repost_id: repost_id,
      user_id: user_id,
      is_repost: true,
      is_deleted: false
    })

    if (!find_repost) {
      return errorRes(res, "Could't found post");
    }

    await notifications.deleteMany
      ({
        post_id: find_repost?._id,
        is_deleted: false
      });

    await post.findByIdAndUpdate(
      { _id: repost_id },
      { $inc: { repost_count: -1 } },
      { new: true }
    );

    var delete_repost = await post.findOneAndDelete({
      repost_id: repost_id,
      user_id: user_id,
      is_repost: true,
      is_deleted: false,
    })

    await user_interactions.deleteOne({
      user_id: user_id,
      interest_id: interest_id,
      sub_interest_id: sub_interest_id,
    })

    if (delete_repost) {
      return successRes(
        res,
        "Repost Undo successfully",
        []
      );
    }

  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal Server Error!");
  }
};

const create_impressions = async (req, res) => {
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

    var { post_id } = req.body;

    var find_post = await post.findOne({ _id: post_id, is_deleted: false })

    if (!find_post) {
      return errorRes(res, "Couldn't found post");
    }

    var find_impression = await user_impressions.find({
      user_id,
      post_id,
      is_deleted: false
    })

    if (find_impression.length >= 1) {
      return errorRes(res, "You have already add your impression");
    }

    var create_data = await user_impressions.create(
      {
        user_id,
        post_id
      })

    await post.findByIdAndUpdate(post_id, { $inc: { impression_count: 1 }, });

    if (create_data) {
      return successRes(
        res,
        "Create user impressions successfully",
        create_data
      );
    }

  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal Server Error!");
  }
};

module.exports = {
  createPost,
  editPost,
  getAllPosts,
  savePost,
  removepostImage,
  deletePost,
  pollLike,
  likePost,
  getAllSavedPosts,
  getAllLikedPosts,
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
};