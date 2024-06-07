const group_chat = require("../../models/M_group_chat");
const users = require("../../models/M_user");
const user_session = require("../../models/M_user_session");
const notifications = require("../../models/M_notification");
const group = require("../../models/M_group");
const group_members = require("../../models/M_group_members");
const poll_vote = require("../../models/M_group_poll_votes");

const {
  notificationSend,
  notiSendMultipleDevice,
} = require("../../utils/notification_send");

const { dateTime } = require("../../utils/date_time");

const mongoose = require("mongoose");

module.exports = {
  chatGroupList: async (data) => {
    var { user_id } = data;

    var findMembers = await group_members.distinct("group_id", {
      user_id: user_id,
      is_deleted: false,
    });

    if (findMembers.length > 0) {
      var findGroups = await group
        .find({ _id: { $in: findMembers }, is_deleted: false })
        .select(
          "user_id group_name group_description is_deleted group_code group_image is_private interest_id sub_interest_id"
        )
        .populate({
          path: "user_id",
          select: "full_name profile_url profile_picture",
        });

      var groupList = await Promise.all(
        findGroups.map(async (value) => {
          var result = { ...value._doc };

          if (
            result?.group_image &&
            !result?.group_image.startsWith(process.env.BASE_URL)
          ) {
            result.group_image =
              process.env.BASE_URL + result.group_image;
          }

          if (
            result?.user_id?.profile_picture &&
            !result?.user_id?.profile_picture.startsWith(process.env.BASE_URL)
          ) {
            result.user_id.profile_picture =
              process.env.BASE_URL + result.user_id.profile_picture;
          }

          let memberCount = await group_members
            .find({ group_id: value._id, is_deleted: false })
            .countDocuments();

          result = {
            ...result,
            member_count: memberCount,
          };

          let findLastMsg = await group_chat
            .findOne()
            .where({
              group_id: value._id,
              is_delete_by: { $ne: user_id },
            })
            .sort({ createdAt: -1 });

          let unreadMessage = await group_chat.countDocuments({
            group_id: value._id,
            is_delete_by: { $ne: user_id },
            is_read_by: { $ne: user_id },
          });

          if (findLastMsg) {
            if (findLastMsg.message_type == "text") {
              var last_message = findLastMsg.message;
            } else {
              var last_message = "media";
            }
            var last_message_time = findLastMsg.message_time;
          } else {
            var last_message = null;
            var last_message_time = null;
          }

          result = {
            ...result,
            last_message,
            last_message_time,
            unread_message: unreadMessage,
          };

          return result;
        })
      );

      // date wise sorting
      await groupList.sort(function (a, b) {
        return new Date(b.last_message_time) - new Date(a.last_message_time);
      });

      return groupList;
    } else {
      let result = [];

      return result;
    }
  },

  sendGroupMessage: async (data) => {
    let {
      group_id,
      sender_id,
      reply_message_id,
      message,
      message_type,
      media_file,
      question,
      options,
    } = data;

    var findGroup = await group.findById(group_id).where({ is_deleted: false });

    if (findGroup) {
      var findMembers = await group_members.distinct("user_id", {
        group_id: group_id,
        is_deleted: false,
        user_id: { $ne: sender_id },
      });
      var memberCount = await group_members.distinct("user_id", {
        group_id: group_id,
        is_deleted: false,
      });

      let currentDateTime = await dateTime();

      let insertData = {
        group_id: group_id,
        sender_id: sender_id,
        reply_message_id: reply_message_id,
        receiver_ids: findMembers,
        message_time: currentDateTime,
        message: message,
        message_type: message_type,
        is_read_by: sender_id,
      };

      if (media_file) {
        insertData = {
          ...insertData,
          media_file: media_file,
        };
      }

      var image_array = [];

      if (message_type == "media" && Array.isArray(media_file)) {
        for (var value of media_file) {
          if (value.file_type == "image") {
            var files = {
              file_type: value.file_type,
              file_name: value.image_file,
            };
            image_array.push(files);
          }
          if (value.file_type == "image") {
            insertData = {
              ...insertData,
              media_file: image_array,
            };
          }

          if (value.file_type == "video") {
            var files = {
              file_type: value.file_type,
              video_name: value.video_name,
              thumbnail: value.thumbnail,
            };
            image_array.push(files);
          }
          if (value.file_type == "video") {
            insertData = {
              ...insertData,
              media_file: image_array,
            };
          }

          if (value.file_type == "audio") {
            var files = {
              file_type: value.file_type,
              audio_file: value.audio_file,
            };
            image_array.push(files);
          }

          if (value.file_type == "audio") {
            insertData = {
              ...insertData,
              media_file: image_array,
            };
          }
        }
      }

      if (options && typeof options === "string") {
        options = JSON.parse(options);
      }

      if (message_type == "poll") {
        insertData = {
          ...insertData,
          group_id: group_id,
          sender_id: sender_id,
          reply_message_id: reply_message_id,
          message_type,
          question,
          options: options,
        };
      }

      let addMessage = await group_chat.create(insertData);

      let getMessage = await group_chat
        .findById(addMessage._id)
        .populate({
          path: "sender_id",
          select: "full_name profile_url profile_picture",
        })
        .populate({
          path: "reply_message_id",
          model: "group_chat",
          select: "message message_time message_type media_file",
          populate: {
            path: "sender_id",
            select: "full_name",
          },
        });
      const baseUrl = process.env.BASE_URL;

      if (getMessage.sender_id.profile_picture) {
        getMessage.sender_id.profile_picture =
          baseUrl + getMessage.sender_id.profile_picture;
      }

      getMessage.media_file.forEach((media) => {
        if (media.file_name && !media.file_name.includes(baseUrl)) {
          media.file_name = baseUrl + media.file_name;
        }
        if (media.video_name && !media.video_name.includes(baseUrl)) {
          media.video_name = baseUrl + media.video_name;
        }
        if (media.thumbnail && !media.thumbnail.includes(baseUrl)) {
          media.thumbnail = baseUrl + media.thumbnail;
        }
        if (media.audio_file && !media.audio_file.includes(baseUrl)) {
          media.file_name = baseUrl + media.audio_file;
        }
      });

      getMessage.reply_message_id?.media_file.forEach((media) => {
        if (media.file_name && !media.file_name.includes(baseUrl)) {
          media.file_name = baseUrl + media.file_name;
        }
      });

      let get_sender_user = await users.findById(sender_id);

      if (findMembers) {
        let name = "";
        var img = "";

        if (get_sender_user != null) {
          name = get_sender_user.full_name;
          if (get_sender_user.profile_picture) {
            img = process.env.BASE_URL + get_sender_user.profile_picture;
          } else {
            img = get_sender_user.profile_url;
          }
        }

        var messageTemp;
        if (message) {
          messageTemp = message;
        } else {
          messageTemp = "media";
        }

        var group_room_data = await group
          .find()
          .where({
            _id: data.group_id,
            is_deleted: false,
          })
          .populate({
            path: "user_id",
            model: "users",
            select:
              "full_name is_online is_verified profile_url profile_picture",
          });

        if (
          group_room_data[0]?.user_id?.profile_picture &&
          !group_room_data[0]?.user_id?.profile_picture.startsWith(
            process.env.BASE_URL
          )
        ) {
          group_room_data[0].user_id.profile_picture =
            process.env.BASE_URL + group_room_data[0].user_id.profile_picture;
        }

        if (
          group_room_data[0]?.group_image &&
          !group_room_data[0]?.group_image.startsWith(process.env.BASE_URL)
        ) {
          group_room_data[0].group_image =
            process.env.BASE_URL + group_room_data[0].group_image;
        }

        var length = memberCount.length;
        const newData = group_room_data.map((item) => ({
          ...item._doc,
          member_count: length,
        }));

        let notiData = {
          noti_msg: messageTemp,
          noti_title: name,
          noti_type: "group_chat_noti",
          noti_for: "group_chat_noti",
          id: sender_id,
          details: newData[0],
        };

        const usersWithInScreenFalse = await group_members.find({
          group_id: group_id,
          in_screen: false,
          is_deleted: false,
        });
        const userIdsWithInScreenFalse = usersWithInScreenFalse.map(
          (user) => user.user_id
        );

        var find_user_device_token = await user_session.find().where({
          user_id: { $in: userIdsWithInScreenFalse },
          is_deleted: false,
        });

        var device_token_array = [];
        var user_id_array = [];
        for (var value of find_user_device_token) {
          var device_token = value.device_token;
          device_token_array.push(device_token);
          user_id_array.push(value._id);
        }

        findMembers.map(async (value) => {
          await users.findByIdAndUpdate(value, {
            $inc: {
              noti_badge: 1,
            },
          });
          user_id_array.push(value);
        });

        if (device_token_array != "") {
          notiData = { ...notiData, device_token: device_token_array };
          await notiSendMultipleDevice(notiData);
        }
      }

      return getMessage;
    }

    return null;
  },

  getGroupAllMessage: async (data) => {
    let { group_id, user_id, skip = 0, limit = 10 } = data;

    var findAllMessage = await group_chat
      .find({
        group_id: group_id,
      })
      .where({
        is_delete_by: { $ne: user_id },
      })
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 })
      .populate({
        path: "sender_id",
        select: "full_name profile_url profile_picture",
      })
      .populate({
        path: "reply_message_id",
        select: "sender_id message_time message message_type media_file",
        populate: {
          path: "sender_id",
          select: "full_name profile_url profile_picture",
        },
      });

    const baseUrl = process.env.BASE_URL;
    for (const value of findAllMessage) {
      if (!value.is_read_by.includes(user_id)) {
        value.is_read_by.push(user_id);
        await value.save();
      }

      if (
        value.sender_id &&
        value.sender_id.profile_picture &&
        !value.sender_id.profile_picture.includes(baseUrl)
      ) {
        value.sender_id.profile_picture =
          baseUrl + value.sender_id.profile_picture;
      }
      if (
        value.reply_message_id &&
        value.reply_message_id.sender_id &&
        value.reply_message_id.sender_id.profile_picture &&
        !value.reply_message_id.sender_id.profile_picture.includes(baseUrl)
      ) {
        value.reply_message_id.sender_id.profile_picture =
          baseUrl + value.reply_message_id.sender_id.profile_picture;
      }

      value.reply_message_id?.media_file.forEach((media) => {
        if (media.file_name && !media.file_name.includes(baseUrl)) {
          media.file_name = baseUrl + media.file_name;
        }
      });

      value.media_file.forEach((media) => {
        if (media.file_name && !media.file_name.includes(baseUrl)) {
          media.file_name = baseUrl + media.file_name;
        }
        if (media.video_name && !media.video_name.includes(baseUrl)) {
          media.video_name = baseUrl + media.video_name;
        }
        if (media.thumbnail && !media.thumbnail.includes(baseUrl)) {
          media.thumbnail = baseUrl + media.thumbnail;
        }
        if (media.audio_file && !media.audio_file.includes(baseUrl)) {
          media.file_name = baseUrl + media.audio_file;
        }
      });
    }

    findAllMessage = await Promise.all(
      findAllMessage.map(async (post) => {
        const isPolled = await poll_vote.findOne({
          user_id: user_id,
          group_id: group_id,
          group_chat_id: post._id,
        });
        var store_option_id = isPolled?.option_id;

        const updatedPost = {
          ...post.toObject(),
          is_poll_response: !!isPolled,
          store_option_id: store_option_id,
        };

        return updatedPost;
      })
    );

    return findAllMessage;
  },

  addVote: async (data) => {
    let { group_id, user_id, group_chat_id, option_id } = data;

    if (user_id) {
      var find_user = await users
        .findById(user_id)
        .where({ is_deleted: false });

      if (!find_user) {
        return "Couldn't found user";
      }
    }

    if (group_id) {
      var find_group = await group
        .findById(group_id)
        .where({ is_deleted: false });

      if (!find_group) {
        return "Couldn't found group";
      }
    }

    var existingVote = await poll_vote.findOne({
      user_id: user_id,
      group_chat_id: group_chat_id,
    });
    if (existingVote) {
      existingVote = {
        ...existingVote._doc,
        is_response: true,
      };
      return existingVote;
    }

    if (!existingVote) {
      const optionUpdate = {
        updateOne: {
          filter: { _id: group_chat_id, "options._id": option_id },
          update: { $inc: { "options.$.option_vote": 1 } },
        },
      };

      const counterUpdate = {
        updateOne: {
          filter: { _id: group_chat_id },
          update: { $inc: { vote_counter: 1 } },
        },
      };
      await group_chat.bulkWrite([
        optionUpdate,
        counterUpdate,
      ]);
      await poll_vote.create({
        user_id,
        group_id,
        group_chat_id,
        option_id,
      });
    }
    var find_post_data = await group_chat.findOne({ _id: group_chat_id });

    const options = find_post_data?.options;
    if (options != null) {
      const totalVotes = options?.reduce(
        (total, opt) => total + opt.option_vote,
        0
      );

      for (let i = 0; i < options.length; i++) {
        const option = options[i];
        option.option_percentage = parseFloat(
          ((option.option_vote / totalVotes) * 100 || 0).toFixed(2)
        );
      }

      await group_chat.updateOne(
        { _id: group_chat_id },
        { $set: { options } },
        { new: true }
      );
    }

    if (find_post_data) {
      return find_post_data;
    }
  },

  unreadGroupMessage: async (data) => {
    let { group_room_id, user_id } = data;

    var findMessage = await group_chat.find().where({
      group_id: group_room_id,
      is_read_by: { $ne: user_id }
    });

    if (
      findMessage
    ) {
      const filter = { group_id: group_room_id, is_read_by: { $ne: user_id } };
      const update = { $push: { is_read_by: user_id } }
      const result = await group_chat.updateMany(filter, update);
    }

    let result = { is_read: true };

    return result;
  },

  addScreenStatus: async (data) => {
    let { group_id, user_id, screen_status } = data;
    var update_screen = await group_members.findOneAndUpdate(
      { group_id: group_id, user_id: user_id },
      {
        $set: {
          in_screen: screen_status,
        },
      },
      { new: true }
    );
    return update_screen;
  },

  pollsDetails: async (data) => {
    try {
      let { poll_ids, user_id } = data;
      var poll_data = [];

      await Promise.all(
        poll_ids?.map(async (value) => {
          var find_group_datas = await group_chat.findOne({
            _id: value,
          })
            .populate({
              path: "sender_id",
              select: "full_name profile_url profile_picture",
            })

          if (
            find_group_datas?.sender_id?.profile_picture &&
            !find_group_datas?.sender_id?.profile_picture.startsWith(process.env.BASE_URL)
          ) {
            find_group_datas.sender_id.profile_picture =
              process.env.BASE_URL + find_group_datas.sender_id.profile_picture;
          }

          poll_data.push(find_group_datas);
        })
      );

      poll_data = await Promise.all(
        poll_data.map(async (post) => {
          const isPolled = await poll_vote.findOne({
            user_id: user_id,
            group_id: post?.group_id,
            group_chat_id: post._id
          });
          var store_option_id = isPolled?.option_id;

          const updatedPost = {
            ...post.toObject(),
            is_poll_response: !!isPolled,
            store_option_id: store_option_id,
          };

          return updatedPost;
        })
      );
      return poll_data;
    } catch (error) {
      console.log("error", error.message);
      throw new Error(error.message);
    }
  }
};
