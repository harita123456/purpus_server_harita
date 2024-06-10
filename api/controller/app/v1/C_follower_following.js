const follower_following = require("../../../../models/M_follower_following");
const chat_room = require("../../../../models/M_chat_room");
const {
  successRes,
  errorRes,
  multiSuccessRes,
} = require("../../../../utils/common_fun");

const { dateTime } = require("../../../../utils/date_time");
const ObjectId = require("mongodb").ObjectId;
const {
  notiSendMultipleDevice,
} = require("../../../../utils/notification_send");

const user_session = require("../../../../models/M_user_session");

const users = require("../../../../models/M_user");
const notifications = require("../../../../models/M_notification");

const followUser = async (req, res) => {
  try {
    var user_id = req.user._id;
    var login_user_name = req.user.full_name;
    var login_user_profile_picture = req.user.profile_picture;

    var { following_id } = req.body;
    const currentDateTime = await dateTime();
    let find_login_data = await users
      .findById(user_id)
      .where({ is_deleted: false, is_block: false });

    if (!find_login_data) {
      return errorRes(res, `Couldn't found user id`);
    }

    let find_following_data = await users
      .findById(following_id)
      .where({ is_deleted: false, is_block: false });

    if (!find_following_data) {
      return errorRes(res, `Couldn't found following id`);
    }

    if (
      find_following_data?.is_private_account == true ||
      find_following_data?.is_private_account == "true"
    ) {
      let query = {
        user_id: user_id,
        following_id: following_id,
      };
      let request = {
        $set: {
          user_id: user_id,
          following_id: following_id,
          is_request: false,
          is_deleted: false,
        },
      };
      let options = { upsert: true, new: true };

      await follower_following.updateOne(query, request, options);

      var follow_request_data = await follower_following.findOne().where({
        user_id: user_id,
        following_id: following_id,
        is_request: false,
        is_deleted: false,
      });

      await notifications.deleteMany({
        sender_id: user_id,
        receiver_id: following_id,
        noti_for: { $in: ["started_following", "follow_request", "follow_request_accepted"] }
      });

      if (follow_request_data) {
        let noti_msg = login_user_name + " sent follow request to you";
        let noti_title = "Follow request";
        let noti_for = "follow_request";
        let noti_image = process.env.BASE_URL + login_user_profile_picture;
        let notiData = {
          noti_image,
          noti_msg,
          noti_title,
          noti_for,
          id: follow_request_data._id,
        };

        await notifications.create({
          noti_title,
          noti_msg: "sent follow request to you",
          noti_for,
          sender_id: user_id,
          receiver_id: following_id,
          is_accepted: null,
          noti_date: currentDateTime,
          created_at: currentDateTime,
          updated_at: currentDateTime,
        });

        var find_token_follow_request_data = await user_session.find({
          user_id: following_id,
          is_deleted: false,
        });

        var device_token_array = [];
        for (var value of find_token_follow_request_data) {
          var device_token = value.device_token;
          device_token_array.push(device_token);
        }

        if (device_token_array.length > 0) {
          notiData = { ...notiData, device_token: device_token_array };
          var noti_send = await notiSendMultipleDevice(notiData);
          if (noti_send.status == 200) {
            await users.findByIdAndUpdate(following_id, {
              $inc: {
                noti_badge: 1,
              },
            });
          }
        }
      }
      return successRes(
        res,
        `Follow request sent successfully`,
        follow_request_data
      );
    }

    let query = {
      user_id: user_id,
      following_id: following_id,
    };
    let request = {
      $set: {
        user_id: user_id,
        following_id: following_id,
        is_request: true,
        is_deleted: false,
      },
    };
    let options = { upsert: true, new: true };

    await follower_following.updateOne(query, request, options);

    var follow_request = await follower_following.findOne().where({
      user_id: user_id,
      following_id: following_id,
      is_request: true,
      is_deleted: false,
    });

    await chat_room.findOneAndUpdate(
      {
        user_id: following_id,
        other_user_id: user_id,
      },
      {
        $set: {
          is_requested: false,
        },
      },
      { new: true }
    );

    await notifications.deleteMany({
      sender_id: user_id,
      receiver_id: following_id,
      noti_for: { $in: ["started_following", "follow_request", "follow_request_accepted"] }
    });
    if (follow_request) {
      let noti_msg = login_user_name + " started following you";

      let noti_title = "New follower"
      let noti_for = "started_following";
      let noti_image = process.env.BASE_URL + login_user_profile_picture;
      let notiData = {
        noti_image,
        noti_msg,
        noti_title,
        noti_for,
        id: follow_request._id,
      };

      await notifications.create({
        noti_title,
        noti_msg: "started following you",
        noti_for,
        sender_id: user_id,
        receiver_id: following_id,
        is_accepted: true,
        follow_id: follow_request._id,
        noti_date: currentDateTime,
        created_at: currentDateTime,
        updated_at: currentDateTime,
      });

      var find_token_follow_request = await user_session.find({
        user_id: find_following_data._id,
        is_deleted: false,
      });

      var device_token_array = [];
      for (var value of find_token_follow_request) {
        var device_token = value.device_token;
        device_token_array.push(device_token);
      }

      if (device_token_array.length > 0) {
        notiData = { ...notiData, device_token: device_token_array };
        var noti_send = await notiSendMultipleDevice(notiData);
        if (noti_send.status == 200) {
          await users.findByIdAndUpdate(following_id, {
            $inc: {
              noti_badge: 1,
            },
          });
        }
      }
    }
    return successRes(res, `Followed successfully`, follow_request);
  } catch (error) {
    console.log(error);
    return errorRes(res, error.message);
  }
};

const unFollowUser = async (req, res) => {
  try {
    var user_id = req.user._id;
    var { following_user_id } = req.body;

    var user_detail = await follower_following.findOne().where({
      user_id: user_id,
      following_id: following_user_id,
      is_deleted: false,
    });

    if (!user_detail) {
      return errorRes(res, `Couldn't found record`);
    }
    if (user_detail) {
      var follow_id = user_detail._id;

      var unFollow_user = await follower_following.findByIdAndDelete(follow_id);

      await notifications.deleteMany({
        sender_id: user_id,
        receiver_id: following_user_id,
        noti_for: { $in: ["started_following"] }
      });

      if (unFollow_user) {
        return successRes(res, `User un-follow successfully`);
      } else {
        return errorRes(res, `Couldn't found user`);
      }
    }
  } catch (error) {
    console.log(error);
    return errorRes(res, "Internal Server Error!");
  }
};

const removeFollowUser = async (req, res) => {
  try {
    // if (!req.body.user_id) {
    //   var user_id = req.user._id;
    // } else {
    //   var user_id = req.body.user_id;
    // }
    let user_id
    if (!req.body.user_id) {
      user_id = req.user._id;
    } else {
      user_id = req.body.user_id;
    }
    var { follower_user_id } = req.body;

    var user_detail = await follower_following.findOne().where({
      user_id: follower_user_id,
      following_id: user_id,
      is_deleted: false,
    });

    if (!user_detail) {
      return errorRes(res, `Couldn't found record`);
    }

    await notifications.deleteMany({
      sender_id: follower_user_id,
      receiver_id: user_id,
      noti_for: { $in: ["started_following"] }
    });

    if (user_detail) {
      var follow_id = user_detail._id;

      var unFollow_user = await follower_following.findByIdAndDelete(follow_id);

      if (unFollow_user) {
        return successRes(res, `user removed successfully`);
      } else {
        return errorRes(res, `Couldn't found user`);
      }
    }
  } catch (error) {
    console.log(error);
    return errorRes(res, "Internal Server Error!");
  }
};

const acceptfollowrequest = async (req, res) => {
  try {
    var { noti_id, follow_status } = req.body;
    const currentDateTime = await dateTime();
    if (noti_id) {
      var noti_data = await notifications.findById(noti_id).where({
        is_deleted: false,
        is_accepted: null,
      });

      if (!noti_data) {
        return errorRes(res, `Couldn't found notification`);
      }

      let find_receiver_data = await users
        .findById(noti_data.receiver_id)
        .where({ is_deleted: false, is_block: false });

      let find_sender_data = await users
        .findById(noti_data.sender_id)
        .where({ is_deleted: false, is_block: false });

      if (follow_status == true || follow_status == "true") {
        var noti_update = await notifications
          .findByIdAndUpdate(
            { _id: noti_id, is_deleted: false, is_accepted: null },
            { $set: { is_accepted: true } },
            { new: true }
          )
          .populate({
            path: "sender_id",
            select:
              "unique_name full_name post_type profile_url profile_picture full_name",
          });

        var update_follower = await follower_following.findOneAndUpdate(
          {
            user_id: noti_update.sender_id,
            following_id: noti_update.receiver_id,
          },
          {
            $set: {
              is_request: true,
            },
          },
          { new: true }
        );

        await chat_room.findOneAndUpdate(
          {
            user_id: noti_update?.receiver_id,
            other_user_id: noti_update?.sender_id,
          },
          {
            $set: {
              is_requested: false,
            },
          },
          { new: true }
        );

        await notifications.deleteMany({
          sender_id: noti_update?.receiver_id,
          receiver_id: noti_update?.sender_id,
          noti_for: { $in: ["started_following", "follow_request_accepted"] }
        });

        if (update_follower) {
          let noti_msg =
            find_receiver_data.full_name + " accepted your follow request";

          let noti_title = "Request accepted";
          let noti_for = "follow_request_accepted";
          let noti_image =
            process.env.BASE_URL + find_receiver_data.profile_picture;

          let notiData = {
            noti_image,
            noti_msg,
            noti_title,
            noti_for,
            id: update_follower._id,
          };

          await notifications.create({
            noti_title,
            noti_msg: "accepted your follow request",
            noti_for,
            sender_id: noti_data.receiver_id,
            receiver_id: noti_data.sender_id,
            is_accepted: true,
            noti_date: currentDateTime,
            created_at: currentDateTime,
            updated_at: currentDateTime,
          });

          var find_token_update_follower = await user_session.find({
            user_id: noti_data.sender_id,
            is_deleted: false,
          });

          var device_token_array = [];
          for (var value of find_token_update_follower) {
            var device_token = value.device_token;
            device_token_array.push(device_token);
          }

          if (device_token_array.length > 0) {
            notiData = { ...notiData, device_token: device_token_array };
            var noti_send = await notiSendMultipleDevice(notiData);
            if (noti_send.status == 200) {
              await users.findByIdAndUpdate(find_sender_data._id, {
                $inc: {
                  noti_badge: 1,
                },
              });
            }

            if (noti_send.status == 401) {
              return errorRes(res, "Couldn't sent  notification");
            }
          }
        }

        return successRes(res, `request accepted successfully`, noti_update);
      } else {
        var noti_update = await notifications.findByIdAndUpdate(
          { _id: noti_id, is_deleted: false, is_accepted: null },
          { $set: { is_accepted: false } },
          { new: true }
        );

        await follower_following.findOneAndDelete(
          {
            user_id: noti_update.sender_id,
            following_id: noti_update.receiver_id,
          },
          {
            $set: {
              is_deleted: true,
            },
          },
          { new: true }
        );

        return successRes(res, `request decline successfully`, noti_update);
      }
    }
  } catch (error) {
    console.log(error);
    return errorRes(res, "Internal Server Error!");
  }
};

const followerList = async (req, res) => {
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
    var { search, page = 1, limit = 10 } = req.body;

    if (user_id) {
      let find_following_data = await users
        .findById(user_id)
        .where({ is_deleted: false, is_block: false });

      if (!find_following_data) {
        return errorRes(res, `Couldn't found user`);
      }
    }

    const pipeline_follow = [
      {
        $match: {
          following_id: new ObjectId(user_id),
          is_deleted: false,
          is_request: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $addFields: {
          followingFullNameMatch: {
            $regexMatch: {
              input: "$user.full_name",
              regex: new RegExp(search, "i"),
            },
          },
          followingUniqueNameMatch: {
            $regexMatch: {
              input: "$user.unique_name",
              regex: new RegExp(search, "i"),
            },
          },
        },
      },
      {
        $match: {
          $or: [
            { followingFullNameMatch: true },
            { followingUniqueNameMatch: true },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          user_id: "$user",
        },
      },
      {
        $skip: (page - 1) * parseInt(limit),
      },
      {
        $limit: parseInt(limit),
      },
    ];

    var follower_List = await follower_following.aggregate(pipeline_follow);
    const follower_count = await follower_following.countDocuments({
      following_id: user_id,
      is_deleted: false,
    });

    follower_List?.forEach((value) => {
      if (
        value?.user_id?.profile_picture &&
        !value?.user_id?.profile_picture.startsWith(process.env.BASE_URL)
      ) {
        value.user_id.profile_picture =
          process.env.BASE_URL + value.user_id.profile_picture;
      }

      if (
        value?.following_id?.profile_picture &&
        !value?.following_id?.profile_picture.startsWith(process.env.BASE_URL)
      ) {
        value.following_id.profile_picture =
          process.env.BASE_URL + value.following_id.profile_picture;
      }
    });

    follower_List = await Promise.all(
      follower_List?.map(async (value) => {
        const user_following_data = await follower_following.find({
          user_id: login_user_id,
          following_id: value?.user_id?._id,
          is_deleted: false,
          is_request: true,
        });

        const other_following_data = await follower_following.find({
          following_id: login_user_id,
          user_id: value?.user_id?._id,
          is_deleted: false,
          is_request: true,
        });

        var is_connection;

        if (user_following_data.length > 0 && other_following_data.length > 0) {
          is_connection = true;
        } else {
          is_connection = false;
        }

        var is_request;

        var follow_request_status = await follower_following.findOne().where({
          user_id: login_user_id,
          following_id: value?.user_id?._id,
          is_deleted: false,
          is_request: false,
        });

        if (follow_request_status) {
          is_request = false;
        }

        var follow_request_status_true = await follower_following
          .findOne()
          .where({
            user_id: login_user_id,
            following_id: value?.user_id?._id,
            is_deleted: false,
            is_request: true,
          });

        if (follow_request_status_true) {
          is_request = true;
        }

        if (!follow_request_status && !follow_request_status_true) {
          is_request = null;
        }
        const updateRes = {
          ...value,
          is_request: is_request,
          is_connection: is_connection
        };

        return updateRes;
      }))

    return multiSuccessRes(
      res,
      "Follower list get successfuly",
      follower_List,
      follower_count
    );
  } catch (error) {
    console.log(error);
    return errorRes(res, "Internal Server Error!");
  }
};

const followingList = async (req, res) => {
  try {
    var { user_id, search, page = 1, limit = 10 } = req.body;

    var login_user_id = req.user._id;

    if (user_id) {
      let find_following_data = await users
        .findById(user_id)
        .where({ is_deleted: false, is_block: false });

      if (!find_following_data) {
        return errorRes(res, `Couldn't found user`);
      }
    }
    const pipeline = [
      {
        $match: {
          user_id: new ObjectId(user_id),
          is_deleted: false,
          is_request: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "following_id",
          foreignField: "_id",
          as: "following",
        },
      },
      {
        $unwind: "$following",
      },
      {
        $addFields: {
          followingFullNameMatch: {
            $regexMatch: {
              input: "$following.full_name",
              regex: new RegExp(search, "i"),
            },
          },
          followingUniqueNameMatch: {
            $regexMatch: {
              input: "$following.unique_name",
              regex: new RegExp(search, "i"),
            },
          },
        },
      },
      {
        $match: {
          $or: [
            { followingFullNameMatch: true },
            { followingUniqueNameMatch: true },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          following_id: "$following",
          createdAt: 1
        },
      },
      {
        $skip: (page - 1) * parseInt(limit),
      },
      {
        $limit: parseInt(limit),
      },
      {
        $sort: { createdAt: -1 }
      }
    ];

    var following_List = await follower_following.aggregate(pipeline);
    const following_count = await follower_following.countDocuments({
      user_id: user_id,
      is_deleted: false,
      is_request: true,
    });

    following_List?.forEach((value) => {
      if (
        value?.user_id?.profile_picture &&
        !value?.user_id?.profile_picture.startsWith(process.env.BASE_URL)
      ) {
        value.user_id.profile_picture =
          process.env.BASE_URL + value.user_id.profile_picture;
      }

      if (
        value?.following_id?.profile_picture &&
        !value?.following_id?.profile_picture.startsWith(process.env.BASE_URL)
      ) {
        value.following_id.profile_picture =
          process.env.BASE_URL + value.following_id.profile_picture;
      }
    });

    following_List = await Promise.all(
      following_List?.map(async (value) => {
        const user_following_data = await follower_following.find({
          user_id: login_user_id,
          following_id: value?.following_id?._id,
          is_deleted: false,
          is_request: true,
        });

        const other_following_data = await follower_following.find({
          following_id: login_user_id,
          user_id: value?.following_id?._id,
          is_deleted: false,
          is_request: true,
        });

        var is_connection;

        if (user_following_data.length > 0 && other_following_data.length > 0) {
          is_connection = true;
        } else {
          is_connection = false;
        }
        var is_request;

        var follow_request_status = await follower_following.findOne().where({
          user_id: login_user_id,
          following_id: value?.following_id?._id,
          is_deleted: false,
          is_request: false,
        });

        if (follow_request_status) {
          is_request = false;
        }

        var follow_request_status_true = await follower_following
          .findOne()
          .where({
            user_id: login_user_id,
            following_id: value?.following_id?._id,
            is_deleted: false,
            is_request: true,
          });

        if (follow_request_status_true) {
          is_request = true;
        }

        if (!follow_request_status && !follow_request_status_true) {
          is_request = null;
        }

        const updateRes = {
          ...value,
          is_request: is_request,
          is_connection: is_connection
        };

        return updateRes;
      }))

    return multiSuccessRes(
      res,
      "Following list get successfuly",
      following_List,
      following_count
    );
  } catch (error) {
    console.log(error);
    return errorRes(res, "Internal Server Error!");
  }
};

module.exports = {
  followUser,
  unFollowUser,
  removeFollowUser,
  acceptfollowrequest,
  followerList,
  followingList,
};

