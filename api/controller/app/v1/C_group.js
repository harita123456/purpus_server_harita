const group = require("../../../../models/M_group");
const group_members = require("../../../../models/M_group_members");
const users = require("../../../../models/M_user");
const notifications = require("../../../../models/M_notification");
const user_session = require("../../../../models/M_user_session");
const follower_following = require("../../../../models/M_follower_following");
const block_user = require("../../../../models/M_block_user");
const user_interactions = require("../../../../models/M_user_interactions");

const group_report = require("../../../../models/M_report_group");
const {
  successRes,
  errorRes,
  multiSuccessRes,
} = require("../../../../utils/common_fun");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const { unlink } = require("fs");
const ObjectId = require("mongodb").ObjectId;

const { dateTime } = require("../../../../utils/date_time");
const outputPath = path.join(__dirname, "../../../../");

const {
  notificationSend,
  notiSendMultipleDevice,
} = require("../../../../utils/notification_send");

const createGroup = async (req, res) => {
  try {
    var user_id = req.user._id;
    var {
      group_name,
      group_description,
      interest_id,
      sub_interest_id,
      is_private,
    } = req.body;

    if (req.files) {
      var { group_image } = req.files;
    }

    let group_code = Math.floor(100000 + Math.random() * 900000);
    var image_name;
    if (group_image) {
      let file_extension = group_image.originalFilename
        .split(".")
        .pop()
        .toLowerCase();

      var file_name =
        Math.floor(1000 + Math.random() * 9000) +
        "_" +
        Date.now() +
        "." +
        file_extension;

      let oldPath = group_image.path;
      let newPath = "public/group_images/" + file_name;

      await fs.readFile(oldPath, function (err, data) {
        if (err) throw err;

        fs.writeFile(newPath, data, function (err) {
          if (err) throw err;
        });
      });

      image_name = "group_images/" + file_name;
    }

    var group_create = await group.create({
      user_id: user_id,
      group_name: group_name,
      group_description: group_description,
      interest_id: interest_id,
      sub_interest_id: sub_interest_id,
      is_private: is_private,
      group_code: group_code,
      group_image: image_name,
    });

    await group_members.create({
      user_id: user_id,
      group_id: group_create._id,
      is_admin: true,
    });

    if (group_create.group_image) {
      group_create.group_image =
        process.env.BASE_URL + group_create.group_image;
    }

    return successRes(res, "Group created successfully", group_create);
  } catch (error) {
    console.log(error);
    return errorRes(res, "Internal Server Error!");
  }
};

const editGroup = async (req, res) => {
  try {
    var user_id = req.user._id;

    var {
      group_id,
      group_name,
      group_description,
      interest_id,
      sub_interest_id,
      is_private,
    } = req.body;

    if (req.files) {
      var { group_image } = req.files;
    }

    var group_details = await group
      .findById(group_id)
      .where({ is_deleted: false });

    if (!group_details) {
      return errorRes(res, "Group not found");
    }

    if (!user_id.equals(group_details.user_id)) {
      return errorRes(res, "You are not authorised user for edit this group");
    }

    var update_data = {
      user_id: user_id,
      group_name: group_name,
      group_description: group_description,
      interest_id: interest_id,
      sub_interest_id: sub_interest_id,
      is_private: is_private,
    };

    if (is_private == false || is_private == "false") {
      var users_who_sent_request_to_join_group = await notifications.find({
        group_id: group_id,
        noti_for: "group_join_request",
        is_deleted: false,
      });
      var users_who_invite_to_group = await notifications.find({
        group_id: group_id,
        noti_for: "group_invite",
        is_deleted: false,
      });

      for (const joinRequestUser of users_who_sent_request_to_join_group) {
        const existingMember = await group_members.findOne({
          user_id: joinRequestUser.sender_id,
          group_id: group_id,
        });

        if (!existingMember) {
          await group_members.create({
            user_id: joinRequestUser.sender_id,
            group_id: group_id,
            is_admin: false,
            is_deleted: false,
          });

          await notifications.findByIdAndDelete(joinRequestUser._id);
        }
      }

      for (const joinInviteUser of users_who_invite_to_group) {
        const existingMember = await group_members.findOne({
          user_id: joinInviteUser.receiver_id,
          group_id: group_id,
        });

        if (!existingMember) {
          await group_members.create({
            user_id: joinInviteUser.receiver_id,
            group_id: group_id,
            is_admin: false,
            is_deleted: false,
          });

          await notifications.findByIdAndDelete(joinInviteUser._id);
        }
      }

      update_data = { ...update_data, is_private: is_private };
    } else {
      update_data = { ...update_data, is_private: is_private };
    }

    if (group_image) {
      let file_extension = group_image.originalFilename
        .split(".")
        .pop()
        .toLowerCase();

      var file_name =
        Math.floor(1000 + Math.random() * 9000) +
        "_" +
        Date.now() +
        "." +
        file_extension;

      let oldPath = group_image.path;
      let newPath = "public/group_images/" + file_name;

      await fs.readFile(oldPath, function (err, data) {
        if (err) throw err;

        fs.writeFile(newPath, data, function (err) {
          if (err) throw err;
        });
      });

      var image_name = "group_images/" + file_name;

      update_data = { ...update_data, group_image: image_name };

      unlink(`${outputPath}/public/${group_details.group_image}`, (err) => {
        if (err) console.log(err);
      });
    }

    var group_update = await group.findByIdAndUpdate(
      group_id,
      { $set: update_data },
      { new: true }
    );

    group_update.group_image = process.env.BASE_URL + group_update.group_image;

    return successRes(res, "Group details updated successfully", group_update);
  } catch (error) {
    console.log(error);
    return errorRes(res, "Internal Server Error!");
  }
};

const groupDetails = async (req, res) => {
  try {
    var { group_id } = req.body;

    var group_details = await group
      .findById(group_id)
      .where({ is_deleted: false });

    if (!group_details) {
      return errorRes(res, "Group not found");
    }

    group_details.group_image = group_details.group_image
      ? process.env.BASE_URL + group_details.group_image
      : "";

    var group_members_list = await group_members
      .find()
      .where({ is_deleted: false, group_id: group_id })
      .populate({
        path: "user_id",
        select: "full_name profile_picture profile_url is_verified",
      });

    group_members_list.map((value) => {
      value.profile_picture = value.profile_picture
        ? process.env.BASE_URL + value.profile_picture
        : "";
    });

    group_details = {
      ...group_details._doc,
      members_counter: group_members_list.length,
      members: group_members_list,
    };

    group_details.members.map((value) => {
      if (value?.user_id?.profile_picture) {
        value.user_id.profile_picture =
          process.env.BASE_URL + value.user_id.profile_picture;
      }
    });

    return successRes(res, "Group details get successfully", group_details);
  } catch (error) {
    console.log(error);
    return errorRes(res, "Internal Server Error!");
  }
};

// const groupList = async (req, res) => {
//   try {
//     var user_id = req.user._id;

//     var { other_user_id, page = 1, limit = 80 } = req.body;

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

//     const blockedUserIds = [
//       ...userBlockedByOthersIds,
//       ...usersBlockingCurrentUserIds,
//     ];

//     var whereCond = { is_deleted: false };

//     var findMembersGroup = await group_members.distinct("group_id", {
//       user_id: user_id,
//       is_deleted: false,
//     });

//     if (other_user_id && other_user_id !== user_id) {
//       var otherUserGroups = await group_members.distinct("group_id", {
//         user_id: other_user_id,
//         is_deleted: false,
//       });

//       var groupIdsToExclude = Array.isArray(whereCond._id) ? whereCond._id : [];
//       groupIdsToExclude.push(...otherUserGroups);
//       whereCond._id = { $nin: groupIdsToExclude };

//       var inviteNotification = await notifications.findOne({
//         receiver_id: other_user_id,
//         sender_id: user_id,
//         noti_for: "group_invite",
//         is_accepted: null,
//         is_deleted: false,
//       });

//       if (inviteNotification) {
//         whereCond._id = {
//           $nin: [...groupIdsToExclude, inviteNotification.group_id],
//         };
//       }

//       var joinNotification = await notifications.findOne({
//         receiver_id: user_id,
//         sender_id: other_user_id,
//         noti_for: "group_join_request",
//         is_accepted: null,
//         is_deleted: false,
//       });

//       if (joinNotification) {
//         whereCond._id = {
//           $nin: [...groupIdsToExclude, joinNotification.group_id],
//         };
//       }
//     }

//     if (group_type == "discover") {
//       const subinterestCountResult = await user_interactions.aggregate([
//         {
//           $match: {
//             user_id: new mongoose.Types.ObjectId(user_id),
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
//       const subInterestIds = subinterestCountResult.map(item => item.sub_interest_id);

//       const uniqueSubInterestIds = subInterestIds.filter(id => !req.user.interested.includes(id));
//       req.user.interested.push(...uniqueSubInterestIds);
//       whereCond = {
//         ...whereCond,
//         user_id: { $ne: user_id, $nin: blockedUserIds },
//         $or: [
//           { sub_interest_id: { $in: req.user.interested } },
//           { sub_interest_id: null },
//           { sub_interest_id: { $exists: false } },
//         ],
//       };

//       if (findMembersGroup.length > 0) {
//         whereCond = { ...whereCond, _id: { $nin: findMembersGroup } };
//       }
//     } else {
//       if (findMembersGroup.length > 0) {
//         whereCond = {
//           ...whereCond,
//           $or: [{ _id: { $in: findMembersGroup } }, { user_id: user_id }],
//         };
//       } else {
//         whereCond = {
//           ...whereCond,
//           user_id: user_id,
//         };
//       }
//     }

//     const totalDocuments = await group.countDocuments(whereCond);

//     const totalPages = Math.ceil(totalDocuments / limit);

//     const randomPage = Math.floor(Math.random() * totalPages) + 1;

//     function shuffleArray(array) {
//       for (let i = array.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [array[i], array[j]] = [array[j], array[i]];
//       }
//       return array;
//     }

//     var group_list1 = await group
//       .find(whereCond)
//       .select(
//         "user_id group_name group_description group_code is_deleted group_image is_private interest_id sub_interest_id"
//       )
//       .populate({
//         path: "user_id",
//         select: "full_name profile_url profile_picture",
//       })
//       .limit(80 * 1)
//       .skip((page - 1) * 80)
//       .sort({ createdAt: -1 });

//     const group_list = shuffleArray(group_list1);

//     const baseUrl = process.env.BASE_URL;
//     var groupList = await Promise.all(
//       group_list.map(async (value) => {
//         var result = { ...value._doc };

//         var group_members_count = await group_members
//           .find()
//           .where({ is_deleted: false, group_id: value._id })
//           .count();

//         result = {
//           ...result,
//           member_count: group_members_count,
//           last_message: null,
//           last_message_time: null,
//           unread_message: null,
//         };

//         if (group_type == "discover") {
//           let is_requested = false;
//           let is_invited = false;

//           var request_check = await notifications.findOne().where({
//             is_deleted: false,
//             group_id: value._id,
//             is_accepted: null,
//             sender_id: user_id,
//             noti_for: "group_join_request",
//           });

//           if (request_check) {
//             is_requested = true;
//           }

//           var invite_check = await notifications.findOne().where({
//             is_deleted: false,
//             group_id: value._id,
//             is_accepted: null,
//             receiver_id: user_id,
//             noti_for: "group_invite",
//           });

//           if (invite_check) {
//             is_invited = true;
//           }

//           result = {
//             ...result,
//             is_requested: is_requested,
//             is_invited: is_invited,
//           };
//         }

//         return result;
//       })
//     );

//     for (const value of groupList) {
//       if (value.group_image && !value.group_image.includes(baseUrl)) {
//         value.group_image = baseUrl + value.group_image;
//       }
//       if (
//         value.user_id?.profile_picture &&
//         !value.user_id.profile_picture.includes(baseUrl)
//       ) {
//         value.user_id.profile_picture = baseUrl + value.user_id.profile_picture;
//       }
//     }

//     var total_count = await group.find().where(whereCond).count();

//     return multiSuccessRes(
//       res,
//       "Group list get successfully",
//       groupList,
//       total_count
//     );
//   } catch (error) {
//     console.log(error);
//     return errorRes(res, "Internal Server Error!");
//   }
// };



const groupList = async (req, res) => {
  try {
    var user_id = req.user._id;

    var { other_user_id, group_type, page = 1, limit = 80 } = req.body;
    console.log("user_id", user_id)
    console.log("other_user_id", req.body)

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

    var whereCond = { is_deleted: false };

    var findMembersGroup = await group_members.distinct("group_id", {
      user_id: user_id,
      is_deleted: false,
    });

    if (other_user_id && other_user_id !== user_id) {
      var otherUserGroups = await group_members.distinct("group_id", {
        user_id: other_user_id,
        is_deleted: false,
      });

      var groupIdsToExclude = Array.isArray(whereCond._id) ? whereCond._id : [];
      groupIdsToExclude.push(...otherUserGroups);
      whereCond._id = { $nin: groupIdsToExclude };

      var inviteNotification = await notifications.findOne({
        receiver_id: other_user_id,
        sender_id: user_id,
        noti_for: "group_invite",
        is_accepted: null,
        is_deleted: false,
      });

      if (inviteNotification) {
        whereCond._id = {
          $nin: [...groupIdsToExclude, inviteNotification.group_id],
        };
      }

      var joinNotification = await notifications.findOne({
        receiver_id: user_id,
        sender_id: other_user_id,
        noti_for: "group_join_request",
        is_accepted: null,
        is_deleted: false,
      });

      if (joinNotification) {
        whereCond._id = {
          $nin: [...groupIdsToExclude, joinNotification.group_id],
        };
      }

    }

    if (group_type == "discover") {
      const subinterestCountResult = await user_interactions.aggregate([
        {
          $match: {
            user_id: new mongoose.Types.ObjectId(user_id),
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
      const subInterestIds = subinterestCountResult.map(item => item.sub_interest_id);

      const uniqueSubInterestIds = subInterestIds.filter(id => !req.user.interested.includes(id));
      req.user.interested.push(...uniqueSubInterestIds);
      whereCond = {
        ...whereCond,
        user_id: { $ne: user_id, $nin: blockedUserIds },
        $or: [
          { sub_interest_id: { $in: req.user.interested } },
          { sub_interest_id: null },
          { sub_interest_id: { $exists: false } },
        ],
      };

      if (findMembersGroup.length > 0) {
        // whereCond = { ...whereCond, _id: { $nin: findMembersGroup } };
        whereCond = { ...whereCond };
      }
    } else {
      if (findMembersGroup.length > 0) {
        whereCond = {
          ...whereCond,
          $or: [{ _id: { $in: findMembersGroup } }, { user_id: user_id }],
          // $or: [{ user_id: user_id }],
        };
      } else {
        whereCond = {
          ...whereCond,
          user_id: user_id,
        };
      }
    }

    const totalDocuments = await group.countDocuments(whereCond);

    const totalPages = Math.ceil(totalDocuments / limit);

    const randomPage = Math.floor(Math.random() * totalPages) + 1;

    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    var group_list1 = await group
      .find(whereCond)
      .select(
        "user_id group_name group_description group_code is_deleted group_image is_private interest_id sub_interest_id"
      )
      .populate({
        path: "user_id",
        select: "full_name profile_url profile_picture",
      })
      .limit(80 * 1)
      .skip((page - 1) * 80)
      .sort({ createdAt: -1 });


    const group_list = shuffleArray(group_list1);

    const baseUrl = process.env.BASE_URL;
    var groupList = await Promise.all(
      group_list.map(async (value) => {
        var result = { ...value._doc };

        

        var group_members_count = await group_members
          .find()
          .where({ is_deleted: false, group_id: value._id })
          .count();

        result = {
          ...result,
          member_count: group_members_count,
          last_message: null,
          last_message_time: null,
          unread_message: null,
        };

        if (group_type == "discover") {
          let is_requested = false;
          let is_invited = false;
          let is_member = false;
          var request_check = await notifications.findOne().where({
            is_deleted: false,
            group_id: value._id,
            is_accepted: null,
            sender_id: user_id,
            noti_for: "group_join_request",
          });

          var request_check_data = await notifications.findOne().where({
            is_deleted: false,
            group_id: value._id,
            is_accepted: true,
            sender_id: user_id,
            noti_for: "group_join_request",
          });


          console.log("request_check_data", request_check_data)

          if (request_check) {
            is_requested = true;
          }

          var invite_check = await notifications.findOne().where({
            is_deleted: false,
            group_id: value._id,
            is_accepted: null,
            receiver_id: user_id,
            noti_for: "group_invite",
          });

          console.log("--------------------", invite_check)

          if (invite_check) {
            is_invited = true;
          }



          const existingMember = await group_members.findOne({
            group_id: value._id,
            user_id: user_id,
            is_deleted: false,
          });

          if (existingMember) {
            is_member = true;
          }





          result = {
            ...result,
            is_requested: is_requested,
            is_invited: is_invited,
            is_member: is_member
          };
        }

        if (group_type == "my_group") {
          let is_requested = false;
          let is_invited = false;
          let is_member = false;
          var request_check = await notifications.findOne().where({
            is_deleted: false,
            group_id: value._id,
            is_accepted: null,
            sender_id: user_id,
            noti_for: "group_join_request",
          });

          var request_check_data = await notifications.findOne().where({
            is_deleted: false,
            group_id: value._id,
            is_accepted: true,
            sender_id: user_id,
            noti_for: "group_join_request",
          });


          console.log("request_check_data", request_check_data)

          if (request_check) {
            is_requested = true;
          }

          var invite_check = await notifications.findOne().where({
            is_deleted: false,
            group_id: value._id,
            is_accepted: null,
            receiver_id: user_id,
            noti_for: "group_invite",
          });

          console.log("--------------------", invite_check)

          if (invite_check) {
            is_invited = true;
          }



          const existingMember = await group_members.findOne({
            group_id: value._id,
            user_id: user_id,
            is_deleted: false,
          });

          if (existingMember) {
            is_member = true;
          }





          result = {
            ...result,
            is_requested: is_requested,
            is_invited: is_invited,
            is_member: is_member
          };
        }
        return result;

      })
    );

    for (const value of groupList) {
      if (value.group_image && !value.group_image.includes(baseUrl)) {
        value.group_image = baseUrl + value.group_image;
      }
      if (
        value.user_id?.profile_picture &&
        !value.user_id.profile_picture.includes(baseUrl)
      ) {
        value.user_id.profile_picture = baseUrl + value.user_id.profile_picture;
      }
    }

    var total_count = await group.find().where(whereCond).count();

    return multiSuccessRes(
      res,
      "Group list get successfully",
      groupList,
      total_count
    );
  } catch (error) {
    console.log(error);
    return errorRes(res, "Internal Server Error!");
  }
};


const joinGroup = async (req, res) => {
  try {
    var user_id = req.user._id;

    var { group_id } = req.body;

    var group_details = await group
      .findById(group_id)
      .where({ is_deleted: false });

    if (!group_details) {
      return errorRes(res, "Group not found");
    }

    var existing_members = await group_members.find({
      user_id: user_id,
      group_id: group_id,
      is_deleted: false,
    });

    await notifications.deleteMany({
      noti_for: "group_invite",
      group_id: group_id,
      receiver_id: user_id,
    })

    if (existing_members.length == 0) {
      var group_members_create = await group_members.create({
        user_id: user_id,
        group_id: group_id,
      });
      return successRes(res, "Group joined successfully", group_members_create);
    }

    return successRes(res, "already a member of this group",);
  } catch (error) {
    console.log(error);
    return errorRes(res, "Internal Server Error!");
  }
};

const requestToJoinGroup = async (req, res) => {
  try {
    var user_id = req.user._id;
    var login_user_name = req.user.full_name;

    var { group_id } = req.body;

    const currentDateTime = await dateTime();

    var group_details = await group
      .findById(group_id)
      .where({ is_deleted: false });

    if (!group_details) {
      return errorRes(res, "Group not found");
    }

    const invite_noti = await notifications.findOne({
      noti_for: "group_invite",
      receiver_id: user_id,
      group_id: group_id,
    })

    if (invite_noti) {
      return errorRes(res, "You have already invited to this group");
    } else {
      let noti_msg =
        login_user_name +
        " requested for join your group " +
        group_details.group_name;
      let noti_title = "Group join request";
      let noti_for = "group_join_request";
      let noti_image = process.env.BASE_URL + group_details.group_image;
      let notiData = {
        noti_image,
        noti_msg,
        noti_title,
        noti_for,
        id: group_id,
      };

      await notifications.create({
        noti_title,
        noti_msg: "requested for join your group",
        noti_for,
        sender_id: user_id,
        receiver_id: group_details.user_id,
        group_id: group_id,
        noti_date: currentDateTime,
        created_at: currentDateTime,
        updated_at: currentDateTime,
      });

      var find_token = await user_session.find({
        user_id: group_details.user_id,
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
          await users.findByIdAndUpdate(group_details.user_id, {
            $inc: {
              noti_badge: 1,
            },
          });
        }
      }
      return successRes(res, "Request sent successfully", []);
    }
  } catch (error) {
    console.log(error);
    return errorRes(res, "Internal Server Error!");
  }
};

const acceptDeclineJoinRequest = async (req, res) => {
  try {
    var user_id = req.user._id;
    var login_user_name = req.user.full_name;

    var { notification_id, notification_status } = req.body;

    const currentDateTime = await dateTime();

    var noti_data = await notifications
      .findById(notification_id)
      .where({
        is_deleted: false,
      })
      .populate("sender_id", "full_name");

    if (!noti_data) {
      return errorRes(res, `Couldn't found notification`);
    }

    var group_details = await group
      .findById(noti_data.group_id)
      .where({ is_deleted: false });

    if (noti_data.noti_for == "group_invite") {
      if (notification_status == "accept") {
        let noti_msg =
          login_user_name + " has joined your group: " + group_details.group_name;
        let noti_title = "Join your group";
        let noti_for = "group_join_request_accept";
        let noti_image = process.env.BASE_URL + group_details.group_image;
        let notiData = {
          noti_image,
          noti_msg,
          noti_title,
          noti_for,
          id: noti_data.group_id,
          group_name: group_details.group_name,
        };

        await notifications.create({
          noti_title,
          noti_msg: login_user_name + " has joined your group",
          noti_for,
          sender_id: user_id,
          receiver_id: noti_data.sender_id,
          group_id: noti_data.group_id,
          noti_date: currentDateTime,
          created_at: currentDateTime,
          updated_at: currentDateTime,
        });

        var find_token = await user_session.find({
          user_id: noti_data.sender_id,
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
            await users.findByIdAndUpdate(noti_data.sender_id, {
              $inc: {
                noti_badge: 1,
              },
            });
          }
        }
        await notifications.findByIdAndUpdate(
          notification_id,
          {
            $set: {
              is_accepted: true,
              noti_title: "Accept group join request",
              noti_msg: "You have successfully joined",
              noti_for: "group_join_request_accept",
            },
          },
          { new: true }
        );

        await group_members.create({
          user_id: user_id,
          group_id: noti_data.group_id,
        });

        await notifications.deleteMany({
          noti_for: "group_join_request_decline",
          group_id: noti_data.group_id,
          receiver_id: group_details.user_id,
        })

        var res_msg = "Request accepted successfully";
      } else {
        await notifications.deleteMany({
          noti_for: "group_join_request_decline",
          group_id: noti_data.group_id,
          receiver_id: noti_data.sender_id,
        })

        let noti_msg =
          login_user_name +
          " declined your group join request for " +
          group_details.group_name;
        let noti_title = "Decline group join Request";
        let noti_for = "group_join_request_decline";
        let noti_image = process.env.BASE_URL + group_details.group_image;
        let notiData = {
          noti_image,
          noti_msg,
          noti_title,
          noti_for,
          id: noti_data.group_id,
          group_name: group_details.group_name,
        };

        await notifications.create({
          noti_title,
          noti_msg:
            "declined your group join request for " + group_details.group_name,
          noti_for,
          sender_id: user_id,
          receiver_id: noti_data.sender_id,
          group_id: noti_data.group_id,
          noti_date: currentDateTime,
          created_at: currentDateTime,
          updated_at: currentDateTime,
        });

        var find_token = await user_session.find({
          user_id: noti_data.sender_id,
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
            await users.findByIdAndUpdate(noti_data.sender_id, {
              $inc: {
                noti_badge: 1,
              },
            });
          }
        }

        await notifications.findByIdAndUpdate(
          notification_id,
          { $set: { is_accepted: false } },
          { new: true }
        );

        await notifications.findOneAndDelete({
          _id: notification_id,
        });

        var res_msg = "Request declined successfully";
      }
    }

    if (noti_data.noti_for == "group_join_request") {
      if (notification_status == "accept") {
        let noti_msg =
          "You have successfully joined: " + group_details.group_name;
        let noti_title = "Accept group request";
        let noti_for = "group_join_request_accept";
        let noti_image = process.env.BASE_URL + group_details.group_image;
        let notiData = {
          noti_image,
          noti_msg,
          noti_title,
          noti_for,
          id: noti_data.group_id,
          group_name: group_details.group_name,
        };

        await notifications.create({
          noti_title,
          noti_msg: "You have successfully joined",
          noti_for,
          sender_id: user_id,
          receiver_id: noti_data.sender_id,
          group_id: noti_data.group_id,
          noti_date: currentDateTime,
          created_at: currentDateTime,
          updated_at: currentDateTime,
        });

        var find_token = await user_session.find({
          user_id: noti_data.sender_id,
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
            await users.findByIdAndUpdate(noti_data.sender_id, {
              $inc: {
                noti_badge: 1,
              },
            });
          }
        }
        await notifications.findByIdAndUpdate(
          notification_id,
          {
            $set: {
              is_accepted: true,
              noti_title: "Accept Group Join Request",
              noti_msg: noti_data.sender_id.full_name + " has joined",
              noti_for: "group_join_request_accept",
            },
          },
          { new: true }
        );

        await group_members.create({
          user_id: noti_data.sender_id,
          group_id: noti_data.group_id,
        });

        await notifications.deleteMany({
          noti_for: "group_join_request_decline",
          group_id: noti_data.group_id,
          receiver_id: group_details.user_id,
        })

        var res_msg = "Request accepted successfully";
      } else {
        await notifications.deleteMany({
          noti_for: "group_join_request_decline",
          group_id: noti_data.group_id,
          receiver_id: noti_data.sender_id,
        })
        let noti_msg =
          login_user_name +
          " declined your group join request for " +
          group_details.group_name;
        let noti_title = "Decline group join request";
        let noti_for = "group_join_request_decline";
        let noti_image = process.env.BASE_URL + group_details.group_image;
        let notiData = {
          noti_image,
          noti_msg,
          noti_title,
          noti_for,
          id: noti_data.group_id,
          group_name: group_details.group_name,
        };

        await notifications.create({
          noti_title,
          noti_msg:
            "declined your group join request for " + group_details.group_name,
          noti_for,
          sender_id: user_id,
          receiver_id: noti_data.sender_id,
          group_id: noti_data.group_id,
          noti_date: currentDateTime,
          created_at: currentDateTime,
          updated_at: currentDateTime,
        });

        var find_token = await user_session.find({
          user_id: noti_data.sender_id,
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
            await users.findByIdAndUpdate(noti_data.sender_id, {
              $inc: {
                noti_badge: 1,
              },
            });
          }
        }

        await notifications.findByIdAndUpdate(
          notification_id,
          { $set: { is_accepted: false } },
          { new: true }
        );

        await notifications.findOneAndDelete({
          _id: notification_id,
        });

        var res_msg = "Request declined successfully";
      }
    }

    return successRes(res, res_msg, []);
  } catch (error) {
    console.log(error);
    return errorRes(res, "Internal Server Error!");
  }
};

const leaveGroup = async (req, res) => {
  try {
    var user_id = req.user._id;

    var { group_id } = req.body;

    var group_details = await group
      .findById(group_id)
      .where({ is_deleted: false });

    if (!group_details) {
      return errorRes(res, "Group not found");
    }

    var group_member_details = await group_members
      .findOne()
      .where({ is_deleted: false, user_id: user_id, group_id: group_id });

    if (!group_member_details) {
      return errorRes(res, "Member not found in this group");
    }

    if (group_member_details.is_admin == true) {
      return errorRes(
        res,
        "You can not leave this group because you are an admin"
      );
    }

    var group_members_delete = await group_members.deleteOne({
      user_id: user_id,
      group_id: group_id,
    });

    await notifications.deleteMany({
      group_id: group_id,
      receiver_id: user_id,
      noti_for: { $in: ["group_join_request", "group_invite", "group_join_request_accept", "group_join_request_decline"] },
    })

    await notifications.deleteMany({
      group_id: group_id,
      sender_id: user_id,
      noti_for: { $in: ["group_join_request", "group_invite", "group_join_request_accept", "group_join_request_decline"] },
    })

    return successRes(res, "Group leaved successfully", group_members_delete);
  } catch (error) {
    console.log(error);
    return errorRes(res, "Internal Server Error!");
  }
};

const deleteGroup = async (req, res) => {
  try {
    var user_id = req.user._id;

    var { group_id } = req.body;

    var group_details = await group
      .findById(group_id)
      .where({ is_deleted: false });

    if (!group_details) {
      return errorRes(res, "Group not found");
    }

    if (!user_id.equals(group_details.user_id)) {
      return errorRes(res, "You are not authorised user for delete this group");
    }

    await group.findByIdAndUpdate(group_id, {
      $set: { is_deleted: true },
    });

    await group_members.updateMany(
      { group_id: group_id },
      { $set: { is_deleted: true } }
    );

    await notifications.updateMany(
      { group_id: group_id },
      { $set: { is_deleted: true } },
      { new: true }
    );

    return successRes(res, "Group deleted successfully", []);
  } catch (error) {
    console.log(error);
    return errorRes(res, "Internal Server Error!");
  }
};

const inviteUserInGroup = async (req, res) => {
  try {
    var user_id = req.user._id;
    var login_user_name = req.user.full_name;

    var { group_id, user_ids } = req.body;

    user_ids_data = JSON.parse(user_ids);

    if (user_ids_data) {
      user_ids_data?.map(async (value) => {
        await notifications.findOneAndDelete({
          sender_id: user_id,
          receiver_id: value,
          group_id: group_id,
          noti_for: "group_invite",
          is_accepted: null
        })
      })
    }
    const currentDateTime = await dateTime();

    var group_details = await group
      .findById(group_id)
      .where({ is_deleted: false });




    if (!group_details) {
      return errorRes(res, "Group not found");
    }

    let noti_msg =
      login_user_name +
      " invited you to join the group: " +
      group_details.group_name;
    let noti_title = "Group invitation";
    let noti_for = "group_invite";
    let noti_image = process.env.BASE_URL + group_details.group_image;
    let notiData = {
      noti_image,
      noti_msg,
      noti_title,
      noti_for,
      id: group_id,
      group_name: group_details.group_name,
    };
    var device_token_array = [];

    user_ids = JSON.parse(user_ids);

    const notificationsPromises = user_ids.map(async (value) => {
      await notifications.create({
        noti_title,
        noti_msg: "invited you to join the group",
        noti_for,
        sender_id: user_id,
        receiver_id: value,
        group_id: group_id,
        noti_date: currentDateTime,
        created_at: currentDateTime,
        updated_at: currentDateTime,
      });

      var find_token = await user_session.find({
        user_id: value,
        is_deleted: false,
      });

      await users.findByIdAndUpdate(value, {
        $inc: {
          noti_badge: 1,
        },
      });

      var device_tokens = find_token.map((value) => value.device_token);
      device_token_array.push(...device_tokens);
    });

    await Promise.all(notificationsPromises);

    if (device_token_array.length > 0) {
      notiData = { ...notiData, device_token: device_token_array };
      var noti_send = await notiSendMultipleDevice(notiData);

      if (noti_send.status == 200) {
        await users.findByIdAndUpdate(group_details.user_id, {
          $inc: {
            noti_badge: 1,
          },
        });
      }
    }

    return successRes(res, "Request sent successfully", []);
  } catch (error) {
    console.log(error);
    return errorRes(res, "Internal Server Error!");
  }
};
/*
const membersList = async (req, res) => {
  try {
    var user_id = req.user._id;
    var { group_id, search, page = 1, limit = 10 } = req.body;

    const existingMember = await group_members.find({
      group_id: group_id,
      is_deleted: false,
    });

    const existingMemberIds = existingMember.map((have) => have.user_id);

    console.log("existingMemberIds",existingMemberIds)


    const existingMemberInvite = await notifications.find({
      group_id: group_id,
      noti_for: "group_invite",
      is_deleted: false,
    });

    const existingMemberRequest = await notifications.find({
      group_id: group_id,
      noti_for: "group_join_request",
      is_deleted: false,
    });

    const existingMemberIds1 = existingMemberInvite.map(
      (have) => have.receiver_id
    );
    const existingMemberIds2 = existingMemberRequest.map(
      (have) => have.sender_id
    );

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

    const notificationUserIds = [...existingMemberIds1, ...existingMemberIds2];

    if (user_id) {
      let find_following_data = await users
        .findById(user_id)
        .where({ is_deleted: false, is_block: false });

      if (!find_following_data) {
        return errorRes(res, `Couldn't found user`);
      }
    }

    if (search == undefined || search == "undefined") {
      const following_count = await follower_following.countDocuments({
        user_id: user_id,
        is_deleted: false,
        is_request: true,
      });

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
            $and: [
              {
                $or: [
                  { followingFullNameMatch: true },
                  { followingUniqueNameMatch: true },
                ],
              },
              { "following._id": { $nin: blockedUserIds } },
              { "following._id": { $nin: existingMemberIds } },
              { "following._id": { $nin: notificationUserIds } },
            ],
          },
        },
        {
          $project: {
            _id: "$following._id",
            full_name: "$following.full_name",
            profile_picture: "$following.profile_picture",
            profile_url: "$following.profile_url",
            is_verified: "$following.is_verified",
          },
        },
        {
          $skip: (page - 1) * parseInt(limit), 
        },
        {
          $limit: parseInt(limit), 
        },
      ];

      const following_List = await follower_following.aggregate(pipeline);

      following_List.forEach((value) => {
        if (value?.profile_picture) {
          value.profile_picture = process.env.BASE_URL + value.profile_picture;
        }
      });

      return multiSuccessRes(
        res,
        "Following list get successfuly",
        following_List,
        following_count
      );
    } else {
      const searchTerms = search.split(" ");
      const regex = new RegExp(searchTerms.join("|"), "i");

      var result = await users
        .find({
          $and: [
            { $or: [{ full_name: regex }, { unique_name: regex }] },
            {
              _id: { $ne: user_id },
            },
            { _id: { $nin: blockedUserIds } },
            { _id: { $nin: existingMemberIds } },
            { _id: { $nin: notificationUserIds } },
            { is_deleted: false },
          ],
        })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ is_verified: -1 });
      var result_count = await users
        .find({
          $and: [
            { $or: [{ full_name: regex }, { unique_name: regex }] },
            {
              _id: { $ne: user_id },
            },
            { _id: { $nin: blockedUserIds } },
            { _id: { $nin: existingMemberIds } },
            { _id: { $nin: notificationUserIds } },
            { is_deleted: false },
          ],
        })
        .count();

      const formattedResult = result.map((value) => ({
        _id: value._id,
        full_name: value.full_name,
        profile_picture: value.profile_picture
          ? process.env.BASE_URL + value.profile_picture
          : null,
        profile_url: value.profile_url,
        is_verified: value.is_verified,
      }));

      return multiSuccessRes(
        res,
        "Searching user data get successful",
        formattedResult,
        result_count
      );
    }
  } catch (error) {
    console.log(error);
    return errorRes(res, "Internal Server Error!");
  }
}; 
*/

const membersList = async (req, res) => {
  try {
    var user_id = req.user._id;
    var { group_id, search, page = 1, limit = 10 } = req.body;


    console.log("req.body", req.body, user_id)

    const existingMember = await group_members.find({
      group_id: group_id,
      is_deleted: false,
    });

    console.log("existingMember", existingMember)

    const existingMemberIds = existingMember.map((have) => have.user_id);

    // console.log("existingMemberIds", existingMemberIds)


    const existingMemberInvite = await notifications.find({
      group_id: group_id,
      noti_for: "group_invite",
      is_deleted: false,
    });

    console.log("existingMemberInvite", existingMemberInvite)

    const existingMemberRequest = await notifications.find({
      group_id: group_id,
      noti_for: "group_join_request",
      is_deleted: false,
    });

    const existingMemberIds1 = existingMemberInvite.map(
      (have) => have.receiver_id
    );
    const existingMemberIds2 = existingMemberRequest.map(
      (have) => have.sender_id
    );

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

    const notificationUserIds = [...existingMemberIds1, ...existingMemberIds2];

    if (user_id) {
      let find_following_data = await users
        .findById(user_id)
        .where({ is_deleted: false, is_block: false });

      if (!find_following_data) {
        return errorRes(res, `Couldn't found user`);
      }
    }

    if (search == undefined || search == "undefined") {
      const following_count = await follower_following.countDocuments({
        user_id: user_id,
        is_deleted: false,
        is_request: true,
      });

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
            $and: [
              {
                $or: [
                  { followingFullNameMatch: true },
                  { followingUniqueNameMatch: true },
                ],
              },
              { "following._id": { $nin: blockedUserIds } },
              // { "following._id": { $nin: existingMemberIds } },
              { "following._id": { $nin: [user_id] } },
              // { "following._id": { $nin: notificationUserIds } },
            ],
          },
        },
        {
          $project: {
            _id: "$following._id",
            full_name: "$following.full_name",
            profile_picture: "$following.profile_picture",
            profile_url: "$following.profile_url",
            is_verified: "$following.is_verified",
          },
        },
        {
          $skip: (page - 1) * parseInt(limit),
        },
        {
          $limit: parseInt(limit),
        },
      ];


      const following_List = await follower_following.aggregate(pipeline);



      console.log("following_List", following_List)

      // following_List.forEach((value) => {
      //   if (value?.profile_picture) {
      //     value.profile_picture = process.env.BASE_URL + value.profile_picture;
      //   }
      // });

      // return multiSuccessRes(
      //   res,
      //   "Following list get successfuly",
      //   following_List,
      //   following_count
      // );


      let encounteredIds = new Map();
      let modifiedResults = [];

      // Assuming result and existingMember are arrays
      following_List?.forEach((value) => {

        if (value._id && !encounteredIds.has(value._id)) {
          let isMember = false;
          existingMember?.forEach((data) => {
            console.log("existingMember data", data);

            if (value._id.equals(data.user_id)) {
              console.log("it's true");
              isMember = true;
            }
          });

          modifiedResults.push({
            ...value,
            is_member: isMember
          });
          encounteredIds.set(value._id, true);
        }
      });

      let encounteredIdsAdmin = new Map();
      let adminReqmodifiedResults = [];

      modifiedResults?.forEach((value) => {
        let adminmodifiedData = { ...value }; // Initialize adminmodifiedData with the original value

        if (existingMemberInvite.length > 0) {
          existingMemberInvite.forEach((data) => {
            if (data.sender_id.equals(user_id) && data?.receiver_id.equals(value._id) && data.group_id.equals(group_id)) {
              console.log("Conditions met:");

              if (data?.is_accepted == null) {
                adminmodifiedData.admin_requested = true;
              } else {
                adminmodifiedData.admin_requested = false; // or any other default value
              }

              console.log("adminmodifiedData:");

              if (!encounteredIdsAdmin.has(value._id)) {
                adminReqmodifiedResults.push(adminmodifiedData);
                encounteredIdsAdmin.set(value._id, true);
              }
            } else {
           

              if (!encounteredIdsAdmin.has(value._id)) {
                adminmodifiedData.admin_requested = false; // or any other default value

                adminReqmodifiedResults.push(adminmodifiedData);
                encounteredIdsAdmin.set(value._id, true);
              }
            }
          });
        } else {
          if (!encounteredIdsAdmin.has(value._id)) {
            adminReqmodifiedResults.push(value);
            encounteredIdsAdmin.set(value._id, true);
          }
        }
      });

      return multiSuccessRes(
        res,
        "Following list get successfuly",
        adminReqmodifiedResults,
        following_count
      );
    } else {
      const searchTerms = search.split(" ");
      const regex = new RegExp(searchTerms.join("|"), "i");

      var result = await users
        .find({
          $and: [
            { $or: [{ full_name: regex }, { unique_name: regex }] },
            {
              _id: { $ne: user_id },
            },
            { _id: { $nin: blockedUserIds } },
            // { _id: { $nin: existingMemberIds } },
            { "following._id": { $nin: [user_id] } },
            // { _id: { $nin: notificationUserIds } },
            { is_deleted: false },
          ],
        })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ is_verified: -1 });


      // existingMember?.forEach((value) => {
      //   if (value._id) {
      //     result?.forEach((data) => {
      //       if (value.user_id.equals(data._id)) {
      //         console.log("data.user_id", value.user_id)

      //         result =
      //         {
      //           ...result,
      //           is_member: true
      //         }
      //       }
      //     })

      //   }
      // })


      let encounteredIds = new Map();
      let modifiedResults = [];

      // Assuming result and existingMember are arrays
      result?.forEach((value) => {
        console.log("existingMember value");

        if (value._id && !encounteredIds.has(value._id)) {
          let isMember = false;
          existingMember?.forEach((data) => {
            console.log("existingMember data", data);

            if (value._id.equals(data.user_id)) {
              console.log("it's true");
              isMember = true;
            }
          });

          modifiedResults.push({
            ...value._doc,
            is_member: isMember
          });
          encounteredIds.set(value._id, true);
        }
      });

      // existingMember?.forEach((value) => {
      //   if (value._id) {
      //     result?.forEach((data) => {
      //       var modifiedData;
      //       if (value.user_id.equals(data._id)) {
      //         console.log("data.user_id", value.user_id);
      //         // Create a modified version of the data
      //         var modifiedData = {
      //           ...data._doc,
      //           is_member: true
      //         };
      //       } else {
      //         var modifiedData = {
      //           ...data._doc,
      //           is_member: false,
      //         };
      //       }
      //       modifiedResults.push(modifiedData);
      //     });
      //   }
      // });


      // result?.forEach((value) => {

      //   console.log(" existingMember value ", value)
      //   if (value._id) {

      //     existingMember?.forEach((data) => {

      //       var modifiedData;
      //       console.log(" existingMember data", data)

      //       if (value._id.equals(data.user_id)) {

      //         console.log("it's true")
      //         var modifiedData = {
      //           ...value._doc,
      //           is_member: true
      //         };

      //         console.log("value._id+-----------------------",value._id)
      //         if (!encounteredIds.has(value._id)) {
      //           console.log("working")
      //           var modifiedData = {
      //             ...value._doc,
      //             is_member: false,
      //           };
      //           modifiedResults.push(modifiedData);
      //           encounteredIds.set(value._id, true);
      //         }
      //       } else {
      //        var modifiedData = {
      //           ...value._doc,
      //           is_member: false,
      //         };

      //         if (!encounteredIds.has(value._id)) {

      //           console.log(" not get it")

      //           var modifiedData = {
      //             ...value._doc,
      //             is_member: false,
      //           };
      //           modifiedResults.push(modifiedData);
      //           encounteredIds.set(value._id, true);
      //         }
      //       }
      //       // modifiedResults.push(modifiedData);
      //       // if (!encounteredIds.has(value._id)) {

      //       //   var modifiedData = {
      //       //     ...value._doc,
      //       //     is_member: false,
      //       //   };
      //       //   modifiedResults.push(modifiedData);
      //       //   encounteredIds.set(value._id, true);
      //       // }
      //     });
      //   }
      // });

      // console.log("modifiedResults",modifiedResults)
      // console.log("modifiedResults",modifiedResults)

      // let adminReqmodifiedResults = [];
      // modifiedResults?.forEach((value) => {

      //   existingMemberInvite.forEach((data) => {
      //     if (data.group_id.equals(group_id)) {
      //       if (data.sender_id.equals(user_id) && data?.receiver_id.equals(value._id)) {
      //         var adminmodifiedData;
      //         if (data?.is_accepted == null) {
      //           var adminmodifiedData = {
      //             ...value._doc,
      //             admin_requested: true
      //           };
      //         } else {
      //           // Handle the case when the condition is not met
      //           adminmodifiedData = {
      //             ...value._doc,
      //             admin_requested: false // or any other default value
      //           };
      //         }
      //         adminReqmodifiedResults.push(adminmodifiedData);

      //       }
      //     }
      //   })

      // })





      // let encounteredIdsAdmin = new Map();
      // let adminReqmodifiedResults = [];
      // modifiedResults?.forEach((value) => {

      //   console.log("value++++++++++++++++++++", value)

      //   if (existingMemberInvite.length > 0) {
      //     existingMemberInvite.forEach((data) => {


      //       console.log("data++++++++++++", data)
      //       var adminmodifiedData;
      //       if (data.sender_id.equals(user_id) && data?.receiver_id.equals(value._id) && data.group_id.equals(group_id)) {
      //         console.log("Conditions met:");

      //         if (data?.is_accepted == null) {
      //           adminmodifiedData = {
      //             ...value,
      //             admin_requested: true
      //           };
      //         }
      //         else {
      //           // Handle the case when the condition is not met
      //           adminmodifiedData = {
      //             ...value,
      //             admin_requested: false // or any other default value
      //           };
      //         }
      //         // adminReqmodifiedResults.push(adminmodifiedData);
      //         if (!encounteredIdsAdmin.has(value._id)) {
      //           adminReqmodifiedResults.push(adminmodifiedData);
      //           // Add the _id to the encounteredIdsAdmin map
      //           encounteredIdsAdmin.set(value._id, true);
      //         }
      //       } else {

      //         console.log("else working", value._id)
      //         // adminReqmodifiedResults.push(value);
      //         if (!encounteredIdsAdmin.has(value._id)) {
      //           adminmodifiedData = {
      //             ...value,
      //             admin_requested: false // or any other default value
      //           };

      //           adminReqmodifiedResults.push(value);
      //           // Add the _id to the encounteredIdsAdmin map
      //           encounteredIdsAdmin.set(value._id, true);
      //         }
      //       }
      //       // }
      //     });
      //   } else {
      //     if (!encounteredIdsAdmin.has(value._id)) {
      //       adminReqmodifiedResults.push(value);
      //       // Add the _id to the encounteredIdsAdmin map
      //       encounteredIdsAdmin.set(value._id, true);
      //     }
      //   }
      // });

      let encounteredIdsAdmin = new Map();
      let adminReqmodifiedResults = [];

      modifiedResults?.forEach((value) => {
        let adminmodifiedData = { ...value }; // Initialize adminmodifiedData with the original value

        if (existingMemberInvite.length > 0) {
          existingMemberInvite.forEach((data) => {
            if (data.sender_id.equals(user_id) && data?.receiver_id.equals(value._id) && data.group_id.equals(group_id)) {
              console.log("Conditions met:");

              if (data?.is_accepted == null) {
                adminmodifiedData.admin_requested = true;
              } else {
                adminmodifiedData.admin_requested = false; // or any other default value
              }

              if (!encounteredIdsAdmin.has(value._id)) {
                adminReqmodifiedResults.push(adminmodifiedData);
                encounteredIdsAdmin.set(value._id, true);
              }
            } else {

              if (!encounteredIdsAdmin.has(value._id)) {
                adminmodifiedData.admin_requested = false; // or any other default value

                adminReqmodifiedResults.push(adminmodifiedData);
                encounteredIdsAdmin.set(value._id, true);
              }
            }
          });
        } else {
          if (!encounteredIdsAdmin.has(value._id)) {
            adminReqmodifiedResults.push(value);
            encounteredIdsAdmin.set(value._id, true);
          }
        }
      });



      var result_count = await users
        .find({
          $and: [
            { $or: [{ full_name: regex }, { unique_name: regex }] },
            {
              _id: { $ne: user_id },
            },
            { _id: { $nin: blockedUserIds } },
            // { _id: { $nin: existingMemberIds } },
            { "following._id": { $nin: [user_id] } },
            // { _id: { $nin: notificationUserIds } },
            { is_deleted: false },
          ],
        })
        .count();

      const formattedResult = adminReqmodifiedResults.map((value) => ({
        _id: value._id,
        full_name: value.full_name,
        profile_picture: value.profile_picture
          ? process.env.BASE_URL + value.profile_picture
          : null,
        profile_url: value.profile_url,
        is_verified: value.is_verified,

        is_member: value?.is_member,
        admin_requested: value?.admin_requested
      }));

      return multiSuccessRes(
        res,
        "Searching user data get successful",
        formattedResult,
        result_count
      );
    }
  } catch (error) {
    console.log(error);
    return errorRes(res, "Internal Server Error!");
  }
};

const groupReport = async (req, res) => {
  try {
    var user_id = req.user._id;
    var { reason_report, group_id } = req.body;

    if (user_id) {
      var find_user = await users
        .findById(user_id)
        .where({ is_deleted: false });

      if (!find_user) {
        return errorRes(res, "Couldn't found user");
      }
    }

    var create_report = await group_report.create({
      user_id,
      reason_report,
      group_id,
    });

    if (create_report) {
      return successRes(res, "Group report created successfully");
    }
  } catch (error) {
    console.log(error);
    return errorRes(res, "Internal Server Error!");
  }
};

const userInGroup = async (req, res) => {
  try {
    var { user_id, group_id } = req.body;

    if (user_id) {
      var find_user = await users
        .findById(user_id)
        .where({ is_deleted: false });

      if (!find_user) {
        return errorRes(res, "Couldn't found user");
      }
    }

    if (group_id) {
      var find_group = await group
        .findById(group_id)
        .where({ is_deleted: false });

      if (!find_group) {
        return errorRes(res, "Couldn't found group");
      }
    }

    var existingMember = await group_members.find({
      user_id: user_id,
      group_id: group_id,
    });

    var existingRequest = await notifications.find({
      noti_for: "group_join_request",
      is_accepted: null,
      sender_id: user_id,
      group_id: group_id,
    });

    var existingInvite = await notifications.find({
      noti_for: "group_invite",
      is_accepted: null,
      receiver_id: user_id,
      group_id: group_id,
    });

    var response = {
      in_group: existingMember.length > 0,
      is_request: existingRequest.length > 0,
      is_invite: existingInvite.length > 0,
      is_private: find_group ? find_group.is_private : null,
    };

    return successRes(res, "User group status", response);
  } catch (error) {
    console.log(error);
    return errorRes(res, "Internal Server Error!");
  }
};

const shareUserlist = async (req, res) => {
  try {
    if (!req.body.user_id) {
      var user_id = req.user._id;
    } else {
      var user_id = req.body.user_id;
    }
    var { page = 1, limit = 10, search } = req.body;
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

    if (search == undefined || search == "undefined") {
      const follower_count = await follower_following.countDocuments({
        following_id: user_id,
        is_deleted: false,
        is_request: true,
      });

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
            localField: "following_id",
            foreignField: "_id",
            as: "following",
          },
        },
        {
          $unwind: "$following",
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
            _id: "$user._id",
            full_name: "$user.full_name",
            profile_picture: {
              $concat: [process.env.BASE_URL, "$user.profile_picture"],
            },
            profile_url: "$user.profile_url",
            is_verified: "$user.is_verified",
          },
        },
        {
          $skip: (page - 1) * parseInt(limit),
        },
        {
          $limit: parseInt(limit),
        },
      ];

      const follower_List = await follower_following.aggregate(pipeline_follow);

      follower_List.forEach((value) => {
        if (value?.following_id?.profile_picture) {
          value.following_id.profile_picture =
            process.env.BASE_URL + value.following_id.profile_picture;
        }

        if (value?.user_id?.profile_picture) {
          value.user_id.profile_picture =
            process.env.BASE_URL + value.user_id.profile_picture;
        }
      });

      return multiSuccessRes(
        res,
        "Follower list get successfuly",
        follower_List,
        follower_count
      );
    } else {
      const searchTerms = search.split(" ");
      const regex = new RegExp(searchTerms.join("|"), "i");

      var result = await users
        .find({
          $and: [
            { $or: [{ full_name: regex }, { unique_name: regex }] },
            {
              _id: { $ne: user_id },
            },
            { _id: { $nin: blockedUserIds } },
          ],
        })
        .select("_id full_name profile_picture profile_url is_verified")
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ is_verified: -1 });

      var result_count = await users
        .find({
          $and: [
            { $or: [{ full_name: regex }, { unique_name: regex }] },
            {
              _id: { $ne: user_id },
            },
            { _id: { $nin: blockedUserIds } },
          ],
        })
        .count();

      result.forEach((value) => {
        if (value?.profile_picture) {
          value.profile_picture = process.env.BASE_URL + value.profile_picture;
        }
      });

      return multiSuccessRes(
        res,
        "Searching user data get successful",
        result,
        result_count
      );
    }
  } catch (error) {
    console.log("error:", error);
    return errorRes(res, "Internal Server Error!");
  }
};

const groupListcheck = async (req, res) => {
  try {
    var user_id = req.user._id;
    var { other_user_id, page = 1, limit = 80 } = req.body;
    console.log("user_id", user_id)
    console.log("req.body", other_user_id)


    if (other_user_id && user_id) {

      console.log("++++++++++---------------")

      var findMembersGroup = await group_members.distinct("group_id", {
        user_id: user_id,
        is_deleted: false,
      });

      var findMembersGroupcount = await group_members.distinct("group_id", {
        user_id: user_id,
        is_deleted: false,
      });
      var findMembersGroupcountlength = findMembersGroupcount.length

      var whereCond = {}
      whereCond =
      {
        _id: {
          $in: findMembersGroup
        },
        is_deleted: false,
      }

      var groupList = await group
        .find(whereCond)
        .select(
          "user_id group_name group_description group_code is_deleted group_image is_private interest_id sub_interest_id"
        )
        .populate({
          path: "user_id",
          select: "full_name profile_url profile_picture",
        })
        .limit(limit * page)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });


      const baseUrl = process.env.BASE_URL;
      var groupLists = await Promise.all(
        groupList.map(async (value) => {
          var result = { ...value._doc };


          var group_members_count = await group_members
            .find()
            .where({ is_deleted: false, group_id: value._id })
            .count();

          result = {
            ...result,
            member_count: group_members_count,
            last_message: null,
            last_message_time: null,
            unread_message: null,
          };

          let is_requested = false;
          let is_invited = false;
          let is_member = false;
          var request_check = await notifications.findOne().where({
            is_deleted: false,
            group_id: value._id,
            is_accepted: null,
            sender_id: other_user_id,
            noti_for: "group_join_request",
          });

          var request_check_data = await notifications.findOne().where({
            is_deleted: false,
            group_id: value._id,
            is_accepted: true,
            sender_id: other_user_id,
            noti_for: "group_join_request",
          });


          console.log("request_check_data", request_check_data)

          if (request_check) {
            is_requested = true;
          }

          var invite_check = await notifications.findOne().where({
            is_deleted: false,
            group_id: value._id,
            is_accepted: null,
            receiver_id: other_user_id,
            noti_for: "group_invite",
          });

          console.log("--------------------", invite_check)

          if (invite_check) {
            is_invited = true;
          }

          const existingMember = await group_members.findOne({
            group_id: value._id,
            user_id: other_user_id,
            is_deleted: false,
          });

          if (existingMember) {
            is_member = true;
          }
          result = {
            ...result,
            is_requested: is_requested,
            is_invited: is_invited,
            is_member: is_member
          };

          return result;

        })
      );

      for (const value of groupLists) {
        if (value.group_image && !value.group_image.includes(baseUrl)) {
          value.group_image = baseUrl + value.group_image;
        }
        if (
          value.user_id?.profile_picture &&
          !value.user_id.profile_picture.includes(baseUrl)
        ) {
          value.user_id.profile_picture = baseUrl + value.user_id.profile_picture;
        }
      }


      return multiSuccessRes(
        res,
        "Group list get successfully",
        groupLists,
        findMembersGroupcountlength
      );

    }

    if (user_id) {
      var findMembersGroup = await group_members.distinct("group_id", {
        user_id: user_id,
        is_deleted: false,
      });
      var whereCond = {}
      whereCond =
      {
        _id: {
          $in: findMembersGroup
        },
        is_deleted: false,
      }

      console.log("whereCond", whereCond)
      var findMembersGroupcount = await group_members.distinct("group_id", {
        user_id: user_id,
        is_deleted: false,
      });
      var findMembersGroupcountlength = findMembersGroupcount.length

      var groupList = await group
        .find(whereCond)
        .select(
          "user_id group_name group_description group_code is_deleted group_image is_private interest_id sub_interest_id"
        )
        .populate({
          path: "user_id",
          select: "full_name profile_url profile_picture",
        })
        .limit(limit * page)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      var groupLists = await Promise.all(
        groupList.map(async (value) => {
          var result = { ...value._doc };

          var group_members_count = await group_members
            .find()
            .where({ is_deleted: false, group_id: value._id })
            .count();

          result = {
            ...result,
            member_count: group_members_count,
            last_message: null,
            last_message_time: null,
            unread_message: null,
          };

          return result;

        })
      );

      const baseUrl = process.env.BASE_URL;
      for (const value of groupLists) {
        if (value.group_image && !value.group_image.includes(baseUrl)) {
          value.group_image = baseUrl + value.group_image;
        }
        if (
          value.user_id?.profile_picture &&
          !value.user_id.profile_picture.includes(baseUrl)
        ) {
          value.user_id.profile_picture = baseUrl + value.user_id.profile_picture;
        }
      }

      return multiSuccessRes(
        res,
        "Group list get successfully",
        groupLists,
        findMembersGroupcountlength
      );
    }
  } catch (error) {
    console.log(error);
    return errorRes(res, "Internal Server Error!");
  }
}

module.exports = {
  createGroup,
  editGroup,
  groupDetails,
  groupList,
  joinGroup,
  requestToJoinGroup,
  acceptDeclineJoinRequest,
  leaveGroup,
  deleteGroup,
  inviteUserInGroup,
  membersList,
  groupReport,
  userInGroup,
  shareUserlist,
  groupListcheck
};
