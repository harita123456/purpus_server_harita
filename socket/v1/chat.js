const chat_room = require("../../models/M_chat_room");
const chat = require("../../models/M_chat");
const users = require("../../models/M_user");
const user_session = require("../../models/M_user_session");
const user_interactions = require("../../models/M_user_interactions");

const os = require("os");

const pollvotes = require("../../models/M_poll_votes");

const follower_following = require("../../models/M_follower_following");
const block_user = require("../../models/M_block_user");
const post = require("../../models/M_post");
const {
  notiSendMultipleDevice,
} = require("../../utils/notification_send");

const { dateTime } = require("../../utils/date_time");

const { pool } = require("../../config/database");

function performQuery(query, params) {
  return new Promise((resolve, reject) => {
    pool.query(query, params, (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
}

module.exports = {
  createRoom: async (data) => {
    let { user_id, other_user_id } = data;

    let room_code = Math.floor(100000 + Math.random() * 900000);

    var cond1 = {
      user_id: user_id,
      other_user_id: other_user_id,
    };
    var cond2 = {
      user_id: other_user_id,
      other_user_id: user_id,
    };

    var follow_request_data = await follower_following.findOne().where({
      user_id: other_user_id,
      following_id: user_id,
      is_request: true,
      is_deleted: false,
    });

    if (follow_request_data != null) {
      var createData = {
        user_id: user_id,
        other_user_id: other_user_id,
        room_code: room_code,
      };
    } else {
      var createData = {
        user_id: user_id,
        other_user_id: other_user_id,
        room_code: room_code,
        is_requested: true,
      };
    }
    let findRoomFirst = await chat_room
      .findOne(cond1)
      .populate({
        path: "user_id",
        select:
          "full_name unique_name profile_url profile_picture is_online socket_id device_type ",
      })
      .populate({
        path: "other_user_id",
        select:
          "full_name unique_name profile_url profile_picture is_online socket_id device_type ",
      });

    let findRoomSecond = await chat_room
      .findOne(cond2)
      .populate({
        path: "user_id",
        select:
          "full_name unique_name profile_url profile_picture is_online socket_id device_type ",
      })
      .populate({
        path: "other_user_id",
        select:
          "full_name unique_name profile_url profile_picture is_online socket_id device_type ",
      });

    let findRoom = findRoomFirst ? findRoomFirst : findRoomSecond;

    if (findRoom) {
      if (findRoom?.user_id?.profile_picture) {
        findRoom.user_id.profile_picture =
          process.env.BASE_URL + findRoom.user_id.profile_picture;
      }

      if (findRoom?.other_user_id?.profile_picture) {
        findRoom.other_user_id.profile_picture =
          process.env.BASE_URL + findRoom.other_user_id.profile_picture;
      }

      return findRoom;
    } else {
      let createNewRoom = await chat_room.create(createData);

      let findRoomdata = await chat_room
        .findOne(createNewRoom._id)
        .populate({
          path: "user_id",
          select:
            "full_name unique_name profile_url profile_picture is_online socket_id device_type ",
        })
        .populate({
          path: "other_user_id",
          select:
            "full_name unique_name profile_url profile_picture is_online socket_id device_type ",
        });
      if (findRoomdata?.user_id?.profile_picture) {
        findRoomdata.user_id.profile_picture =
          process.env.BASE_URL + findRoomdata.user_id.profile_picture;
      }

      if (findRoomdata?.other_user_id?.profile_picture) {
        findRoomdata.other_user_id.profile_picture =
          process.env.BASE_URL + findRoomdata.other_user_id.profile_picture;
      }

      return findRoomdata;
    }
  },

  chatUserList: async (data) => {
    var { user_id, search } = data;

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

    var match_condition = {
      $and: [
        {
          $or: [{ user_id: user_id }, { other_user_id: user_id }],
        },
        {
          $or: [
            { is_requested: { $ne: true } },
            { other_user_id: { $ne: user_id } },
          ],
        },
        { other_user_id: { $nin: blockedUserIds } },
        { user_id: { $nin: blockedUserIds } },

        {
          is_deleted: false,
        },
      ],
    };

    var findRoom = await chat_room
      .find(match_condition)
      .select("user_id other_user_id room_code is_deleted")
      .populate({
        path: "user_id",
        select:
          "unique_name full_name profile_url profile_picture is_online is_verified",
      })
      .populate({
        path: "other_user_id",
        select:
          "unique_name full_name profile_url profile_picture is_online is_verified",
      });

    var UserList = await Promise.all(
      findRoom.map(async (value) => {
        var result = { ...value._doc };

        let findLastMsg = await chat
          .findOne()
          .where({
            chat_room_id: value._id,
            is_delete_by: { $ne: user_id },
          })
          .sort({ createdAt: -1 });
        let unreadMessage = await chat.countDocuments({
          chat_room_id: value._id,
          is_delete_by: { $ne: user_id },
          receiver_id: user_id,
          is_read: false,
        });

        if (findLastMsg) {
          if (findLastMsg.message_type == "text") {
            var last_message = findLastMsg.message;
          } else {
            var last_message = "media";
          }
          if (findLastMsg.message_type == "post") {
            var last_message = "post";
          }
          var last_message_time = findLastMsg.message_time;
        } else {
          var last_message = null;
          var last_message_time = null;
        }

        if (value.user_id == user_id) {
          var other_user = value.other_user_id;
        } else {
          var other_user = value.user_id;
        }

        let findOtherUser = await users
          .findById(other_user)
          .select("_id full_name profile_picture profile_url  is_verified");

        if (findOtherUser) {
          result = {
            ...result,
            user_name: findOtherUser.user_name,
            profile_picture: findOtherUser.profile_picture,
            profile_url: findOtherUser.profile_url,
          };
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
    UserList.forEach((value) => {
      if (value?.user_id?.profile_picture) {
        if (
          !value?.user_id?.profile_picture.startsWith(process.env.BASE_URL) &&
          value?.user_id?.profile_picture !== null
        ) {
          value.user_id.profile_picture =
            process.env.BASE_URL + value.user_id.profile_picture;
        }
      }

      if (value?.other_user_id?.profile_picture) {
        if (
          !value?.other_user_id?.profile_picture.startsWith(
            process.env.BASE_URL
          ) &&
          value?.other_user_id?.profile_picture !== null
        ) {
          value.other_user_id.profile_picture =
            process.env.BASE_URL + value.other_user_id.profile_picture;
        }
      }
    });

    if (search) {
      UserList = UserList.filter(
        (user) =>
          (user?.user_id?._id.toString() !== user_id &&
            user?.user_id?.full_name
              .toLowerCase()
              .includes(search.toLowerCase())) ||
          (user?.other_user_id?._id.toString() !== user_id &&
            user?.other_user_id?.full_name
              .toLowerCase()
              .includes(search.toLowerCase()))
      );
    }
    UserList = UserList.filter((user) => user?.last_message !== null);

    await UserList.sort(function (a, b) {
      return new Date(b.last_message_time) - new Date(a.last_message_time);
    });
    return UserList;
  },

  sendMessage: async (data) => {
    let {
      chat_room_id,
      sender_id,
      receiver_id,
      message,
      message_type,
      reply_message_id,
      media_file,
      replied_message_media,
    } = data;

    let currentDateTime = await dateTime();

    let insertData = {
      chat_room_id: chat_room_id,
      sender_id: sender_id,
      receiver_id: receiver_id,
      message_time: currentDateTime,
      message: message,
      message_type: message_type,
      created_at: currentDateTime,
      updated_at: currentDateTime,
    };

    let image_array = [];

    if (reply_message_id != undefined) {
      let find_message = await chat.findById(reply_message_id);

      if (find_message?.message_type == "text") {
        insertData = {
          ...insertData,
          reply_message_id: reply_message_id,
        };
      }

      if (message_type == "voice") {
        for (var value of media_file) {
          if (value.file_type == "audio") {
            var files = {
              file_type: value.file_type,
              file_name: value.audio_file,
            };
            image_array.push(files);
            insertData = {
              ...insertData,
              media_file: image_array,
            };
          }
        }
      }
      if (find_message?.message_type === "media") {
        const store = find_message?.media_file.filter((data) =>
          replied_message_media?.includes(String(data?._id.valueOf()))
        );

        if (store.length > 0) {
          insertData = {
            ...insertData,
            reply_message_id: reply_message_id,
            replied_message_media: store,
          };
        } else {
          insertData = {
            ...insertData,
            reply_message_id: reply_message_id,
          };
        }
      }

      if (find_message?.message_type == "video") {
        find_message?.media_file.map((data) => {
          if (replied_message_media == data?._id) {
            var store = [];
            store.push(data);
            insertData = {
              ...insertData,
              reply_message_id: reply_message_id,
              replied_message_media: store,
            };
          }
        });
      }

      if (find_message?.message_type == "audio") {
        find_message?.media_file.map((data) => {
          if (replied_message_media == data?._id) {
            var store = [];
            store.push(data);
            insertData = {
              ...insertData,
              reply_message_id: reply_message_id,
              replied_message_media: store,
            };
          }
        });
      }
    }

    if (message_type == "emoji") {
      var files = {
        file_type: "emoji",
        file_name: file_url,
      };

      image_array.push(files);
    }

    if (message_type == "gif") {
      var files = {
        file_type: "image",
        file_name: file_url,
      };

      image_array.push(files);
    }

    if (message_type == "voice") {
      for (var value of media_file) {
        if (value.file_type == "audio") {
          var files = {
            file_type: value.file_type,
            file_name: value.audio_file,
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

    let sender_socket_id = await users.findById(sender_id);
    var check_room_data = await chat_room.findById(chat_room_id);

    let receiver_socket_id = await users.findById(receiver_id);

    if (
      check_room_data?.screen_user_status == true &&
      check_room_data?.screen_otheruser_status == true
    ) {
      insertData = {
        ...insertData,
        is_read: true,
      };
    } else {
      insertData = {
        ...insertData,
        is_read: false,
      };
    }

    let addMessage = await chat.create(insertData);

    let getMessage = await chat
      .findById(addMessage._id)
      .populate({
        path: "reply_message_id",
        model: "chat",
        populate: {
          path: "sender_id receiver_id",
          select: "full_name is_online is_verified profile_url profile_picture",
        },
      })
      .populate({
        path: "sender_id",
        model: "users",
        select: "full_name is_online is_verified profile_url profile_picture",
      })
      .populate({
        path: "receiver_id",
        model: "users",
        select: "full_name is_online is_verified profile_url profile_picture",
      });

    getMessage = {
      ...getMessage._doc,
      sender_socket_id: sender_socket_id?.socket_id,
      receiver_socket_id: receiver_socket_id?.socket_id,
    };
    let get_receiver_user = await users.findById(receiver_id).where({
      is_deleted: false,
    });

    let get_sender_user = await users.findById(sender_id);

    if (get_receiver_user) {
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
      var chat_room_data = await chat_room
        .find()
        .where({
          _id: data.chat_room_id,
          is_deleted: false,
        })
        .populate({
          path: "user_id",
          model: "users",
          select: "full_name is_online is_verified profile_url profile_picture",
        })
        .populate({
          path: "other_user_id",
          model: "users",
          select: "full_name is_online is_verified profile_url profile_picture",
        });

      if (
        chat_room_data[0]?.user_id?.profile_picture &&
        !chat_room_data[0]?.user_id?.profile_picture.startsWith(
          process.env.BASE_URL
        )
      ) {
        chat_room_data[0].user_id.profile_picture =
          process.env.BASE_URL + chat_room_data[0].user_id.profile_picture;
      }

      if (
        chat_room_data[0]?.other_user_id?.profile_picture &&
        !chat_room_data[0]?.other_user_id?.profile_picture.startsWith(
          process.env.BASE_URL
        )
      ) {
        chat_room_data[0].other_user_id.profile_picture =
          process.env.BASE_URL +
          chat_room_data[0].other_user_id.profile_picture;
      }

      let notiData = {
        noti_msg: messageTemp,
        noti_title: name,
        noti_type: "chat_noti",
        noti_for: "chat_noti",
        id: sender_id,
        chat_room_id: chat_room_id,
        details: chat_room_data[0],
      };

      if (get_receiver_user) {
        if (
          get_receiver_user.device_token != "" ||
          get_receiver_user.device_token != null
        ) {
          var find_token = await user_session.find({
            user_id: get_receiver_user?._id,
            is_deleted: false,
          });

          var device_token_array = [];
          for (var value of find_token) {
            var device_token = value.device_token;
            device_token_array.push(device_token);
          }
          notiData = { ...notiData, device_token: device_token_array };

          if (device_token_array.length > 0) {
            if (
              get_receiver_user?._id.equals(chat_room_data[0]?.user_id?._id)
            ) {
              if (chat_room_data[0].screen_user_status == false) {
                await notiSendMultipleDevice(notiData);
              }
            }
          }
          if (device_token_array.length > 0) {
            if (
              get_receiver_user?._id.equals(
                chat_room_data[0]?.other_user_id?._id
              )
            ) {
              if (chat_room_data[0].screen_otheruser_status == false) {
                await notiSendMultipleDevice(notiData);
              }
            }
          }
        }
      }
    }

    if (
      getMessage?.sender_id?.profile_picture &&
      !getMessage?.sender_id?.profile_picture.startsWith(process.env.BASE_URL)
    ) {
      getMessage.sender_id.profile_picture =
        process.env.BASE_URL + getMessage.sender_id.profile_picture;
    }

    if (
      getMessage?.receiver_id?.profile_picture &&
      !getMessage?.receiver_id?.profile_picture.startsWith(process.env.BASE_URL)
    ) {
      getMessage.receiver_id.profile_picture =
        process.env.BASE_URL + getMessage.receiver_id.profile_picture;
    }

    if (getMessage?.replied_message_media[0])
      if (getMessage?.replied_message_media) {
        if (getMessage.replied_message_media[0]?.file_type == "image") {
          getMessage.replied_message_media[0].file_name =
            process.env.BASE_URL +
            getMessage.replied_message_media[0].file_name;
        }
        if (getMessage.replied_message_media[0]?.file_type == "video") {
          (getMessage.replied_message_media[0].video_name =
            process.env.BASE_URL +
            getMessage.replied_message_media[0]?.video_name),
            (getMessage.replied_message_media[0].thumbnail =
              process.env.BASE_URL +
              getMessage.replied_message_media[0].thumbnail);
        }
        if (getMessage.replied_message_media[0]?.file_type == "audio") {
          getMessage.replied_message_media[0].audio_file =
            process.env.BASE_URL +
            getMessage.replied_message_media[0].audio_file;
        }
      }

    if (getMessage.message_type == "media") {
      getMessage.media_file.map((value) => {
        if (value?.file_type == "image") {
          if (value?.file_name) {
            value.file_name = process.env.BASE_URL + value.file_name;
          }
        }
        if (value?.file_type == "video") {
          if (value?.video_name) {
            (value.video_name = process.env.BASE_URL + value.video_name),
              (value.thumbnail = process.env.BASE_URL + value.thumbnail);
          }
        }
        if (value?.file_type == "audio") {
          if (value?.audio_file) {
            value.audio_file = process.env.BASE_URL + value.audio_file;
          }
        }
      });
    }

    if (getMessage.message_type == "voice") {
      getMessage.media_file.map((value) => {
        if (value?.file_type == "audio") {
          if (value?.file_name) {
            value.file_name = process.env.BASE_URL + value.file_name;
          }
        }
      });
    }

    return getMessage;
  },

  getAllMessage: async (data) => {
    let { chat_room_id, user_id, skip = 0, limit = 100 } = data;

    let findAllMessage = await chat
      .find({ chat_room_id: chat_room_id })
      .where({ is_delete_by: { $ne: user_id } })
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 })
      .populate({
        path: "reply_message_id",
        model: "chat",
        populate: {
          path: "sender_id receiver_id",
          select: "full_name",
        },
      })
      .populate({
        path: "sender_id",
        model: "users",
        select: "unique_name full_name profile_url profile_picture is_online ",
      })
      .populate({
        path: "post_id",
        model: "post",
        select:
          "user_id title description post_media post_type question store_option_id options vote_counter link_url",
        populate: {
          path: "user_id",
          model: "users",
          select: "full_name profile_picture profile_url",
        },
      })
      .populate({
        path: "receiver_id",
        model: "users",
        select: "unique_name full_name profile_url profile_picture is_online",
      });

    await chat.updateMany(
      { chat_room_id: chat_room_id, receiver_id: user_id },
      { $set: { is_read: true } }
    );

    if (findAllMessage) {
      findAllMessage.map((data) => {
        if (
          data?.sender_id?.profile_picture &&
          !data?.sender_id?.profile_picture.startsWith(process.env.BASE_URL)
        ) {
          data.sender_id.profile_picture =
            process.env.BASE_URL + data.sender_id.profile_picture;
        }

        if (
          data?.receiver_id?.profile_picture &&
          !data?.receiver_id?.profile_picture.startsWith(process.env.BASE_URL)
        ) {
          data.receiver_id.profile_picture =
            process.env.BASE_URL + data.receiver_id.profile_picture;
        }

        if (
          data?.post_id?.user_id?.profile_picture &&
          !data?.post_id?.user_id?.profile_picture.startsWith(
            process.env.BASE_URL
          )
        ) {
          data.post_id.user_id.profile_picture =
            process.env.BASE_URL + data.post_id.user_id.profile_picture;
        }

        if (data?.post_id?.post_media) {
          data.post_id.post_media.map((media) => {
            if (
              media?.file_type === "image" &&
              media?.file_name &&
              !media.file_name.startsWith(process.env.BASE_URL)
            ) {
              media.file_name = process.env.BASE_URL + media.file_name;
            }
            if (
              media?.file_type === "video" &&
              media?.file_name &&
              !media.file_name.startsWith(process.env.BASE_URL)
            ) {
              media.file_name = process.env.BASE_URL + media.file_name;
              media.thumb_name = process.env.BASE_URL + media.thumb_name;
            }
          });
        }

        if (data?.replied_message_media[0])
          if (data?.replied_message_media) {
            if (data.replied_message_media[0]?.file_type == "image") {
              data.replied_message_media[0].file_name =
                process.env.BASE_URL + data.replied_message_media[0].file_name;
            }
            if (data.replied_message_media[0]?.file_type == "video") {
              (data.replied_message_media[0].video_name =
                process.env.BASE_URL +
                data.replied_message_media[0]?.video_name),
                (data.replied_message_media[0].thumbnail =
                  process.env.BASE_URL +
                  data.replied_message_media[0].thumbnail);
            }
            if (data.replied_message_media[0]?.file_type == "audio") {
              data.replied_message_media[0].audio_file =
                process.env.BASE_URL + data.replied_message_media[0].audio_file;
            }
          }

        if (data.message_type == "media") {
          data.media_file.map((value) => {
            if (value?.file_type == "image") {
              if (value?.file_name) {
                value.file_name = process.env.BASE_URL + value.file_name;
              }
            }
            if (value?.file_type == "video") {
              if (value?.video_name) {
                (value.video_name = process.env.BASE_URL + value.video_name),
                  (value.thumbnail = process.env.BASE_URL + value.thumbnail);
              }
            }
            if (value?.file_type == "audio") {
              if (value?.audio_file) {
                value.audio_file = process.env.BASE_URL + value.audio_file;
              }
            }
          });
        }
        if (data.message_type == "voice") {
          data.media_file.map((value) => {
            if (value?.file_type == "audio") {
              if (value?.file_name) {
                value.file_name = process.env.BASE_URL + value.file_name;
              }
            }
          });
        }
      });
    }

    findAllMessage = await Promise.all(
      findAllMessage.map(async (post) => {
        if (post && post.post_id) {
          const isPolled = await pollvotes.findOne({
            user_id: user_id,
            post_id: post.post_id?._id,
          });

          var store_option_id = isPolled?.option_id;

          const updatedPost = {
            ...post._doc,
            post_id: {
              ...post.post_id._doc,
              is_poll_response: !!isPolled,
              store_option_id: store_option_id,
            },
          };

          return updatedPost;
        } else {
          return post;
        }
      })
    );
    return findAllMessage;
  },

  deleteChat: async (data) => {
    let { chat_room_id, user_id } = data;

    let deleteChatData = await chat.find({ chat_room_id: chat_room_id });
    if (deleteChatData) {
      var delete_data = { is_delete_by: user_id };

      await chat
        .updateMany({ chat_room_id: chat_room_id }, { $push: delete_data })
        .where({ is_delete_by: { $ne: user_id } });
    }
    let result = { id_deleted: true };

    return result;
  },

  deleteOneChat: async (data) => {
    let { chat_id, user_id } = data;

    let deleteAllsChats = await chat.find({ _id: chat_id });
    if (deleteAllsChats) {
      var delete_data = { is_delete_by: user_id };

      await chat.updateOne({ _id: chat_id }, { $push: delete_data });

      let result = { id_deleted: true };

      return result;
    }
  },

  unreadMessage: async (data) => {
    let { chat_room_id, user_id } = data;

    await chat.updateMany(
      { chat_room_id: chat_room_id, receiver_id: user_id, is_read: false },
      { $set: { is_read: true } },
      { new: true }
    );

    let result = { is_read: true };

    return result;
  },

  setSocketId: async (data) => {
    try {
      const user = await users.findOne({ _id: data.user_id });

      if (user) {
        const valuedata = [(is_online = true), data.user_id.toString()];

        const updatedata = await performQuery(
          "UPDATE user SET is_online = ? WHERE identifier = ?",
          valuedata
        );

        console.log("updatedata", updatedata);
        var updatedMessage = await users.findByIdAndUpdate(
          { _id: data.user_id },
          {
            $set: {
              socket_id: data.socket_data,
            },
          },
          { new: true }
        );

        return updatedMessage;
      }
    } catch (error) {
      console.log("error", error.message);
      throw new Error(error.message);
    }
  },

  disconnectSocket: async (data) => {
    try {
      const user = await users.findOne({ socket_id: data });

      const new_date = new Date();

      console.log("user--------------", user);

      if (user) {
        var updatedMessage = await users.updateOne(
          { socket_id: data },
          {
            $set: {
              is_online: false,
              socket_id: null,
              user_last_active_date: new_date,
            },
          },
          { new: true }
        );

        const datavalue = [
          (is_online = false),
          (last_seen = new Date()),
          (identifier = user._id.toString()),
        ];

        const updatedata = await performQuery(
          "UPDATE user SET is_online = ?,last_seen= ? WHERE identifier = ?",
          datavalue
        );

        console.log("updatedata  in disconnect", updatedata);
        return updatedMessage;
      }
    } catch (error) {
      console.log("error", error.message);
      throw new Error(error.message);
    }
  },

  screenUserCheck: async (data) => {
    try {
      let find_chat_room = await chat_room.find().where({
        _id: data.chat_room_id,
      });

      var store_user_id = find_chat_room[0].user_id;
      var store_other_userid = find_chat_room[0].other_user_id;

      var final_result;

      if (store_user_id.equals(data.user_id)) {
        let updateStatus = {
          screen_user_status: data.screen_status,
          updated_At: new Date(),
        };
        var updateData = await chat_room.findByIdAndUpdate(
          data.chat_room_id,
          updateStatus,
          {
            new: true,
          }
        );

        var find_unread_message = await chat.find({
          chat_room_id: data.chat_room_id,
          receiver_id: data.user_id,
          is_read: false,
        });

        final_result = {
          ...final_result,
          find_unread_message,
        };
        await chat.updateMany(
          {
            chat_room_id: data.chat_room_id,
            receiver_id: data.user_id,
            is_read: false,
          },
          { $set: { is_read: true } },
          { new: true }
        );

        return updateData;
      }
      if (store_other_userid.equals(data.user_id)) {
        let updateStatus = {
          screen_otheruser_status: data.screen_status,
          updated_At: new Date(),
        };
        var updateData = await chat_room.findByIdAndUpdate(
          data.chat_room_id,
          updateStatus,
          {
            new: true,
          }
        );

        var find_unread_message = await chat.find({
          chat_room_id: data.chat_room_id,
          receiver_id: data.user_id,
          is_read: false,
        });
        final_result = {
          ...final_result,
          find_unread_message,
        };

        await chat.updateMany(
          {
            chat_room_id: data.chat_room_id,
            receiver_id: data.user_id,
            is_read: false,
          },
          { $set: { is_read: true } },
          { new: true }
        );

        return updateData;
      }
    } catch (error) {
      console.log("error", error.message);
      throw new Error(error.message);
    }
  },

  requesteList: async (data) => {
    var { user_id } = data;

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
    var match_condition = {
      $and: [
        { other_user_id: user_id },
        { user_id: { $nin: blockedUserIds } },
        { other_user_id: { $nin: blockedUserIds } },
        { is_deleted: false },
        { is_requested: true },
      ],
    };

    var findRoom = await chat_room
      .find(match_condition)
      .select("user_id other_user_id room_code is_deleted is_requested")
      .populate({
        path: "user_id",
        select: "unique_name full_name profile_url profile_picture is_online",
      })
      .populate({
        path: "other_user_id",
        select: "unique_name full_name profile_url profile_picture is_online",
      });

    var UserList = await Promise.all(
      findRoom.map(async (value) => {
        var result = { ...value._doc };

        let findLastMsg = await chat
          .findOne()
          .where({
            chat_room_id: value._id,
            is_delete_by: { $ne: user_id },
          })
          .sort({ createdAt: -1 });
        let unreadMessage = await chat.countDocuments({
          chat_room_id: value._id,
          is_delete_by: { $ne: user_id },
          receiver_id: user_id,
          is_read: false,
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

        if (value.user_id == user_id) {
          var other_user = value.other_user_id;
        } else {
          var other_user = value.user_id;
        }

        let findOtherUser = await users
          .findById(other_user)
          .select("_id full_name profile_picture profile_url");

        if (findOtherUser) {
          result = {
            ...result,
            user_name: findOtherUser.user_name,
            profile_picture: findOtherUser.profile_picture,
            profile_url: findOtherUser.profile_url,
          };
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
    UserList.forEach((value) => {
      if (value?.user_id?.profile_picture) {
        if (
          !value?.user_id?.profile_picture.startsWith(process.env.BASE_URL) &&
          value?.user_id?.profile_picture !== null
        ) {
          value.user_id.profile_picture =
            process.env.BASE_URL + value.user_id.profile_picture;
        }
      }

      if (value?.other_user_id?.profile_picture) {
        if (
          !value?.other_user_id?.profile_picture.startsWith(
            process.env.BASE_URL
          ) &&
          value?.other_user_id?.profile_picture !== null
        ) {
          value.other_user_id.profile_picture =
            process.env.BASE_URL + value.other_user_id.profile_picture;
        }
      }
    });

    UserList = UserList.filter((user) => user?.last_message !== null);

    await UserList.sort(function (a, b) {
      return new Date(b.last_message_time) - new Date(a.last_message_time);
    });

    return UserList;
  },

  requestAccept: async (data) => {
    var { user_id, chat_room_id } = data;

    var match_condition = {
      other_user_id: user_id,
      is_deleted: false,
      is_requested: true,
    };

    var findRoom = await chat_room
      .find(match_condition)
      .select("user_id other_user_id room_code is_deleted is_requested")
      .populate({
        path: "user_id",
        select: "unique_name full_name profile_url profile_picture is_online",
      })
      .populate({
        path: "other_user_id",
        select: "unique_name full_name profile_url profile_picture is_online",
      });

    var update_room = await chat_room.findByIdAndUpdate(
      {
        _id: chat_room_id,
      },
      {
        $set: {
          is_requested: false,
        },
      },
      {
        new: true,
      }
    );

    let sender_socket_id = await users.findById(user_id);

    update_room = {
      ...update_room._doc,
      sender_socket_id: sender_socket_id?.socket_id,
    };
    return update_room;
  },

  deleteAllrequest: async (data) => {
    let { user_id } = data;

    let deleteChatData = await chat.find({
      other_user_id: user_id,
      is_requested: true,
    });
    if (deleteChatData) {
      var find_room_data = await chat_room.find({
        other_user_id: user_id,
        is_requested: true,
      });

      find_room_data.map(async (data) => {
        await chat
          .updateMany(
            { chat_room_id: data._id, is_deleted: false },
            { $push: { is_delete_by: user_id } }
          )
          .where({ is_delete_by: { $ne: user_id } });
      });
    }
    let result = { id_deleted: true };

    return result;
  },

  blockRequestUser: async (data) => {
    let { user_id, block_user_id } = data;

    if (user_id) {
      var find_user = await users
        .findById(user_id)
        .where({ is_deleted: false, is_block: false });

      if (!find_user) {
        return "Could't found user";
      }

      if (block_user_id) {
        var find_block_user = await users
          .findById(block_user_id)
          .where({ is_deleted: false, is_block: false });

        if (!find_block_user) {
          return "Could't found block user";
        }
      }

      await follower_following.findOneAndDelete({
        following_id: user_id,
        user_id: block_user_id,
        is_deleted: false,
      });
      await follower_following.findOneAndDelete({
        user_id: user_id,
        following_id: block_user_id,
        is_deleted: false,
      });

      var block_user_data = await block_user.findOne({
        user_id: user_id,
        block_user_id: block_user_id,
        is_deleted: false,
      });

      if (block_user_data) {
        var unblock_user = await block_user.findOneAndDelete({
          user_id: user_id,
          block_user_id: block_user_id,
          is_deleted: false,
        });

        if (unblock_user) {
          return "User unblock successfully";
        }
      } else {
        var create_record = await block_user.create({
          user_id: user_id,
          block_user_id: block_user_id,
          is_deleted: false,
        });
      }

      if (create_record) {
        return create_record;
      }
    }
  },

  sharePost: async (data, socket) => {
    var {
      sender_id,
      receiver_ids,
      post_id,
      interest_id,
      sub_interest_id,
      message,
    } = data;

    var find_user = await post
      .findById(post_id)
      .where({ is_deleted: false, is_block: false });

    if (!find_user) {
      return "Could't found post";
    }

    var find_interaction = await user_interactions.findOne({
      user_id: sender_id,
      interest_id: interest_id,
      sub_interest_id: sub_interest_id,
      post_id: post_id,
      interaction_type: "share",
      is_share_post: true,
    });

    if (!find_interaction) {
      await user_interactions.create({
        user_id: sender_id,
        interest_id: interest_id,
        sub_interest_id: sub_interest_id,
        post_id: post_id,
        interaction_type: "share",
        is_share_post: true,
      });

      await post.findByIdAndUpdate(post_id, {
        $inc: { interaction_count: 1 },
      });
    }

    receiver_ids?.map(async (receiver_id) => {
      let existingChatRoom = await chat_room.findOne({
        $or: [
          { user_id: sender_id, other_user_id: receiver_id },
          { user_id: receiver_id, other_user_id: sender_id },
        ],
      });
      let currentDateTime = await dateTime();
      let room_code = Math.floor(100000 + Math.random() * 900000);

      if (!existingChatRoom) {
        var follow_request_data = await follower_following.findOne().where({
          user_id: receiver_id,
          following_id: sender_id,
          is_request: true,
          is_deleted: false,
        });
        if (follow_request_data != null) {
          var createData = {
            user_id: sender_id,
            other_user_id: receiver_id,
            room_code: room_code,
          };
        } else {
          var createData = {
            user_id: sender_id,
            other_user_id: receiver_id,
            room_code: room_code,
            is_requested: true,
          };
        }
        existingChatRoom = await chat_room.create(createData);
      }
      let messageData = {
        chat_room_id: existingChatRoom._id,
        sender_id: sender_id,
        receiver_id: receiver_id,
        message_time: currentDateTime,
        post_id: post_id,
        message_type: "post",
        created_at: currentDateTime,
        updated_at: currentDateTime,
      };

      var insertData;
      if (message) {
        insertData = {
          ...insertData,
          chat_room_id: existingChatRoom._id,
          sender_id: sender_id,
          receiver_id: receiver_id,
          message_time: currentDateTime,
          message: message,
          message_type: "text",
          created_at: currentDateTime,
          updated_at: currentDateTime,
        };
      }

      if (
        existingChatRoom?.screen_user_status == true ||
        existingChatRoom?.screen_otheruser_status == true
      ) {
        messageData = {
          ...messageData,
          is_read: true,
        };
      } else {
        messageData = {
          ...messageData,
          is_read: false,
        };
      }

      let addMessage = await chat.create(messageData);

      var senddata;
      if (message) {
        let addsharemessage = await chat.create(insertData);
        senddata = {
          ...senddata,
          addsharemessage,
        };
      }

      let getMessage = await chat
        .findById(addMessage._id)
        .populate({
          path: "reply_message_id",
          model: "chat",
          populate: {
            path: "sender_id receiver_id",
            select:
              "full_name is_online is_verified profile_url profile_picture is_read",
          },
        })
        .populate({
          path: "sender_id",
          model: "users",
          select: "full_name is_online is_verified profile_url profile_picture",
        })
        .populate({
          path: "receiver_id",
          model: "users",
          select: "full_name is_online is_verified profile_url profile_picture",
        })
        .populate({
          path: "post_id",
          model: "post",
          populate: {
            path: "user_id",
            select:
              "unique_name profile_url profile_picture full_name is_verified",
          },
        });

      let get_receiver_user = await users.findById(receiver_id).where({
        is_deleted: false,
      });

      let get_sender_user = await users.findById(sender_id);

      if (get_receiver_user) {
        let name = "";
        var img = "";
        if (get_sender_user != null) {
          name = get_sender_user.full_name;
          img = get_sender_user.profile_picture;
        }

        var messageTemp = "shared a post";

        var chat_room_data = await chat_room
          .find()
          .where({
            _id: existingChatRoom._id,
            is_deleted: false,
          })
          .populate({
            path: "user_id",
            model: "users",
            select:
              "full_name is_online is_verified profile_url profile_picture",
          })
          .populate({
            path: "other_user_id",
            model: "users",
            select:
              "full_name is_online is_verified profile_url profile_picture",
          });

        if (
          chat_room_data[0]?.user_id?.profile_picture &&
          !chat_room_data[0]?.user_id?.profile_picture.startsWith(
            process.env.BASE_URL
          )
        ) {
          chat_room_data[0].user_id.profile_picture =
            process.env.BASE_URL + chat_room_data[0].user_id.profile_picture;
        }

        if (
          chat_room_data[0]?.other_user_id?.profile_picture &&
          !chat_room_data[0]?.other_user_id?.profile_picture.startsWith(
            process.env.BASE_URL
          )
        ) {
          chat_room_data[0].other_user_id.profile_picture =
            process.env.BASE_URL +
            chat_room_data[0].other_user_id.profile_picture;
        }

        var notiData;
        if (senddata) {
          var data = senddata?.addsharemessage?.message;
          notiData = {
            noti_msg: messageTemp + os.EOL + data,
            noti_title: name,
            noti_for: "share_post",
            sender_id: sender_id,
            chat_room_id: existingChatRoom._id,
            details: chat_room_data[0],
          };
        } else {
          notiData = {
            noti_msg: messageTemp,
            noti_title: name,
            noti_for: "share_post",
            sender_id: sender_id,
            chat_room_id: existingChatRoom._id,
            details: chat_room_data[0],
          };
        }

        var chat_room_data = await chat_room
          .find()
          .where({
            _id: existingChatRoom._id,
            is_deleted: false,
          })
          .populate({
            path: "user_id",
            model: "users",
          })
          .populate({
            path: "other_user_id",
            model: "users",
          });

        if (get_receiver_user) {
          var find_token = await user_session.find({
            user_id: get_receiver_user?._id,
            is_deleted: false,
          });

          var device_token_array = [];
          for (var value of find_token) {
            var device_token = value.device_token;
            device_token_array.push(device_token);
          }
          notiData = { ...notiData, device_token: device_token_array };

          if (device_token_array.length > 0) {
            if (
              get_receiver_user?._id.equals(chat_room_data[0]?.user_id?._id)
            ) {
              if (chat_room_data[0].screen_user_status == false) {
                await notiSendMultipleDevice(notiData);
              }
            }
          }
          if (device_token_array.length > 0) {
            if (
              get_receiver_user?._id.equals(
                chat_room_data[0]?.other_user_id?._id
              )
            ) {
              if (chat_room_data[0].screen_otheruser_status == false) {
                await notiSendMultipleDevice(notiData);
              }
            }
          }
        }
      }

      if (
        getMessage?.sender_id?.profile_picture &&
        !getMessage?.sender_id?.profile_picture.startsWith(process.env.BASE_URL)
      ) {
        getMessage.sender_id.profile_picture =
          process.env.BASE_URL + getMessage.sender_id.profile_picture;
      }

      if (
        getMessage?.post_id?.user_id?.profile_picture &&
        !getMessage?.post_id?.user_id?.profile_picture.startsWith(
          process.env.BASE_URL
        )
      ) {
        getMessage.post_id.user_id.profile_picture =
          process.env.BASE_URL + getMessage.post_id.user_id.profile_picture;
      }

      getMessage?.post_id?.post_media?.forEach((media) => {
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
      socket.to(get_receiver_user?.socket_id).emit("sendMessage", getMessage);
    });

    return true;
  },

  checkMessage: async (data) => {
    var { user_id } = data;

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

    var match_condition = {
      $and: [
        {
          $or: [{ user_id: user_id }, { other_user_id: user_id }],
        },
        {
          $or: [
            { is_requested: { $ne: true } },
            { other_user_id: { $ne: user_id } },
          ],
        },
        { other_user_id: { $nin: blockedUserIds } },
        { user_id: { $nin: blockedUserIds } },

        {
          is_deleted: false,
        },
      ],
    };

    var findRoom = await chat_room
      .find(match_condition)
      .select("user_id other_user_id room_code is_deleted")
      .populate({
        path: "user_id",
        select:
          "unique_name full_name profile_url profile_picture is_online is_verified",
      })
      .populate({
        path: "other_user_id",
        select:
          "unique_name full_name profile_url profile_picture is_online is_verified",
      });

    var UserList = await Promise.all(
      findRoom.map(async (value) => {
        var result = { ...value._doc };

        let findLastMsg = await chat
          .findOne()
          .where({
            chat_room_id: value._id,
            is_delete_by: { $ne: user_id },
          })
          .sort({ createdAt: -1 });
        let unreadMessage = await chat.countDocuments({
          chat_room_id: value._id,
          is_delete_by: { $ne: user_id },
          receiver_id: user_id,
          is_read: false,
        });

        result = {
          ...result,
          unread_message: unreadMessage,
        };

        return result;
      })
    );
    const totalUnreadMessages = UserList.reduce(
      (total, value) => total + value.unread_message,
      0
    );

    if (totalUnreadMessages >= 1) {
      return true;
    } else {
      return false;
    }
  },
};
