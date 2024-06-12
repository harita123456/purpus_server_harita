const follower_following = require("../../../../models/M_follower_following");
const block_user = require("../../../../models/M_block_user");
const {
  successRes,
  errorRes,
  multiSuccessRes,
} = require("../../../../utils/common_fun");
const ObjectId = require("mongodb").ObjectId;
const mongoose = require("mongoose");

const users = require("../../../../models/M_user");
const subinterest = require("../../../../models/M_sub_interest");
const group_members = require("../../../../models/M_group_members");
const user_interactions = require("../../../../models/M_user_interactions");

const connectionList = async (req, res) => {
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

    var { search, following, page = 1, limit = 1 } = req.body;

    var existinguser = await users.findOne().where({
      _id: user_id,
      is_deleted: false,
    });

    if (!existinguser) {
      return errorRes(res, "This user does not exist");
    }
    var find_data;

    const follower_count_data = await follower_following.find({
      following_id: user_id,
      is_deleted: false,
    });

    const following_count_data = await follower_following.find({
      user_id: user_id,
      is_deleted: false,
    });

    var store_ids = [];

    following_count_data.map((data) => {
      store_ids.push(data.following_id);
    });

    // var store_connection_data = [];
    // store_ids.map((value) => {
    //   follower_count_data.map((data) => {
    //     if (value.equals(data.user_id)) {
    //       store_connection_data.push(data.user_id);
    //     }
    //   });
    // });

    var store_connection_data = [];

    store_ids.forEach((value) => {
      follower_count_data.forEach((data) => {
        if (value.equals(data.user_id)) {
          store_connection_data.push(data.user_id);
        }
      });
    });

    const connection_count = await users.countDocuments({
      _id: { $in: store_connection_data },
      is_deleted: false,
    });

    if (following == true || following == "true") {
      const pipeline = [
        {
          $match: {
            user_id: new ObjectId(user_id),
            is_deleted: false,
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
          $lookup: {
            from: "users",
            localField: "following_id",
            foreignField: "_id",
            as: "following",
          },
        },
        {
          $unwind: "$user",
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
            user_id: "$user",
            following_id: "$following",
          },
        },
        {
          $skip: (page - 1) * parseInt(limit),
        },
        {
          $limit: parseInt(limit),
        },
      ];

      const following_list = await follower_following.aggregate(pipeline);

      find_data = {
        ...find_data,
        following_list: following_list,
      };
    }

    const pipeline_search = [
      {
        $match: {
          is_deleted: false,
          _id: { $in: store_connection_data },
          $or: [
            { full_name: { $regex: new RegExp(search, "i") } },
            { unique_name: { $regex: new RegExp(search, "i") } },
          ],
        },
      },
      {
        $skip: (page - 1) * parseInt(limit),
      },
      {
        $limit: parseInt(limit),
      },
    ];

    const follower_list = await users.aggregate(pipeline_search);
    find_data = {
      ...find_data,
      connections: follower_list,
      connections_count: connection_count,
    };

    find_data?.connections?.map(async (data) => {
      if (data?.profile_picture) {
        data.profile_picture = process.env.BASE_URL + data.profile_picture;
      }
    });

    return successRes(res, "Connection list get successfully", find_data);
  } catch (error) {
    console.log(error);
    return errorRes(res, "Internal Server Error!");
  }
};

const connectionCount = async (req, res) => {
  try {

    let user_id
    // if (!req.body.user_id) {
    //   var user_id = req.user._id;
    // } else {
    //   var user_id = req.body.user_id;
    // }

    if (!req.body.user_id) {
      user_id = req.user._id;
    } else {
      user_id = req.body.user_id;
    }

    var find_user = await users.findOne().where({
      _id: user_id,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, "This user does not exist");
    }

    const following_count_data = await follower_following.find({
      user_id: user_id,
      is_deleted: false,
    });

    const follower_count_data = await follower_following.find({
      following_id: user_id,
      is_deleted: false,
    });

    var store_ids = [];

    following_count_data.map((data) => {
      store_ids.push(data.following_id);
    });

    // var store_connection_data = [];
    // store_ids.map((value) => {
    //   follower_count_data.map((data) => {
    //     if (value.equals(data.user_id)) {
    //       store_connection_data.push(data.user_id);
    //     }
    //   });
    // });
    var store_connection_data = [];

    store_ids.forEach((value) => {
      follower_count_data.forEach((data) => {
        if (value.equals(data.user_id)) {
          store_connection_data.push(data.user_id);
        }
      });
    });

    const connection_count = await users.countDocuments({
      _id: { $in: store_connection_data },
      is_deleted: false,
    });

    const following_count = await follower_following.countDocuments({
      user_id: user_id,
      is_deleted: false,
      is_request: true,
    });

    const group_count = await group_members.countDocuments({
      user_id: user_id,
      is_deleted: false,
    });

    var data = {
      connection_count: connection_count,
      following_count: following_count,
      group_count: group_count,
    };

    return successRes(res, "Connection list count", data);
  } catch (error) {
    console.log("error", error);
    return errorRes(res, "Internal Server Error!");
  }
};

const connectionSuggestion = async (req, res) => {
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
    var login_user = req.user._id;

    var { language } = req.body;

    var find_user = await users.findOne().where({
      _id: user_id,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, "Couldn't found user!");
    }

    var following_data_array = [];

    const following_data = await follower_following.find({
      user_id: user_id,
      is_deleted: false,
      is_request: true,
    });
    if (following_data) {
      following_data.map((value) => {
        following_data_array.push(value?.following_id);
      });

      following_data_array.push(find_user?._id);
    }

    const userBlockedByOthers = await block_user.find({
      user_id: login_user,
      is_deleted: false,
    });
    const usersBlockingCurrentUser = await block_user.find({
      block_user_id: login_user,
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
        $sort: { count: -1 }
      },
      {
        $limit: 4
      },
      {
        $project: {
          sub_interest_id: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    const top4SubInterestIds = subinterestCountResult.map(entry => entry.sub_interest_id);

    const matchingUsers = await users.aggregate([
      {
        $match: {
          _id: {
            $ne: new ObjectId(user_id), $nin: [
              ...following_data_array.map(
                (id) => new mongoose.Types.ObjectId(id)
              ),
              ...blockedUserIds?.map(
                (id) => new mongoose.Types.ObjectId(id)
              ),
            ]
          },
          is_deleted: false,
          is_block: false,
          interested: { $in: top4SubInterestIds }
        },
      },
      {
        $unwind: "$interested",
      },
      {
        $match: {
          interested: { $in: top4SubInterestIds }
        },
      },
      {
        $sort: {
          "interested.is_verified": -1,
        },
      },
      {
        $group: {
          _id: "$interested",
          users: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 0,
          interest_id: "$_id",
          users: { $slice: ["$users", 1000] },
        },
      },
    ]);

    matchingUsers?.forEach((group) => {
      group.users = group.users.sort(() => Math.random() - 0.5);
      group.users = group.users.slice(0, 4);
    });

    for (const interestGroup of matchingUsers) {
      await Promise.all(
        interestGroup.users.map(async (data) => {
          try {
            const followReqData = await follower_following.find({
              user_id: user_id,
              is_deleted: false,
              is_request: false,
              following_id: data._id,
            });

            const isRequest = followReqData.length > 0;

            data.is_request = isRequest;
          } catch (error) {
            console.error("Error processing follow requests:", error);
          }
        })
      );
    }

    const interestNames = await subinterest.find({
      _id: { $in: top4SubInterestIds },
    }).populate({
      path: "interest_id hindi kannada malayalam tamil telugu",
      select: "color_code "
    })

    const matchdata = matchingUsers?.map((interestGroup) => {
      const interestName = interestNames.find(({ _id }) =>
        _id.equals(interestGroup?.interest_id)
      )

      return {
        ...interestGroup,
        interest_name: language === 'hindi' ? interestName?.hindi :
          language === 'kannada' ? interestName?.kannada :
            language === 'telugu' ? interestName?.telugu :
              language === 'tamil' ? interestName?.tamil :
                language === 'malayalam' ? interestName?.malayalam :
                  interestName?.sub_interest,
        hindi: interestName?.hindi,
        kannada: interestName?.kannada,
        malayalam: interestName?.malayalam,
        tamil: interestName?.tamil,
        telugu: interestName?.telugu,
        color_code: interestName?.interest_id?.color_code
      };
      //  else 
      //  {
      //   return {
      //     ...interestGroup,
      //     interest_name: interestName?.sub_interest,
      //     hindi: interestName?.hindi,
      //     kannada: interestName?.kannada,
      //     malayalam: interestName?.malayalam,
      //     tamil: interestName?.tamil,
      //     telugu: interestName?.telugu,
      //     color_code: interestName?.interest_id?.color_code
      //   };
      // }

    });

    matchdata?.forEach((value) => {

      value?.users?.map((data) => {
        if (data?.profile_picture != null) {
          data.profile_picture = process.env.BASE_URL + data.profile_picture;
        }
      });
    });


    if (matchdata) {
      return successRes(
        res,
        "Manage connections list get successfully",
        matchdata
      );
    }
  } catch (error) {
    console.log("error", error);
    return errorRes(res, "Internal Server Error!");
  }
};

const allInterestuser = async (req, res) => {
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

    var { interest_id, excludeUser, includeUser, page = 1, limit = 10 } = req.body;

    var find_user = await users.findOne().where({
      _id: user_id,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, "Couldn't found user!");
    }
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

    if (excludeUser) {
      var excludeUserdata = JSON.parse(excludeUser)
    }
    if (includeUser) {
      var includeUserdata = JSON.parse(includeUser)
    }

    var following_data_array = [];

    const following_data = await follower_following.find({
      user_id: user_id,
      is_deleted: false,
      is_request: true,
    });
    if (following_data) {
      following_data.map((value) => {
        following_data_array.push(value?.following_id);
      });

      following_data_array.push(find_user?._id);
    }

    if (includeUserdata?.length > 0) {
      let interestedUsers = await users
        .find({
          _id: {
            $nin: [
              ...blockedUserIds.map(
                (id) => new mongoose.Types.ObjectId(id)
              ),
              ...following_data_array.map(
                (id) => new mongoose.Types.ObjectId(id)
              ),
              ...includeUserdata.map(
                (id) => new mongoose.Types.ObjectId(id)
              ),
              new mongoose.Types.ObjectId(user_id),
            ],
          },
          is_deleted: false,
          interested: { $in: [new mongoose.Types.ObjectId(interest_id)] },
        })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const interestedUsersCount = await users.countDocuments({
        _id: {
          $nin: [
            ...following_data_array.map((id) => new mongoose.Types.ObjectId(id)),
            ...blockedUserIds.map(
              (id) => new mongoose.Types.ObjectId(id)
            ),
            ...includeUserdata.map(
              (id) => new mongoose.Types.ObjectId(id)
            ),
            new mongoose.Types.ObjectId(user_id),
          ],
        },
        is_deleted: false,
        interested: { $in: [new mongoose.Types.ObjectId(interest_id)] },
      });

      var findincludeUserdata = await users.find({
        _id: {
          $nin: [
            ...blockedUserIds.map(
              (id) => new mongoose.Types.ObjectId(id)
            ),
          ],
          $in: [
            ...includeUserdata?.map(
              (id) => new mongoose.Types.ObjectId(id)
            ),
          ],
        },
        is_deleted: false,
        interested: { $in: [new mongoose.Types.ObjectId(interest_id)] },
      })

      if (page == "1" && findincludeUserdata.length > 0) {
        const includeUserObjectIds = includeUserdata.map(id => new mongoose.Types.ObjectId(id));
        var findincludeUser = await users.find({
          _id: {
            $in: includeUserObjectIds,
          },
          is_deleted: false,
          interested: { $in: [new mongoose.Types.ObjectId(interest_id)] },
        });

        const idIndexMap = new Map();
        includeUserdata.forEach((id, index) => {
          idIndexMap.set(id.toString(), index);
        });

        findincludeUser.sort((a, b) => {
          const indexA = idIndexMap.get(a._id.toString());
          const indexB = idIndexMap.get(b._id.toString());
          if (indexA === undefined && indexB === undefined) {
            return 0;
          } else if (indexA === undefined) {
            return 1;
          } else if (indexB === undefined) {
            return -1;
          }
          return indexA - indexB;
        });

        interestedUsers = [...findincludeUser, ...interestedUsers];
      }
      interestedUsers?.forEach((value) => {
        if (value?.profile_picture != null) {
          value.profile_picture = process.env.BASE_URL + value.profile_picture;
        }
      });
      const modifiedInterestedUsers = await Promise.all(
        interestedUsers.map(async (data) => {
          const followReqData = await follower_following.find({
            user_id: user_id,
            is_deleted: false,
            is_request: false,
            following_id: data?._id,
          });

          if (
            followReqData.length > 0 &&
            followReqData[0].following_id.equals(data._id)
          ) {
            data = { ...data._doc, is_request: true };
          }

          return data;
        })
      );
      if (modifiedInterestedUsers) {
        return multiSuccessRes(
          res,
          "Follower list get successfuly",
          modifiedInterestedUsers,
          interestedUsersCount
        );
      }
    } else {
      let interestedUsers = await users
        .find({
          _id: {
            $nin: [
              ...blockedUserIds.map(
                (id) => new mongoose.Types.ObjectId(id)
              ),
              ...following_data_array.map(
                (id) => new mongoose.Types.ObjectId(id)
              ),
              ...excludeUserdata?.map(
                (id) => new mongoose.Types.ObjectId(id)
              ),
              new mongoose.Types.ObjectId(user_id),
            ],
          },
          is_deleted: false,
          interested: { $in: [new mongoose.Types.ObjectId(interest_id)] },
        })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const interestedUsersCount = await users.countDocuments({
        _id: {
          $nin: [
            ...blockedUserIds.map(
              (id) => new mongoose.Types.ObjectId(id)
            ),
            ...following_data_array.map((id) => new mongoose.Types.ObjectId(id)),
            ...excludeUserdata.map(
              (id) => new mongoose.Types.ObjectId(id)
            ),

            new mongoose.Types.ObjectId(user_id),
          ],
        },
        is_deleted: false,
        interested: { $in: [new mongoose.Types.ObjectId(interest_id)] },
      });

      interestedUsers?.forEach((value) => {
        if (value?.profile_picture != null) {
          value.profile_picture = process.env.BASE_URL + value.profile_picture;
        }
      });
      const modifiedInterestedUsers = await Promise.all(
        interestedUsers?.map(async (data) => {
          const followReqData = await follower_following.find({
            user_id: user_id,
            is_deleted: false,
            is_request: false,
            following_id: data?._id,
          });

          if (
            followReqData.length > 0 &&
            followReqData[0].following_id.equals(data._id)
          ) {
            data = { ...data._doc, is_request: true };
          }

          return data;
        })
      );
      if (modifiedInterestedUsers) {
        return multiSuccessRes(
          res,
          "Follower list get successfuly",
          modifiedInterestedUsers,
          interestedUsersCount
        );
      }
    }
  } catch (error) {
    console.log("error", error);
    return errorRes(res, "Internal Server Error!");
  }
};

module.exports = {
  connectionList,
  connectionCount,
  connectionSuggestion,
  allInterestuser,
};