const {
  successRes,
  errorRes,
  multiSuccessRes,
} = require("../../../../utils/common_fun");
const users = require("../../../../models/M_user");
const pollvotes = require("../../../../models/M_poll_votes");
const save_post = require("../../../../models/M_save_post");
const like_post = require("../../../../models/M_like_post");
const block_user = require("../../../../models/M_block_user");
const post = require("../../../../models/M_post");
const follower_following = require("../../../../models/M_follower_following");
const user_impressions = require("../../../../models/M_user_impression")
const view_post = require("../../../../models/M_post_view");
const geolib = require('geolib');

const getAllfollowingpost = async (req, res) => {
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

    const following_list_data = await follower_following.find({
      user_id: user_id,
      is_request: true,
      is_deleted: false,
    });

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

    const followingIds = following_list_data.map((item) => item.following_id);

    var find_user = await users.findOne().where({
      _id: user_id,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, "This user does not exist");
    }

    var userPosts = await post
      .find({
        user_id: {
          $in: followingIds,
          $nin: blockedUserIds,
        },
        is_deleted: false,
        is_block: false,
      })
      .populate({
        path: "user_id",
        select:
          "unique_name full_name post_type profile_url profile_picture is_private_account is_verified",
      })
      .populate("interest_id sub_interest_id")
      .populate({
        path: "repost_id",
        populate: {
          path: "user_id",
          select:
            "unique_name full_name post_type profile_url profile_picture is_private_account is_verified",
        },
      })
      .sort({ createdAt: "desc" })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    var userPostsCount = await post.countDocuments({
      user_id: {
        $in: followingIds,
        $nin: blockedUserIds,
      },
      is_deleted: false,
      is_block: false,
    });

    if (!userPosts || userPosts.length === 0) {
      return successRes(res, "No posts found for this user", []);
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

        const is_view_impression = await user_impressions.findOne({
          user_id: user_id,
          post_id: data._id,
        });

        const is_view_Post = await view_post.findOne({
          user_id: user_id,
          post_id: data._id,
        });

        const is_repost_you_status = await post.findOne({
          user_id: user_id,
          // repost_id: data?.repost_id?._id,
          repost_id: data.repost_id._id,
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
          var store_option_id_is_repost_use = repostIsPolled?.option_id;

          const is_repost_you_status = await post.findOne({
            user_id: user_id,
            // repost_id: data?.repost_id?._id,
            repost_id: data.repost_id._id,
            is_deleted: false
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
            store_option_id: store_option_id_is_repost_use,
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
      "Posts retrieved successfully",
      userPosts,
      userPostsCount
    );
  } catch (error) {
    console.log("Error:", error);
    return errorRes(res, "Internal server error");
  }
};

const getAllLocalpost = async (req, res) => {
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
      page = 1,
      limit = 10,
      lat,
      long,
      miles_distance = 10,
      trending,
      newest,
      top,
      language

    } = req.body;

    if (miles_distance > 100) {
      return errorRes(res, "You can go only 100 miles");
    }

    var find_user = await users.findOne().where({
      _id: user_id,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, "This user does not exist");
    }

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

    var where_condition = {
      user_id: {
        $nin: blockedUserIds,
      },
      is_deleted: false,
      is_local: true,
      is_block: false,
    };

    var max_distance = miles_distance * 1609.34;

    if (lat && long) {
      where_condition = {
        ...where_condition,
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [long, lat],
            },
            $maxDistance: max_distance,
          },
        },
      };
    }

    if (trending == true || trending == "true") {
      const timeFrameInHours = 24;
      where_condition = {
        ...where_condition,
        createdAt: {
          $gte: new Date(Date.now() - timeFrameInHours * 60 * 60 * 1000),
        },
      };
      let find_local_post_trending
      // var find_local_post_trending = await post
      find_local_post_trending = await post
        .find()
        .where(where_condition)
        .populate({
          path: "user_id",
          select:
            "unique_name full_name post_type profile_url profile_picture full_name is_verified",
        })
        .populate("interest_id sub_interest_id")
        .populate({
          path: "repost_id",
          populate: {
            path: "user_id",
            select:
              "unique_name full_name post_type profile_url profile_picture full_name is_verified",
          },
        })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ like_count: -1, comment_count: -1 });

      if (find_local_post_trending.length <= 0) {
        const timeFrameInHours = 1000;
        where_condition = {
          ...where_condition,
          createdAt: {
            $gte: new Date(Date.now() - timeFrameInHours * 60 * 60 * 1000),
          },
        };
        // var find_local_post_trending = await post
        find_local_post_trending = await post
          .find()
          .where(where_condition)
          .populate({
            path: "user_id",
            select:
              "unique_name full_name post_type profile_url profile_picture full_name is_verified",
          })
          .populate("interest_id sub_interest_id")
          .populate({
            path: "repost_id",
            populate: {
              path: "user_id",
              select:
                "unique_name full_name post_type profile_url profile_picture full_name is_verified",
            },
          })
          .limit(limit * 1)
          .skip((page - 1) * limit)
          .sort({ like_count: -1, comment_count: -1 });

        find_local_post_trending = await Promise.all(
          find_local_post_trending.map(async (data) => {
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

            const is_view_impression = await user_impressions.findOne({
              user_id: user_id,
              post_id: data._id,
            });

            const is_view_Post = await view_post.findOne({
              user_id: user_id,
              post_id: data._id,
            });
            const is_repost_you_status = await post.findOne({
              user_id: user_id,
              // repost_id: data?.repost_id?._id,
              repost_id: data.repost_id._id,
              is_deleted: false,
              is_repost: true
            })
            const postCoordinates = data.location.coordinates;
            let point1 = {
              latitude: lat,
              longitude: long,
            };
            let point2 = {
              latitude: postCoordinates[1],
              longitude: postCoordinates[0],
            };
            let distanceInMeters = geolib.getDistance(point1, point2);
            let distanceInMiles = geolib.convertDistance(
              distanceInMeters,
              "mi"
            );

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
              distance: distanceInMiles.toFixed(2)
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

              const is_view_impression = await user_impressions.findOne({
                user_id: user_id,
                post_id: data.repost_id._id
              });

              const is_view_Post = await view_post.findOne({
                user_id: user_id,
                post_id: data.repost_id._id
              });
              const is_repost_you_status = await post.findOne({
                user_id: user_id,
                // repost_id: data?.repost_id?._id,
                repost_id: data.repost_id._id,
                is_deleted: false,
                is_repost: true
              })

              var store_option_id_is_repost = repostIsPolled?.option_id;

              // const postCoordinates = data?.repost_id?.location.coordinates;
              const postCoordinates = data.repost_id.location.coordinates;
              let point1 = {
                latitude: lat,
                longitude: long,
              };
              let point2 = {
                latitude: postCoordinates[1],
                longitude: postCoordinates[0],
              };
              let distanceInMeters = geolib.getDistance(point1, point2);
              let distanceInMiles = geolib.convertDistance(
                distanceInMeters,
                "mi"
              );
              updatedPost.repost_id = {
                ...data.repost_id.toObject(),
                is_like: !!repostIsLiked,
                is_save: !!repostIsSaved,
                is_poll_response: !!repostIsPolled,
                store_option_id: store_option_id_is_repost,
                is_repost_you: !!is_repost_you_status,
                is_view_impression: !!is_view_impression,
                is_view_Post: !!is_view_Post,
                distance: distanceInMiles.toFixed(2)
              };
            }
            return updatedPost;
          })
        );

        find_local_post_trending.forEach(async (post) => {
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
        var find_local_post_count_trending = await post
          .find()
          .where(where_condition)
          .count();
        if (find_local_post_trending.length > 0) {
          return multiSuccessRes(
            res,
            "Local post retrieved successfully",
            find_local_post_trending,
            find_local_post_count_trending
          );
        } else {
          return successRes(res, "No posts found for this user", []);
        }
      }
      find_local_post_trending = await Promise.all(
        find_local_post_trending.map(async (data) => {
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

          const is_view_impression = await user_impressions.findOne({
            user_id: user_id,
            post_id: data._id,
          });

          const is_view_Post = await view_post.findOne({
            user_id: user_id,
            post_id: data._id,
          });
          const is_repost_you_status = await post.findOne({
            user_id: user_id,
            // repost_id: data?.repost_id?._id,
            repost_id: data.repost_id._id,
            is_deleted: false,
            is_repost: true
          })
          const postCoordinates = data.location.coordinates;
          let point1 = {
            latitude: lat,
            longitude: long,
          };
          let point2 = {
            latitude: postCoordinates[1],
            longitude: postCoordinates[0],
          };
          let distanceInMeters = geolib.getDistance(point1, point2);
          let distanceInMiles = geolib.convertDistance(
            distanceInMeters,
            "mi"
          );
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
            distance: distanceInMiles.toFixed(2)
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

            const is_view_impression = await user_impressions.findOne({
              user_id: user_id,
              post_id: data.repost_id._id
            });

            const is_view_Post = await view_post.findOne({
              user_id: user_id,
              post_id: data.repost_id._id
            });
            const is_repost_you_status = await post.findOne({
              user_id: user_id,
              // repost_id: data?.repost_id?._id,
              repost_id: data.repost_id._id,
              is_deleted: false,
              is_repost: true
            })

            var store_option_id_use = repostIsPolled?.option_id;


            // const postCoordinates = data?.repost_id?.location.coordinates;
            const postCoordinates = data.repost_id.location.coordinates;
            let point1 = {
              latitude: lat,
              longitude: long,
            };
            let point2 = {
              latitude: postCoordinates[1],
              longitude: postCoordinates[0],
            };
            let distanceInMeters = geolib.getDistance(point1, point2);
            let distanceInMiles = geolib.convertDistance(
              distanceInMeters,
              "mi"
            );
            updatedPost.repost_id = {
              ...data.repost_id.toObject(),
              is_like: !!repostIsLiked,
              is_save: !!repostIsSaved,
              is_poll_response: !!repostIsPolled,
              store_option_id: store_option_id_use,
              is_repost_you: !!is_repost_you_status,
              is_view_impression: !!is_view_impression,
              is_view_Post: !!is_view_Post,
              distance: distanceInMiles.toFixed(2)
            };
          }
          return updatedPost;
        })
      );

      find_local_post_trending.forEach(async (post) => {
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
      var find_local_post_count_all = await post
        .find()
        .where(where_condition)
        .count();
      if (find_local_post_trending.length > 0) {
        return multiSuccessRes(
          res,
          "Local post retrieved successfully",
          find_local_post_trending,
          find_local_post_count_all
        );
      } else {
        return successRes(res, "No posts found for this user", []);
      }
    }

    if (newest == true || newest == "true") {
      var find_local_post_newest = await post
        .find()
        .where(where_condition)
        .populate({
          path: "user_id",
          select:
            "unique_name full_name post_type profile_url profile_picture full_name is_verified",
        })
        .populate("interest_id sub_interest_id")
        .populate({
          path: "repost_id",
          populate: {
            path: "user_id",
            select:
              "unique_name full_name post_type profile_url profile_picture full_name is_verified",
          },
        })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      find_local_post_newest = await Promise.all(
        find_local_post_newest.map(async (data) => {
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

          const is_view_impression = await user_impressions.findOne({
            user_id: user_id,
            post_id: data._id,
          });

          const is_view_Post = await view_post.findOne({
            user_id: user_id,
            post_id: data._id,
          });

          const is_repost_you_status = await post.findOne({
            user_id: user_id,
            // repost_id: data?.repost_id?._id,
            repost_id: data.repost_id._id,
            is_deleted: false,
            is_repost: true
          })

          const postCoordinates = data.location.coordinates;
          let point1 = {
            latitude: lat,
            longitude: long,
          };
          let point2 = {
            latitude: postCoordinates[1],
            longitude: postCoordinates[0],
          };
          let distanceInMeters = geolib.getDistance(point1, point2);
          let distanceInMiles = geolib.convertDistance(
            distanceInMeters,
            "mi"
          );
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
            distance: distanceInMiles.toFixed(2)
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

            const is_repost_you_status = await post.findOne({
              user_id: user_id,
              // repost_id: data?.repost_id?._id,
              repost_id: data.repost_id._id,
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

            var store_option_id_use_repost = repostIsPolled?.option_id;
            // const postCoordinates = data?.repost_id?.location.coordinates;
            const postCoordinates = data.repost_id.location.coordinates;
            let point1 = {
              latitude: lat,
              longitude: long,
            };
            let point2 = {
              latitude: postCoordinates[1],
              longitude: postCoordinates[0],
            };
            let distanceInMeters = geolib.getDistance(point1, point2);
            let distanceInMiles = geolib.convertDistance(
              distanceInMeters,
              "mi"
            );
            updatedPost.repost_id = {
              ...data.repost_id.toObject(),
              is_like: !!repostIsLiked,
              is_save: !!repostIsSaved,
              is_poll_response: !!repostIsPolled,
              store_option_id: store_option_id_use_repost,
              is_repost_you: !!is_repost_you_status,
              is_view_impression: !!is_view_impression,
              is_view_Post: !!is_view_Post,
              distance: distanceInMiles.toFixed(2)
            };
          }
          return updatedPost;
        })
      );

      find_local_post_newest.forEach(async (post) => {
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
      var find_local_post_count_newest = await post
        .find()
        .where(where_condition)
        .count();

      if (find_local_post_newest.length > 0) {
        return multiSuccessRes(
          res,
          "Local post retrieved successfully",
          find_local_post_newest,
          find_local_post_count_newest
        );
      }
      else {
        return successRes(res, "No posts found for this user", []);
      }
    }

    if (top == true || top == "true") {
      var find_local_post_top = await post
        .find()
        .where(where_condition)
        .populate({
          path: "user_id",
          select:
            "unique_name full_name post_type profile_url profile_picture full_name is_verified",
        })
        .populate("interest_id sub_interest_id")
        .populate({
          path: "repost_id",
          populate: {
            path: "user_id",
            select:
              "unique_name full_name post_type profile_url profile_picture full_name is_verified",
          },
        })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ like_count: -1 });

      find_local_post_top = await Promise.all(
        find_local_post_top.map(async (data) => {
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
            // repost_id: data?.repost_id?._id,
            repost_id: data.repost_id._id,
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

          const postCoordinates = data.location.coordinates;
          let point1 = {
            latitude: lat,
            longitude: long,
          };
          let point2 = {
            latitude: postCoordinates[1],
            longitude: postCoordinates[0],
          };
          let distanceInMeters = geolib.getDistance(point1, point2);
          let distanceInMiles = geolib.convertDistance(
            distanceInMeters,
            "mi"
          );
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
            distance: distanceInMiles.toFixed(2)
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

            const is_repost_you_status = await post.findOne({
              user_id: user_id,
              // repost_id: data?.repost_id?._id,
              repost_id: data.repost_id._id,
              is_deleted: false,
              is_repost: true
            })

            const is_view_impression = await user_impressions.findOne({
              user_id: user_id,
              post_id: data.repost_id._id,
            });

            const is_view_Post = await view_post.findOne({
              user_id: user_id,
              post_id: data.repost_id._id
            });
            var store_option_id_repost = repostIsPolled?.option_id;
            // const postCoordinates = data?.repost_id?.location.coordinates;
            const postCoordinates = data.repost_id.location.coordinates;
            let point1 = {
              latitude: lat,
              longitude: long,
            };
            let point2 = {
              latitude: postCoordinates[1],
              longitude: postCoordinates[0],
            };
            let distanceInMeters = geolib.getDistance(point1, point2);
            let distanceInMiles = geolib.convertDistance(
              distanceInMeters,
              "mi"
            );
            updatedPost.repost_id = {
              ...data.repost_id.toObject(),
              is_like: !!repostIsLiked,
              is_save: !!repostIsSaved,
              is_poll_response: !!repostIsPolled,
              store_option_id: store_option_id_repost,
              is_repost_you: !!is_repost_you_status,
              is_view_impression: !!is_view_impression,
              is_view_Post: !!is_view_Post,
              distance: distanceInMiles.toFixed(2)
            };
          }
          return updatedPost;
        })
      );
      find_local_post_top.forEach(async (post) => {
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
      var find_local_post_count_top = await post
        .find()
        .where(where_condition)
        .count();

      if (find_local_post_top.length > 0) {

        return multiSuccessRes(
          res,
          "Local post retrieved successfully",
          find_local_post_top,
          find_local_post_count_top
        );
      } else {
        return successRes(res, "No posts found for this user", []);
      }
    }

    var find_local_post_normal = await post
      .find()
      .where(where_condition)
      .populate({
        path: "user_id",
        select:
          "unique_name full_name post_type profile_url profile_picture full_name is_verified",
      })
      .populate("interest_id sub_interest_id")
      .populate({
        path: "repost_id",
        populate: {
          path: "user_id",
          select:
            "unique_name full_name post_type profile_url profile_picture full_name is_verified",
        },
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    find_local_post_normal = await Promise.all(
      find_local_post_normal.map(async (data) => {
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
          // repost_id: data?.repost_id?._id,
          repost_id: data.repost_id._id,
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

        const postCoordinates = data.location.coordinates;
        let point1 = {
          latitude: lat,
          longitude: long,
        };
        let point2 = {
          latitude: postCoordinates[1],
          longitude: postCoordinates[0],
        };
        let distanceInMeters = geolib.getDistance(point1, point2);
        let distanceInMiles = geolib.convertDistance(
          distanceInMeters,
          "mi"
        );
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
          distance: distanceInMiles.toFixed(2)
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
          const is_repost_you_status = await post.findOne({
            user_id: user_id,
            // repost_id: data?.repost_id?._id,
            repost_id: data.repost_id._id,
            is_deleted: false,
            is_local: true
          })

          const is_view_impression = await user_impressions.findOne({
            user_id: user_id,
            post_id: data._id,
          });

          const is_view_Post = await view_post.findOne({
            user_id: user_id,
            post_id: data._id,
          });
          var store_option_id_repost_use = repostIsPolled?.option_id;
          // const postCoordinates = data?.repost_id?.location.coordinates;
          const postCoordinates = data.repost_id.location.coordinates;
          let point1 = {
            latitude: lat,
            longitude: long,
          };
          let point2 = {
            latitude: postCoordinates[1],
            longitude: postCoordinates[0],
          };
          let distanceInMeters = geolib.getDistance(point1, point2);
          let distanceInMiles = geolib.convertDistance(
            distanceInMeters,
            "mi"
          );
          updatedPost.repost_id = {
            ...data.repost_id.toObject(),
            is_like: !!repostIsLiked,
            is_save: !!repostIsSaved,
            is_poll_response: !!repostIsPolled,
            store_option_id: store_option_id_repost_use,
            is_repost_you: !!is_repost_you_status,
            is_view_impression: !!is_view_impression,
            is_view_Post: !!is_view_Post,
            distance: distanceInMiles.toFixed(2)
          };
        }
        return updatedPost;
      })
    );
    find_local_post_normal.forEach(async (post) => {
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
    var find_local_post_count_normal = await post
      .find()
      .where(where_condition)
      .count();

    if (find_local_post_normal.length > 0) {
      return multiSuccessRes(
        res,
        "Local post retrieved successfully",
        find_local_post_normal,
        find_local_post_count_normal
      );
    } else {
      return successRes(res, "No posts found for this user", []);
    }
  } catch (error) {
    console.log("Error:", error);
    return errorRes(res, "Internal server error");
  }
};

module.exports = {
  getAllfollowingpost,
  getAllLocalpost,
};
