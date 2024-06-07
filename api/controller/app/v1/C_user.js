const users = require("../../../../models/M_user");

const mongoose = require("mongoose");
const util = require("util");
const user_session = require("../../../../models/M_user_session");
const interest = require("../../../../models/M_interest");
const subinterest = require("../../../../models/M_sub_interest");
const { userToken } = require("../../../../utils/token");
const report = require("../../../../models/M_report");
const support = require("../../../../models/M_support");
const save_post = require("../../../../models/M_save_post");
const accountVerification = require("../../../../models/M_account_verification");
const follower_following = require("../../../../models/M_follower_following");
const comment_post = require("../../../../models/M_comment_post");
const reportuser = require("../../../../models/M_report_user");
const like_post = require("../../../../models/M_like_post");
const post = require("../../../../models/M_post");
const block_user = require("../../../../models/M_block_user");
const notifications = require("../../../../models/M_notification");
const group = require("../../../../models/M_group");
const group_members = require("../../../../models/M_group_members");
const faq = require("../../../../models/M_faq");
const pollvotes = require("../../../../models/M_poll_votes");
const chat_room = require("../../../../models/M_chat_room");
const reportSchema = require("../../../../models/M_report");
const post_report = require("../../../../models/M_post_report");
const supportSchema = require("../../../../models/M_support");
const user_impressions = require("../../../../models/M_user_impression");
const user_interactions = require("../../../../models/M_user_interactions");
const view_post = require("../../../../models/M_post_view");
const eduaction = require("../../../../models/M_education");
const custom_field = require("../../../../models/M_custom_field");
const experienceSchema = require("../../../../models/M_experience");
const {
  successRes,
  errorRes,
  multiSuccessRes,
} = require("../../../../utils/common_fun");
const { sendOtpCode } = require("../../../../utils/send_mail");
const fs = require("fs");
const path = require("path");
const { unlink } = require("fs");
const outputPath = path.join(__dirname, "../../../../");
const multer = require("multer");
const {
  securePassword,
  comparePassword,
} = require("../../../../utils/secure_pwd");
const {
  notificationSend,
  notiSendMultipleDevice,
} = require("../../../../utils/notification_send");

const { ObjectId } = require("mongodb");
const { dateTime } = require("../../../../utils/date_time");

const Chance = require("chance");
const chance = new Chance();
const { v4: uuidv4 } = require("uuid");
//mysql
const { pool } = require("../../../../config/database");

const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffprobePath = require("@ffprobe-installer/ffprobe").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

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

// const signup = async (req, res) => {
//   try {
//     var {
//       user_type,
//       full_name,
//       email_address,
//       country_code,
//       mobile_number,
//       dob,
//       location,
//       password,
//       device_type,
//       device_token,
//       interested,
//       unique_name,
//       is_social_login,
//       social_platform,
//       social_id,
//       profile_url,
//       is_linkdin_connect,
//       demographics,
//       social_media_link,
//       education
//     } = req.body;

//     const currentDateTime = await dateTime();
//     let find_email = await users.findOne({
//       email_address: { $eq: email_address, $ne: null, $nin: [""] },
//       is_deleted: false,
//     });
//     if (find_email) {
//       return errorRes(res, "This email address is already exists");
//     }

//     var find_uniquename = await users.findOne({
//       unique_name: { $regex: new RegExp("^" + unique_name + "$", "i") },
//       is_deleted: false,
//     });
//     if (find_uniquename) {
//       return errorRes(res, "This unique name is already exists");
//     }

//     var find_mobile_number = await users.findOne({
//       mobile_number: { $eq: mobile_number, $ne: null, $nin: [""] },
//       is_deleted: false,
//     });
//     if (find_mobile_number) {
//       return errorRes(res, "This mobile number is already exists");
//     }

//     var insert_data = {};

//     if (location) {
//       location = JSON.parse(location);
//       insert_data = {
//         ...insert_data._doc,
//         location: location,
//       };
//     }

//     interested = JSON.parse(interested);
//     if (email_address) {
//       insert_data = {
//         ...insert_data._doc,
//         full_name: full_name,
//         unique_name: unique_name,
//         user_type: user_type,
//         interested: interested,
//         email_address,
//         country_code,
//         mobile_number,
//         dob,
//       };
//     }

//     if (social_platform == "phone") {
//       insert_data = {
//         ...insert_data._doc,
//         full_name: full_name,
//         unique_name: unique_name,
//         user_type: user_type,
//         interested: interested,
//         country_code,
//         mobile_number,
//         dob,
//       };
//     }

//     console.log("insert_data", insert_data)
//     if (password) {
//       const hashedPassword = await securePassword(password);

//       insert_data = {
//         ...insert_data,
//         password: hashedPassword,
//       };
//     }
//     if (is_social_login == "true" || is_social_login == true) {

//       if (social_platform == "phone") {
//         insert_data = {
//           ...insert_data,
//           social_platform,
//           is_social_login: true,
//           social_id,
//         }
//       } else {
//         insert_data = {
//           ...insert_data,
//           profile_url,
//           is_social_login: true,
//           social_id,
//           social_platform,
//         };
//       }
//     }

//     if (is_linkdin_connect == true || is_linkdin_connect == "true") {

//     }

//     console.log("insert_data", insert_data)

//     var create_user = await users.create(insert_data);

//     var token = await userToken(create_user);

//     var find_subinterste = await subinterest.find({ is_deleted: false });
//     interested?.map(async (value) => {
//       find_subinterste.map(async (data) => {
//         if (value.toString() == data?._id.toString()) {
//           var create_data = await user_interactions.create({
//             user_id: create_user?._id,
//             sub_interest_id: value,
//             interest_id: data.interest_id,
//           });
//         }
//       });
//     });

//     let session = await user_session.findOneAndUpdate(
//       {
//         device_token: device_token,
//         user_id: create_user._id,
//       },
//       {
//         $set: {
//           device_token: device_token,
//           device_type: device_type,
//           user_type: user_type,
//           auth_token: token,
//           user_id: create_user._id,
//         },
//       },
//       { new: true, upsert: true }
//     );
//     create_user = {
//       ...create_user._doc,
//       token: token,
//     };
//     return successRes(res, `User signup successfully`, create_user);
//   } catch (error) {
//     console.log("Error : ", error);
//     return errorRes(res, "Internal server error");
//   }
// };

// const signIn = async (req, res) => {
//   try {
//     var {
//       email_address,
//       password,
//       device_type,
//       device_token,
//       is_social_login,
//       social_platform,
//       social_id,
//       full_name,
//       profile_url,
//       user_type,
//       location,
//       unique_name,
//     } = req.body;

//     if (is_social_login == true || is_social_login == "true") {
//       let find_user = await users.findOne({
//         $or: [{ email_address: email_address }, { unique_name: email_address }],
//         is_deleted: false,
//       });

//       if (find_user) {
//         if (find_user.is_block == true || find_user.is_block == "true") {
//           return errorRes(
//             res,
//             "This account is blocked, Please contact to administrator"
//           );
//         }

//         var token = await userToken(find_user);

//         var update_data;

//         if (location) {
//           location = JSON.parse(location);

//           if (location) {
//             update_data = {
//               ...update_data,
//               location: location,
//             };
//           }
//         }

//         update_data = {
//           ...update_data,
//           is_login: true,
//           profile_url,
//           is_social_login: true,
//           social_id,
//           social_platform,
//         };

//         var update_user = await users.findByIdAndUpdate(
//           find_user._id,
//           update_data,
//           { new: true }
//         );

//         var user_data = {
//           ...update_user._doc,
//           token: token,
//         };

//         find_user.token = token;
//       } else {
//         let check_user_email = await users.find({
//           $or: [
//             { email_address: email_address },
//             { unique_name: email_address },
//           ],

//           is_deleted: false,
//         });

//         if (check_user_email.length > 0) {
//           return await errorRes(
//             res,
//             "Email already exist, you can try signing with another email"
//           );
//         } else {
//           var insert_data = {
//             full_name,
//             email_address,
//             password: null,
//             profile_url,
//             is_social_login: true,
//             social_id,
//             social_platform,
//             user_type: user_type,
//             is_login: true,
//           };
//           if (location) {
//             location = JSON.parse(location);
//             insert_data = {
//               ...insert_data._doc,
//               location: location,
//             };
//           }
//           let create_user = await users.create(insert_data);
//           if (create_user) {
//             let token = await userToken(create_user);

//             user_data = {
//               ...create_user._doc,
//               token: token,
//             };
//           }
//         }
//       }
//     } else {
//       let find_user = await users.findOne({
//         $or: [{ email_address: email_address }, { unique_name: email_address }],
//         is_deleted: false,
//       });

//       if (!find_user) {
//         return errorRes(res, `Account is not found, Please try again.`);
//       }

//       if (find_user.is_block == true || find_user.is_block == "true") {
//         return errorRes(
//           res,
//           `This account is blocked, Please contact to administrator`
//         );
//       }
//       if (find_user.password == null) {
//         return errorRes(
//           res,
//           `Either email or password you entered is incorrect`
//         );
//       }

//       var password_verify = await comparePassword(password, find_user.password);

//       if (!password_verify) {
//         return errorRes(
//           res,
//           `Either email or password you entered is incorrect`
//         );
//       }

//       var token = await userToken(find_user);

//       let update_data = {
//         is_login: true,
//         is_social_login: false,
//       };
//       if (location) {
//         location = JSON.parse(location);
//         update_data = {
//           ...update_data._doc,
//           location: location,
//         };
//       }
//       var user_updated_data = await users.findByIdAndUpdate(
//         find_user._id,
//         update_data,
//         { new: true }
//       );

//       user_data = {
//         ...user_updated_data._doc,
//         token: token,
//       };

//       find_user.token = token;

//       delete user_data.password;
//     }
//     let session = await user_session.findOneAndUpdate(
//       {
//         device_token: device_token,
//         user_id: user_data._id,
//       },
//       {
//         $set: {
//           device_token: device_token,
//           device_type: device_type,
//           user_type: user_data.user_type,
//           user_id: user_data._id,
//           auth_token: token,
//         },
//       },
//       { new: true, upsert: true }
//     );

//     if (user_data?.profile_picture) {
//       user_data.profile_picture =
//         process.env.BASE_URL + user_data.profile_picture;
//     }
//     return successRes(res, `You have login successfully `, user_data);
//   } catch (error) {
//     console.log("Error : ", error);
//     return errorRes(res, "Internal server error");
//   }
// };

const signup = async (req, res) => {
  try {
    var {
      user_type,
      full_name,
      email_address,
      country_code,
      mobile_number,
      dob,
      location,
      password,
      device_type,
      device_token,
      interested,
      unique_name,
      is_social_login,
      social_platform,
      social_id,
      profile_url,
      is_linkdin_connect,
      demographics,
      social_media_link,
      skills_details,
    } = req.body;

    console.log("  demographics,social_media_link, education", req.body);

    const currentDateTime = await dateTime();
    if (email_address) {
      let find_email = await users.findOne({
        email_address: { $eq: email_address, $ne: null, $nin: [""] },
        is_deleted: false,
      });
      if (find_email) {
        return errorRes(res, "This email address is already exists");
      }
    }
    var find_uniquename = await users.findOne({
      unique_name: { $regex: new RegExp("^" + unique_name + "$", "i") },
      is_deleted: false,
    });
    if (find_uniquename) {
      return errorRes(res, "This unique name is already exists");
    }

    if (mobile_number) {
      var find_mobile_number = await users.findOne({
        mobile_number: { $eq: mobile_number, $ne: null, $nin: [""] },
        is_deleted: false,
      });
      if (find_mobile_number) {
        return errorRes(res, "This mobile number is already exists");
      }
    }
    var insert_data = {};

    if (location) {
      location = JSON.parse(location);
      insert_data = {
        ...insert_data._doc,
        location: location,
      };
    }

    interested = JSON.parse(interested);
    if (email_address) {
      insert_data = {
        ...insert_data._doc,
        full_name: full_name,
        unique_name: unique_name,
        user_type: user_type,
        interested: interested,
        email_address,
        country_code,
        mobile_number,
        dob,
      };
    }

    if (social_platform == "phone") {
      insert_data = {
        ...insert_data._doc,
        full_name: full_name,
        unique_name: unique_name,
        user_type: user_type,
        interested: interested,
        country_code,
        mobile_number,
        dob,
      };
    }

    if (password) {
      const hashedPassword = await securePassword(password);

      insert_data = {
        ...insert_data,
        password: hashedPassword,
      };
    }
    if (is_social_login == "true" || is_social_login == true) {
      if (social_platform == "phone") {
        insert_data = {
          ...insert_data,
          social_platform,
          is_social_login: true,
          social_id,
        };
      } else {
        insert_data = {
          ...insert_data,
          profile_url,
          is_social_login: true,
          social_id,
          social_platform,
        };
      }
    }

    if (is_linkdin_connect == true || is_linkdin_connect == "true") {
      if (demographics) {
        demographics = JSON.parse(demographics);
        insert_data = {
          ...insert_data,
          demographics: demographics,
        };
      }
      if (social_media_link) {
        social_media_link = JSON.parse(social_media_link);

        if (social_media_link) {
          insert_data = {
            ...insert_data,
            social_media_link: social_media_link,
          };
        }
      }

      if (skills_details) {
        skills_details = JSON.parse(skills_details);
        insert_data = {
          ...insert_data,
          skills_details: skills_details,
        };
      }
    }

    var create_user = await users.create(insert_data);

    var token = await userToken(create_user);

    // performQuery

    const nameParts = create_user.full_name.split(' ');
    var firstName = nameParts[0];
    var middleName = nameParts[0];
    var lastName = nameParts[0];
    // profile_picture = create_user?.profile_picture ? create_user?.profile_picture : create_user?.profile_url,
    const data = [
      identifier = create_user._id.toString(),
      first_name = firstName,
      profile_picture = (user_data?.profile_picture != null && user_data.profile_picture !== '')
        ? user_data.profile_picture
        : (user_data?.profile_url != null && user_data.profile_url !== '')
          ? user_data.profile_url
          : null,
      dob = create_user.dob,
      user_id = create_user.unique_name,
    ];

    const insertdata = await performQuery(
      "INSERT INTO user(identifier, first_name, profile_picture,dob ,user_id ) values(?,?,?,?,?)",
      data
    );

    if (insertdata) {
      console.log("in mysql data inserted successfully");
    }

    var find_subinterste = await subinterest.find({ is_deleted: false });
    interested?.map(async (value) => {
      find_subinterste.map(async (data) => {
        if (value.toString() == data?._id.toString()) {
          var create_data = await user_interactions.create({
            user_id: create_user?._id,
            sub_interest_id: value,
            interest_id: data.interest_id,
          });
        }
      });
    });

    let session = await user_session.findOneAndUpdate(
      {
        device_token: device_token,
        user_id: create_user._id,
      },
      {
        $set: {
          device_token: device_token,
          device_type: device_type,
          user_type: user_type,
          auth_token: token,
          user_id: create_user._id,
        },
      },
      { new: true, upsert: true }
    );

    console.log("session", session)


    if (session) {
      var sqlfind = "SELECT * from user WHERE identifier  = ?";
      var sqlval = [create_user._id.toString()]
      var find_user_data = await performQuery(sqlfind, sqlval);

      if (find_user_data) {
        const data = [
          identifier = create_user._id.toString(),
          user_idfr = find_user_data[0].id,
          login_timestamp = session.createdAt,
          session_token = session.device_token,
          device_info = session.device_type,
        ];

        const insertdata = await performQuery(
          "INSERT INTO user_session(identifier, user_idfr, login_timestamp ,session_token,device_info) values(?,?,?,?,?)",
          data
        );

        console.log("insertdata", insertdata)
      }
    }



    create_user = {
      ...create_user._doc,
      token: token,
    };

    return successRes(res, `User signup successfully`, create_user);
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const signIn = async (req, res) => {
  try {
    var {
      email_address,
      password,
      device_type,
      device_token,
      is_social_login,
      social_platform,
      social_id,
      full_name,
      profile_url,
      user_type,
      location,
      mobile_number,
      country_code,
      unique_name,
    } = req.body;
    console.log("mobile_number", req.body);

    if (
      (is_social_login == true || is_social_login == "true") &&
      social_platform != "phone"
    ) {
      let find_user;
      if (email_address) {
        find_user = await users.findOne({
          $or: [
            { email_address: email_address },
            { unique_name: email_address },
          ],
          is_deleted: false,
        });
      }

      if (find_user) {
        if (find_user.is_block == true || find_user.is_block == "true") {
          return errorRes(
            res,
            "This account is blocked, Please contact to administrator"
          );
        }

        var token = await userToken(find_user);

        var update_data;

        if (location) {
          location = JSON.parse(location);

          if (location) {
            update_data = {
              ...update_data,
              location: location,
            };
          }
        }

        update_data = {
          ...update_data,
          is_login: true,
          profile_url,
          is_social_login: true,
          social_id,
          social_platform,
        };

        var update_user = await users.findByIdAndUpdate(
          find_user._id,
          update_data,
          { new: true }
        );

        var user_data = {
          ...update_user._doc,
          token: token,
        };

        find_user.token = token;
      } else {
        let check_user_email = await users.find({
          $or: [
            { email_address: email_address },
            { unique_name: email_address },
            { mobile_number: mobile_number },
          ],

          is_deleted: false,
        });

        console.log("check_user_email", check_user_email);

        if (check_user_email.length > 0) {
          return await errorRes(
            res,
            "Email or phone already exist, you can try signing with another email or phone"
          );
        } else {
          var insert_data = {
            full_name,
            email_address,
            password: null,
            profile_url,
            is_social_login: true,
            social_id,
            social_platform,
            user_type: user_type,
            mobile_number: mobile_number,
            is_login: true,
          };
          if (location) {
            location = JSON.parse(location);
            insert_data = {
              ...insert_data._doc,
              location: location,
            };
          }
          let create_user = await users.create(insert_data);
          if (create_user) {
            let token = await userToken(create_user);

            user_data = {
              ...create_user._doc,
              token: token,
            };
          }
        }
      }
    } else if (
      (is_social_login == true || is_social_login == "true") &&
      social_platform == "phone"
    ) {
      let find_user = await users.findOne({
        mobile_number: mobile_number,
        is_deleted: false,
      });

      if (!find_user) {
        return errorRes(res, `Account is not found, Please try again.`);
      }

      if (find_user) {
        if (find_user.is_block == true || find_user.is_block == "true") {
          return errorRes(
            res,
            "This account is blocked, Please contact to administrator"
          );
        }

        var token = await userToken(find_user);

        var update_data = {
          is_login: true,
          is_social_login: true,
          social_platform,
          social_id,
          country_code,
        };

        var update_user = await users.findByIdAndUpdate(
          find_user._id,
          update_data,
          { new: true }
        );

        var user_data = {
          ...update_user._doc,
          token: token,
        };

        find_user.token = token;
      }
    } else {
      let find_user = await users.findOne({
        $or: [{ email_address: email_address }, { unique_name: email_address }],
        is_deleted: false,
      });

      if (!find_user) {
        return errorRes(res, `Account is not found, Please try again.`);
      }

      if (find_user.is_block == true || find_user.is_block == "true") {
        return errorRes(
          res,
          `This account is blocked, Please contact to administrator`
        );
      }
      if (find_user.password == null) {
        return errorRes(
          res,
          `Either email or password you entered is incorrect`
        );
      }

      var password_verify = await comparePassword(password, find_user.password);

      if (!password_verify) {
        return errorRes(
          res,
          `Either email or password you entered is incorrect`
        );
      }

      var token = await userToken(find_user);

      let update_data = {
        is_login: true,
        is_social_login: false,
      };
      if (location) {
        location = JSON.parse(location);
        update_data = {
          ...update_data._doc,
          location: location,
        };
      }
      var user_updated_data = await users.findByIdAndUpdate(
        find_user._id,
        update_data,
        { new: true }
      );

      user_data = {
        ...user_updated_data._doc,
        token: token,
      };

      find_user.token = token;

      delete user_data.password;
    }

    //Update data in mysql


    const nameParts = user_data.full_name.split(' ');
    var firstName = nameParts[0];
    var middleName = nameParts[1];
    var lastName = nameParts[2];

    const sql =
      "UPDATE user SET first_name = ?, profile_picture = ?  WHERE identifier  = ?";
    // const values = [
    //   first_name = firstName,
    //   profile_picture = user_data?.profile_picture ? user_data?.profile_picture : user_data?.profile_url,
    //   identifier = user_data?._id.toString(),
    // ];

    const values = [
      first_name = firstName,
      profile_picture = (user_data?.profile_picture != null && user_data.profile_picture !== '')
        ? user_data.profile_picture
        : (user_data?.profile_url != null && user_data.profile_url !== '')
          ? user_data.profile_url
          : null,
      identifier = user_data?._id.toString(),
    ];
    const results = await performQuery(sql, values);

    if (results.affectedRows === 0) {
      console.log("User not found.");
    } else {
      console.log("User updated successfully.");
    }

    //-----------------

    let session = await user_session.findOneAndUpdate(
      {
        device_token: device_token,
        user_id: user_data._id,
      },
      {
        $set: {
          device_token: device_token,
          device_type: device_type,
          user_type: user_data.user_type,
          user_id: user_data._id,
          auth_token: token,
        },
      },
      { new: true, upsert: true }
    );

    if (session) {


      const sql_session =
        "SELECT * from user_session where identifier = ?  AND session_token= ?";
      const sql_values = [
        identifier = user_data._id.toString(),
        session_token = device_token
      ];
      const find_results = await performQuery(sql_session, sql_values);

      if (find_results.affectedRow === 0) {

        var sqlfind = "SELECT * from user WHERE identifier  = ?";
        var sqlval = [user_data._id.toString()]
        var find_user_data = await performQuery(sqlfind, sqlval);

        const data = [
          identifier = user_data._id.toString(),
          user_idfr = find_user_data[0].id,
          login_timestamp = session.createdAt,
          session_token = session.device_token,
          device_info = session.device_type,
        ];

        const insertdata = await performQuery(
          "INSERT INTO user_session(identifier, user_idfr, login_timestamp ,session_token,device_info) values(?,?,?,?,?)",
          data
        );
      } else {

        const sql_update =
          "UPDATE user_session SET login_timestamp = ?, session_token = ?, device_info = ?   WHERE identifier  = ? AND session_token =?";
        const values_update = [
          login_timestamp = new Date(),
          session_token = session.device_token,
          device_info = session.device_type,
          identifier = user_data._id.toString(),
          session_token = session.device_token,
        ];
        const results = await performQuery(sql_update, values_update);
        if (results) {
          console.log("User updated successfully.");
        }
      }

    }

    if (user_data?.profile_picture) {
      user_data.profile_picture =
        process.env.BASE_URL + user_data.profile_picture;
    }
    return successRes(res, `You have login successfully `, user_data);
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const sendOTP = async (req, res) => {
  try {
    let { email_address } = req.body;

    let otp = Math.floor(1000 + Math.random() * 9000);

    let user_data = await users.findOne({
      email_address,
      is_deleted: false,
    });

    if (!user_data) {
      return errorRes(res, `Account is not found, Please try again.`);
    }

    let data = {
      otp,
      emailAddress: email_address,
      name: user_data.full_name,
    };

    await sendOtpCode(data);

    let update_data = {
      otp,
    };

    await users.findByIdAndUpdate(user_data._id, update_data);

    return successRes(res, `Verification code sent to your email`, otp);
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const verifyOtp = async (req, res) => {
  try {
    var { email_address, otp } = req.body;

    let find_user = await users
      .findOne({
        email_address: email_address,
      })
      .where({
        is_deleted: false,
      });

    if (!find_user) {
      return errorRes(res, `Account is not found, Please try again.`);
    }

    if (find_user.otp == otp) {
      let update_data = {
        otp: null,
      };

      await users.findByIdAndUpdate(find_user._id, update_data, {
        new: true,
      });

      return successRes(res, `Email verified successfully`);
    } else {
      return errorRes(res, `Please enter correct verification code`);
    }
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const resetPassword = async (req, res) => {
  try {
    let { email_address, password } = req.body;

    const hashedPassword = await securePassword(password);

    let find_user = await users.findOne({
      email_address,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, `Account is not found, Please try again.`);
    }

    let update_data = {
      password: hashedPassword,
    };

    await users.findByIdAndUpdate(find_user._id, update_data, {
      new: true,
    });

    return successRes(res, `Password reset successfully`);
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const checkEmail = async (req, res) => {
  try {
    var { email_address, mobile_number } = req.body;
    console.log("email_address", email_address);
    console.log("mobile_number", mobile_number);

    if (email_address != undefined) {
      let find_user = await users.findOne({
        email_address: { $eq: email_address, $ne: null, $nin: [""] },
        is_deleted: false,
      });

      if (!find_user) {
        return successRes(res, `You can register with this email  `);
      } else {
        return errorRes(res, `Email is already exists `);
      }
    }

    if (mobile_number != undefined) {
      let find_user = await users.findOne({
        mobile_number: mobile_number,
        is_deleted: false,
      });

      if (!find_user) {
        return successRes(res, `You can register with this Phone number`);
      } else {
        return errorRes(res, `Phone number is already exists `);
      }
    }
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const changePassword = async (req, res) => {
  try {
    let { old_password, new_password } = req.body;
    let { _id, password } = req.user;

    if (password == null) {
      return errorRes(res, `Your old password is wrong. please try again.`);
    }

    var password_verify = await comparePassword(old_password, password);

    if (!password_verify) {
      return errorRes(res, `Your old password is wrong. please try again.`);
    }
    const hashedPassword = await securePassword(new_password);

    var find_user = await users.findById(_id).where({
      is_deleted: false,
      is_block: false,
    });
    if (find_user.password == hashedPassword) {
      return errorRes(
        res,
        `Your old password is similar to the your new password.`
      );
    }

    let update_data = {
      password: hashedPassword,
    };

    await users.findByIdAndUpdate(_id, update_data);

    return successRes(res, `Your password has been updated successfully`);
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const deactiveAccount = async (req, res) => {
  try {
    let { is_deactive_account } = req.body;
    let { _id } = req.user;

    if (_id) {
      let update_data = {
        is_deactive_account: is_deactive_account,
      };
      var updated = await users.findByIdAndUpdate(_id, update_data);

      if (updated) {
        return successRes(res, `Your account deactive successfully`);
      }
    }
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const logout = async (req, res) => {
  try {
    if (!req.body.user_id) {
      var user_id = req.user._id;
    } else {
      var user_id = req.body.user_id;
    }

    var { device_token } = req.body;

    var find_data = await users.findById({ _id: user_id }).where({
      is_block: false,
      is_deleted: false,
    });

    if (!find_data) {
      return errorRes(res, "Couldn't found user");
    } else {
      var update_user = await users.updateOne(
        { _id: user_id },
        {
          $set: {
            is_login: false,
          },
        },
        { new: true }
      );

      // await user_session.deleteMany({
      //   user_id: user_id,
      //   device_token: device_token,
      // },
      //   {
      //     $set:
      //     {
      //       logout_time: await dateTime();
      //     }
      //   });

      await user_session.updateMany({
        user_id: user_id,
        device_token: device_token,
      },
        {
          $set:
          {
            logout_time: await dateTime()
          }
        });

      const sql = "UPDATE user_session SET logout_timestamp = ? WHERE identifier = ? AND session_token = ?"
      const values = [
        logout_timestamp = new Date(),
        identifier = user_id?.toString(),
        session_token = device_token,
      ];

      console.log("values", values)

      const results = await performQuery(sql, values);

      if (update_user) {
        return successRes(res, "Your account is logout successfully", []);
      }
    }
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

// const getsubInterest = async (req, res) => {
//   try {
//     var find_interest = await interest
//       .find()
//       .where({ is_deleted: false, is_block: false })
//       .sort({ createdAt: 1 });
//     var final_array = [];
//     for (var data of find_interest) {
//       var find_sub_interest = await subinterest
//         .find()
//         .where({
//           interest_id: new ObjectId(data._id),
//           is_deleted: false,
//           is_block: false,
//         })
//         .sort({ createdAt: 1 });
//       var value;
//       if (data?._id == process.env.OFF_TOPIC_ID) {
//         value = {
//           ...data._doc,
//           sub_interest_data: [],
//         };
//       } else {
//         value = {
//           ...data._doc,
//           sub_interest_data: find_sub_interest,
//         };
//       }

//       final_array.push(value);
//     }
//     return successRes(res, `Interest get successfully`, final_array);
//   } catch (error) {
//     console.log("Error : ", error);
//     return errorRes(res, "Internal server error");
//   }
// };

const getsubInterest = async (req, res) => {
  try {
    var { language } = req.body;

    if (language == undefined) {
      var find_interest = await interest
        .find()
        .where({ is_deleted: false, is_block: false })
        .sort({ createdAt: 1 });
      var final_array = [];
      for (var data of find_interest) {
        var find_sub_interest = await subinterest
          .find()
          .where({
            interest_id: new ObjectId(data._id),
            is_deleted: false,
            is_block: false,
          })
          .sort({ createdAt: 1 });
        var value;
        if (data?._id == process.env.OFF_TOPIC_ID) {
          value = {
            ...data._doc,
            sub_interest_data: [],
          };
        } else {
          value = {
            ...data._doc,
            sub_interest_data: find_sub_interest,
          };
        }

        final_array.push(value);
      }
      return successRes(res, `Interest get successfully`, final_array);
    }

    var pipeline = [];
    if (language) {
      pipeline.push(
        {
          $match: { is_deleted: false, is_block: false },
        },
        {
          $project: {
            _id: 1,
            interest: `$${language}`,
            color_code: 1,
          },
        }
      );
    } else {
      pipeline.push(
        {
          $match: { is_deleted: false, is_block: false },
        },
        {
          $project: {
            _id: 1,
            interest: 1,
            color_code: 1,
          },
        }
      );
    }
    pipeline.push({
      $sort: { createdAt: 1 },
    });
    var find_interest = await interest.aggregate(pipeline);

    var final_array = [];

    for (var data of find_interest) {
      var find_sub_interest = await subinterest
        .find({
          interest_id: new ObjectId(data._id),
          is_deleted: false,
          is_block: false,
        })
        .sort({ createdAt: 1 });

      var value;

      if (data?._id == process.env.OFF_TOPIC_ID) {
        value = {
          ...data,
          sub_interest_data: [],
        };
      } else {
        value = {
          ...data,
          sub_interest_data: find_sub_interest.map((sub) => {
            if (language && sub[language]) {
              return { ...sub._doc, sub_interest: sub[language] };
            } else {
              return sub._doc;
            }
          }),
        };
      }

      final_array.push(value);
    }
    return successRes(res, `Interest get successfully`, final_array);
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const changeFollowername = async (req, res) => {
  try {
    var { follower_name } = req.body;
    if (!req.body.user_id) {
      var user_id = req.user._id;
    } else {
      var user_id = req.body.user_id;
    }
    var find_data = await users.findById({ _id: user_id }).where({
      is_block: false,
      is_deleted: false,
    });
    if (!find_data) {
      return errorRes(res, "Couldn't found user");
    } else {
      var update_user = await users.findByIdAndUpdate(
        { _id: user_id },
        {
          $set: {
            name_of_followers: follower_name,
          },
        },
        { new: true }
      );

      if (update_user) {
        return successRes(
          res,
          "Your follower name is changes successfully",
          update_user
        );
      }
    }
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const selfDelete = async (req, res) => {
  try {
    if (!req.body.user_id) {
      var user_id = req.user._id;
    } else {
      var user_id = req.body.user_id;
    }
    var find_data = await users.findById({ _id: user_id }).where({
      is_block: false,
      is_deleted: false,
    });


    console.log("user_id", user_id)

    var sqlfind = "SELECT * from user WHERE identifier  = ?";
    var sqlval = [user_id.toString()]
    var find_user = await performQuery(sqlfind, sqlval);

    if (find_user.length == 0) {
      console.log("User not found")
    } else {
      const delete_user_skill = await performQuery(
        "DELETE FROM user_skill  WHERE user_idfr = ?",
        [find_user[0].id]
      );

      const delete_user_custom_field = await performQuery(
        "DELETE FROM user_custom_field WHERE user_idfr = ?",
        [find_user[0].id]
      );

      const delete_user_education = await performQuery(
        "DELETE FROM user_education WHERE user_idfr = ?",
        [find_user[0].id]
      );


      const delete_user_experience = await performQuery(
        "DELETE FROM user_experience WHERE user_idfr = ?",
        [find_user[0].id]
      );

      const delete_user_social = await performQuery(
        "DELETE FROM user_social WHERE user_idfr = ?",
        [find_user[0].id]
      );

      const delete_user_address = await performQuery(
        "DELETE FROM user_address WHERE user_idfr = ?",
        [find_user[0].id]
      );
    }

    if (!find_data) {
      return errorRes(res, "Couldn't found user");
    } else {
      //Update data in mysql
      const sql = "UPDATE user SET is_active = ?  WHERE identifier  = ?";
      const values = [is_active = "false", user_id = user_id.toString()];
      const results = await performQuery(sql, values);

      if (results.affectedRows === 0) {
        console.log("User not found.");
      } else {
        console.log("User updated successfully.");
      }

      var find_groups = await group.find({
        user_id: user_id,
        is_deleted: false,
      });

      find_groups?.map(async (data) => {
        var find_groups = await group.findOneAndUpdate(
          {
            _id: data?._id,
            is_deleted: false,
          },
          {
            $set: {
              is_deleted: true,
            },
          },
          {
            new: true,
          }
        );
        var delete_member = await group_members.updateMany(
          {
            group_id: data?._id,
            is_deleted: false,
          },
          {
            $set: {
              is_deleted: true,
            },
          },
          {
            new: true,
          }
        );

        var delete_notifiaction = await notifications.updateMany(
          { group_id: data?._id },
          { $set: { is_deleted: true } }
        );
      });

      var delete_member = await group_members.updateMany(
        {
          user_id: user_id,
          is_deleted: false,
        },
        {
          $set: {
            is_deleted: true,
          },
        },
        {
          new: true,
        }
      );

      var delete_report = await reportSchema.updateMany(
        { user_id: user_id, is_deleted: false },
        { $set: { is_deleted: true } },
        {
          new: true,
        }
      );

      var delete_post_report = await post_report.updateMany(
        { user_id: user_id, is_deleted: false },
        { $set: { is_deleted: true } },
        {
          new: true,
        }
      );

      var delete_support = await supportSchema.updateMany(
        { user_id: user_id, is_deleted: false },
        { $set: { is_deleted: true } },
        {
          new: true,
        }
      );
      var delete_notification = await notifications.updateMany(
        {
          $or: [{ sender_id: user_id }, { receiver_id: user_id }],
          is_deleted: false,
        },
        {
          $set: {
            is_deleted: true,
          },
        }
      );
      var update_user = await users.findByIdAndUpdate(
        { _id: user_id },
        {
          $set: {
            is_self_delete: true,
            is_deleted: true,
          },
        },
        { new: true }
      );

      var update_vrified_status = await accountVerification.findOneAndUpdate(
        { user_id: user_id, verified_status: "pending" },
        { $set: { is_deleted: true } },
        {
          new: true,
        }
      );
      var find_post = await post.find({ user_id: user_id, is_deleted: false });

      find_post.map(async (data) => {
        var delete_repost = await post.updateMany(
          { repost_id: data?._id, is_deleted: false },
          { $set: { is_deleted: true } },
          {
            new: true,
          }
        );
        var delete_savepost = await save_post.updateMany(
          { post_id: data?._id, is_deleted: false },
          { $set: { is_deleted: true } },
          {
            new: true,
          }
        );
        var delete_likepost = await like_post.updateMany(
          { post_id: data?._id, is_deleted: false },
          { $set: { is_deleted: true } },
          {
            new: true,
          }
        );
      });

      var delete_post = await post.updateMany(
        { user_id: user_id, is_deleted: false },
        { $set: { is_deleted: true } },
        {
          new: true,
        }
      );

      var delete_follow_following = await follower_following.updateMany(
        {
          $or: [{ user_id: user_id }, { following_id: user_id }],
        },
        {
          $set: {
            is_deleted: true,
          },
        },
        {
          new: true,
        }
      );

      var delete_chat_rooms = await chat_room.updateMany(
        {
          $or: [{ user_id: user_id }, { other_user_id: user_id }],
        },
        {
          $set: {
            is_deleted: true,
          },
        },
        {
          new: true,
        }
      );


      var find_eduaction = await eduaction.find({
        user_id: user_id,
        is_deleted: false,
      })

      if (find_eduaction) {
        find_eduaction.map(async (value) => {

          var remove_eduaction = await users.updateOne(
            { _id: user_id },
            { $pull: { education: new ObjectId(value._id) } }
          );
          var delete_eduaction = await eduaction.findByIdAndDelete({
            _id: new ObjectId(value._id),
          });
        })
      }


      var find_experience = await experienceSchema.find({
        user_id: user_id,
        is_deleted: false,
      })



      if (find_experience) {
        find_experience.map(async (value) => {
          var find_image = await experienceSchema.findOne({
            _id: value._id,
          });

          var delete_remove_experince = await experienceSchema.findByIdAndDelete({
            _id: value._id,
          });

          var remove_experince = await users.updateOne(
            { _id: user_id },
            { $pull: { experience: value?._id } }
          );
          if (find_image) {
            for (var value of find_image.media) {
              if (value.file_type != "url") {
                if (`${outputPath}/public/${value?.file_name}`) {
                  unlink(`${outputPath}/public/${value?.file_name}`, (err) => {
                    if (err) console.log(err);
                  });
                }
                if (value?.file_type == "video") {
                  if (`${outputPath}/public/${value?.thumb_name}`) {
                    unlink(`${outputPath}/public/${value?.thumb_name}`, (err) => {
                      if (err) console.log(err);
                    });
                  }
                }
              }
            }
          }
        })
      }


      var find_customfield = await custom_field.find({
        user_id: user_id,
        is_deleted: false,
      });


      if (find_customfield) {
        find_customfield.map(async (value) => {
          var delete_customfield = await custom_field.findByIdAndDelete({
            _id: new ObjectId(value._id),
          });
          var remove_customfield = await users.updateOne(
            { _id: user_id },
            { $pull: { custom_field: new ObjectId(value._id) } }
          );

        })
      }

      if (update_user) {
        return successRes(res, "Your account deleted successfully", []);
      }
    }
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const editProfile = async (req, res) => {
  try {
    var {
      user_id,
      full_name,
      unique_name,
      twitter_link,
      facebook_link,
      instagram_link,
      website_link,
      bio,
      email_address,
      country_code,
      mobile_number,
      follower_name,
      token,
      is_linkdin_connect,
      demographics,
      social_media_link,
      skills_details,
      is_linkedin_complete,
      is_profile_complete,
      skills_delete_id,
      skills_update
    } = req.body;
    if (!user_id) {
      user_id = req.user._id;
    }

    if (req.files) {
      var { profile_picture } = req.files;
    }

    let find_user = await users.findById(user_id).where({ is_deleted: false });

    var skills_details_array = [];


    find_user.skills_details.map((data) => {
      skills_details_array.push(data?._id)
    })

    var insertdata;
    insertdata = {
      ...insertdata,
      full_name,
      unique_name,
      twitter_link,
      facebook_link,
      instagram_link,
      website_link,
      bio,
      email_address,
      country_code,
      mobile_number,
      name_of_followers: follower_name,
      is_linkedin_complete,
      is_profile_complete,
    };

    if (email_address) {
      let find_email = await users.findOne({
        _id: { $ne: user_id },
        // email_address: email_address,
        email_address: { $eq: email_address, $ne: null, $nin: [""] },
        is_deleted: false,
      });

      if (find_email) {
        return errorRes(res, "This email address is already exists");
      }
    }
    var find_uniquename = await users.findOne({
      _id: { $ne: user_id },
      unique_name: { $regex: new RegExp("^" + unique_name + "$", "i") },
      is_deleted: false,
    });
    if (find_uniquename) {
      return errorRes(res, "Username already exist");
    }

    if (mobile_number) {
      var find_mobile_number = await users.findOne({
        _id: { $ne: user_id },
        mobile_number: { $eq: mobile_number, $ne: null, $nin: [""] },
        is_deleted: false,
      });
      if (find_mobile_number) {
        return errorRes(res, "This mobile number is already exists");
      }
    }

    if (profile_picture) {
      let file_extension = profile_picture.originalFilename
        .split(".")
        .pop()
        .toLowerCase();

      var file_name =
        Math.floor(1000 + Math.random() * 9000) +
        "_" +
        Date.now() +
        "." +
        file_extension;

      // Upload file into folder
      let oldPath = profile_picture.path;
      let newPath = "public/profile_picture/" + file_name;

      await fs.readFile(oldPath, function (err, data) {
        if (err) throw err;

        fs.writeFile(newPath, data, function (err) {
          if (err) throw err;
        });
      });

      unlink(`${outputPath}/public/${find_user.profile_picture}`, (err) => {
        if (err) console.log(err);
      });

      insertdata = {
        ...insertdata,
        profile_picture: "profile_picture/" + file_name,
      };
    }

    const sqldata = "SELECT * from user WHERE identifier  = ?";
    const valuesdata = [find_user?._id.toString()];
    const MySQLuser = await performQuery(sqldata, valuesdata);
    var skill_array = [];



    if (is_linkdin_connect == true || is_linkdin_connect == "true") {
      if (demographics) {
        demographics = JSON.parse(demographics);
        insertdata = {
          ...insertdata,
          demographics: demographics,
        };
      }
      if (social_media_link) {
        social_media_link = JSON.parse(social_media_link);
        if (social_media_link) {
          insertdata = {
            ...insertdata,
            social_media_link: social_media_link,
          };
        }
        const sql = "SELECT * from user WHERE identifier  = ?";
        const values = [find_user?._id.toString()];
        const results = await performQuery(sql, values);
        if (results.affectedRows === 0) {
          console.log("User not found social_media_link.");
        } else {

          var checkid = "SELECT * from user_social WHERE identifier  = ?";
          const value = [results[0].identifier];
          const find_data = await performQuery(checkid, value);

          if (find_data.length === 0) {
            var linkedin_link = social_media_link?.linkedin
            var facebook_link = social_media_link?.facebook
            var twitter_link = social_media_link?.twitter
            var instagram_link = social_media_link?.instagram

            const data = [
              identifier = find_user?._id.toString(),
              user_idfr = results[0].id,
              linkedin_link = linkedin_link,
              facebook_link = facebook_link,
              twitter_link = twitter_link,
              instagram_link = instagram_link,
            ];

            const insertdata = await performQuery(
              "INSERT INTO user_social(identifier, user_idfr, linkedin_link ,facebook_link,twitter_link,instagram_link ) values(?,?,?,?,?,?)",
              data
            );

            if (insertdata.affectedRows === 0) {
              console.log("User not found.");
            } else {
              console.log("Insert social data successfully.");
            }
          } else {
            var linkedin_link = social_media_link?.linkedin;
            var facebook_link = social_media_link?.facebook
            var twitter_link = social_media_link?.twitter
            var instagram_link = social_media_link?.instagram

            const data = [
              linkedin_link,
              facebook_link,
              twitter_link,
              instagram_link,
              find_data[0].id
            ];

            const updatedata = await performQuery(
              "UPDATE user_social SET linkedin_link = ?, facebook_link = ?, twitter_link = ?, instagram_link = ? WHERE id = ?",
              data
            );
          }
        }
      }



      if (skills_update) {

        skills_update = JSON.parse(skills_update);

        var check_type = skills_update.length
        if (check_type == undefined) {
          const result = await users.updateOne(
            { _id: user_id, "skills_details._id": new ObjectId(skills_update._id) },
            { $set: { "skills_details.$.skill_name": skills_update.skill_name } }
          );

          var updateskill =
            [
              skill = skills_update?.skill_name,
              identifier = skills_update._id.toString()
            ]
          const updatedata = await performQuery(
            "UPDATE user_skill SET skill = ?  WHERE identifier = ?",
            updateskill
          );
        }
      }

      if (skills_details) {

        skills_details = JSON.parse(skills_details);

        if (skills_details.length > 0) {
          skills_details.map(async (value) => {
            var data = { skill_name: value };
            skill_array.push(data)

          })


          var updated_users = await users.findByIdAndUpdate(
            { _id: user_id },
            { $push: { skills_details: skill_array } },
            { new: true }
          );

          const pipeline = [
            {
              $match:
              {
                _id: new ObjectId(user_id)
              }
            },
            {
              $project: {
                skills_details_ids: {
                  $map: {
                    input: {
                      $filter: {
                        input: "$skills_details",
                        cond: { $not: { $in: ["$$this._id", skills_details_array] } }
                      }
                    },
                    as: "skill",
                    in: "$$skill._id"
                  }
                }
              }
            }
          ];

          const cursordata = await users.aggregate(pipeline);

          if (cursordata.length > 0) {
            var skills_data_array = cursordata[0].skills_details_ids;
            skills_data_array.map((value) => {

              updated_users?.skills_details?.map(async (data) => {

                if (value.equals(data._id)) {
                  const datas = [
                    identifier = data?._id.toString(),
                    user_idfr = MySQLuser[0].id,
                    skill = data?.skill_name,
                    level = 5,
                  ];

                  const insertdata = await performQuery(
                    "INSERT INTO user_skill(identifier, user_idfr, skill ,level ) values(?,?,?,?)",
                    datas
                  );
                }
              })
            })

          }

        }
      }

      if (skills_delete_id) {
        var remove_image = await users.updateOne(
          { _id: user_id },
          { $pull: { skills_details: { _id: skills_delete_id } } }
        );
        const updatedata = await performQuery(
          "DELETE FROM user_skill WHERE identifier = ?",
          [skills_delete_id]
        );
      }
    }

    var updated_data = await users.findByIdAndUpdate(
      { _id: user_id },
      { $set: insertdata },
      { new: true }
    );

    updated_data = {
      ...updated_data._doc,
      token: token,
    };

    //Update data in mysql
    if (updated_data) {

      const nameParts = updated_data.full_name.split(" ");
      // let firstName, middleName, lastName;
      var firstname = nameParts[0];
      var middlename = nameParts[0];
      var lastname = nameParts[0];
      const sql =
        "UPDATE user SET first_name = ?, profile_picture = ? , gender = ? ,disability=? ,relation_status=? ,dob =? WHERE identifier = ?";

      const values = [
        first_name = firstname,
        profile_picture = updated_data?.profile_picture ? updated_data?.profile_picture : updated_data?.profile_url,
        gender = updated_data?.demographics?.gender,
        disability = updated_data?.demographics?.disability,
        relation_status = updated_data?.demographics?.marriage_status,
        dob = updated_data?.dob,
        identifier = updated_data._id.toString(),

      ];
      const results = await performQuery(sql, values);


      var sqlfind = "select * from user WHERE identifier = ?";
      const val = [identifier = updated_data._id.toString()];

      const finduserData = await performQuery(sqlfind, val);


      if (results.affectedRows === 0) {
        console.log("User not found.");
      } else {
        const sql =
          "select * from user_address  WHERE identifier = ?";
        const values = [identifier = updated_data._id.toString()];
        const resultsData = await performQuery(sql, values);
        if (resultsData.length === 0) {
          var zipcode = updated_data?.demographics?.zipcode
          if (zipcode) {
            const data = [
              identifier = updated_data._id.toString(),
              user_idfr = finduserData[0].id,
              zipcode = zipcode,
            ];
            const insertdata = await performQuery(
              "INSERT INTO user_address(identifier, user_idfr, zipcode) values(?,?,?)",
              data
            );
            if (insertdata.affectedRows === 0) {
              console.log("User not found.");
            }
            else {
              console.log("Insert address data successfully.");
            }
          }
        } else {
          var zipcode = updated_data?.demographics?.zipcode
          const data = [
            zipcode,
            identifier = updated_data._id.toString(),
          ];
          const updatedata = await performQuery(
            "UPDATE user_address SET zipcode = ? WHERE identifier = ?",
            data
          );
        }
      }




    }
    //-----------------

    if (updated_data?.profile_picture) {
      updated_data.profile_picture =
        process.env.BASE_URL + updated_data.profile_picture;
    }


    if (updated_data) {
      return successRes(res, "Your account updated successfully", updated_data);
    }
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const createReportforproblem = async (req, res) => {
  try {
    if (!req.body.user_id) {
      var user_id = req.user._id;
    } else {
      var user_id = req.body.user_id;
    }

    var { feedback } = req.body;
    var { feedback_photo } = req.files;

    let find_user = await users.findById(user_id).where({ is_deleted: false });
    if (!find_user) {
      return errorRes(res, "This user id not exists");
    }
    var insert_data;
    insert_data = {
      ...insert_data,
      user_id: user_id,
      feedback,
    };

    if (feedback_photo) {
      var check_media = util.isArray(feedback_photo);

      if (check_media == false) {
        var feedback_array = [];
        feedback_array.push(feedback_photo);
      } else {
        var feedback_array = feedback_photo;
      }

      if (feedback_photo) {
        var multiplefeedback_media_array = [];
        for (var value of feedback_array) {
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
            file_extension == "jpeg" ||
            file_extension == "jpg" ||
            file_extension == "png" ||
            file_extension == "raw" ||
            file_extension == "mpeg" ||
            file_extension == "jfif"
          ) {
            let file_data = {
              file_type: "image",
              file_name: `feedback_photo/${file_name_gen}`,
            };
            let old_path = value.path;
            let new_path = "public/feedback_photo/" + file_name_gen;
            await fs.readFile(old_path, function (err, data) {
              if (err) throw err;
              fs.writeFile(new_path, data, function (err) {
                if (err) throw err;
              });
            });

            multiplefeedback_media_array.push(file_data);
          }
          insert_data = {
            ...insert_data,
            feedback_photo: multiplefeedback_media_array,
          };
        }
      }
    }

    var create_report = await report.create(insert_data);
    create_report?.feedback_photo.map((value) => {
      if (value?.file_type == "image") {
        value.file_name = process.env.BASE_URL + value.file_name;
      }
    });

    if (create_report) {
      return successRes(res, `Report submitted successfully`, create_report);
    }
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const reporttoUser = async (req, res) => {
  try {
    if (!req.body.user_id) {
      var user_id = req.user._id;
    } else {
      var user_id = req.body.user_id;
    }
    var { report_user_id, reason_report } = req.body;

    let find_report_user = await users
      .findById(report_user_id)
      .where({ is_deleted: false });
    if (!find_report_user) {
      return errorRes(res, "This report user id not exists");
    }
    var insert_data = {
      user_id,
      report_user_id,
      reason_report,
    };

    var create_user_report = await reportuser.create(insert_data);

    if (create_user_report) {
      return successRes(
        res,
        `Your report to user created  successfully`,
        create_user_report
      );
    }
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const createSupport = async (req, res) => {
  try {
    if (!req.body.user_id) {
      var user_id = req.user._id;
    } else {
      var user_id = req.body.user_id;
    }
    var { title, message } = req.body;

    let find_user = await users.findById(user_id).where({ is_deleted: false });
    if (!find_user) {
      return errorRes(res, "This user id not exists");
    }

    var insert_data = {
      user_id: user_id,
      title,
      message,
    };

    var create_support = await support.create(insert_data);

    if (create_support) {
      return successRes(
        res,
        `We have received your support request,our team will be get back to you`,
        create_support
      );
    }
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const accountVerifications = async (req, res) => {
  try {
    if (!req.body.user_id) {
      var user_id = req.user._id;
    } else {
      var user_id = req.body.user_id;
    }
    var {
      legal_name,
      dob,
      country_name,
      profession,
      social_link,
      news_source_one,
      news_source_two,
      news_source_three,
    } = req.body;

    var { gov_document } = req.files;

    if (user_id) {
      let find_user = await users
        .findById(user_id)
        .where({ is_deleted: false });
      if (!find_user) {
        return errorRes(res, "This user id not exists");
      }
    }

    var insertdata;
    if (gov_document) {
      let file_extension = gov_document.originalFilename
        .split(".")
        .pop()
        .toLowerCase();

      var file_name =
        Math.floor(1000 + Math.random() * 9000) +
        "_" +
        Date.now() +
        "." +
        file_extension;

      let oldPath = gov_document.path;
      let newPath = "public/verification_document/" + file_name;

      await fs.readFile(oldPath, function (err, data) {
        if (err) throw err;

        fs.writeFile(newPath, data, function (err) {
          if (err) throw err;
        });
      });

      insertdata = {
        ...insertdata,
        gov_document: "verification_document/" + file_name,
      };
    }
    insertdata = {
      ...insertdata,
      user_id: user_id,
      legal_name,
      dob,
      country_name,
      profession,
      social_link,
      news_source_one,
      news_source_two,
      news_source_three,
      verified_status: "pending",
    };
    var create_verification = await accountVerification.create(insertdata);
    if (create_verification?.gov_document) {
      create_verification.gov_document =
        process.env.BASE_URL + create_verification.gov_document;
    }
    if (create_verification) {
      return successRes(
        res,
        `Your verification request sent successfully`,
        create_verification
      );
    }
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const getverifiedUserDetails = async (req, res) => {
  try {
    if (!req.body.user_id) {
      var user_id = req.user._id;
    } else {
      var user_id = req.body.user_id;
    }
    if (user_id) {
      var find_data = await accountVerification
        .findOne({ user_id: user_id })
        .where({
          is_deleted: false,
        })
        .sort({ createdAt: -1 });
      if (find_data?.gov_document) {
        find_data.gov_document = process.env.BASE_URL + find_data.gov_document;
      }
    }
    if (find_data) {
      return successRes(
        res,
        "User verification details get successfully",
        find_data
      );
    } else {
      return errorRes(res, "Couldn't found user");
    }
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const getUserdetails = async (req, res) => {
  try {
    if (!req.body.user_id) {
      var user_id = req.user._id;
    } else {
      var user_id = req.body.user_id;
    }

    var login_user = req.user._id;
    var other_user = req.body.user_id;
    var { language } = req.body;

    console.log("login_user", login_user);
    console.log("other_user", other_user);

    if (user_id) {
      var find_user = await users
        .findById(user_id)
        .where({ is_deleted: false });

      if (!find_user) {
        return errorRes(res, "Couldn't found user");
      }
      var find_sub_interest = await subinterest
        .find()
        .populate(
          "interest_id",
          "interest color_code hindi kannada malayalam tamil telugu"
        )
        .where({ is_deleted: false });

      if (find_user?.profile_picture) {
        find_user.profile_picture =
          process.env.BASE_URL + find_user.profile_picture;
      }

      var find_report_count = await reportuser.countDocuments({
        report_user_id: user_id,
        is_deleted: false,
      });

      var find_post_count = await post.countDocuments({
        user_id: user_id,
        is_repost: false,
        is_deleted: false,
        is_block: false,
        is_local: false,
      });

      var find_post = await post.find().where({
        user_id: user_id,
        is_repost: false,
        is_deleted: false,
        is_local: false,
      });

      var find_repost = await post.find().where({
        user_id: user_id,
        is_repost: true,
        is_deleted: false,
        is_local: false,
      });

      var find_account_verification = await accountVerification
        .find()
        .where({
          user_id: user_id,
          is_deleted: false,
        })
        .sort({ createdAt: -1 });

      var find_save_post_details = await save_post
        .find()
        .where({
          user_id: user_id,
          is_deleted: false,
        })
        .populate("post_id")
        .sort({ createdAt: -1 });

      const follower_count = await follower_following.countDocuments({
        following_id: user_id,
        is_deleted: false,
        is_request: true,
      });
      const following_count = await follower_following.countDocuments({
        user_id: user_id,
        is_deleted: false,
        is_request: true,
      });

      const follower_list = await follower_following
        .find({
          following_id: user_id,
          is_deleted: false,
        })
        .populate("user_id")
        .populate("following_id");

      const following_list = await follower_following
        .find()
        .where({
          user_id: user_id,
          is_deleted: false,
        })
        .populate("user_id")
        .populate("following_id");

      const block_user_list = await block_user.find({
        user_id: user_id,
        is_deleted: false,
      });

      const block_user_count = await block_user.countDocuments({
        user_id: user_id,
        is_deleted: false,
      });

      const comment_count = await comment_post.countDocuments({
        user_id: user_id,
        is_deleted: false,
      });

      const post_like_count = await like_post.countDocuments({
        user_id: user_id,
        is_deleted: false,
      });

      if (login_user) {
        const block_user_data = await block_user.find({
          user_id: login_user,
          block_user_id: other_user,
          is_deleted: false,
        });

        const block_user_other = await block_user.find({
          user_id: other_user,
          block_user_id: login_user,
          is_deleted: false,
        });

        if (block_user_data.length != 0 || block_user_other.length != 0) {
          const combinedBlockDetails = [
            ...block_user_data,
            ...block_user_other,
          ];

          find_user = {
            ...find_user._doc,
            is_user_block: true,
            block_user_details: combinedBlockDetails,
          };
        } else {
          find_user = {
            ...find_user._doc,
            is_user_block: false,
          };
        }
      }

      var is_request;

      var follow_request_status = await follower_following.findOne().where({
        user_id: login_user,
        following_id: other_user,
        is_deleted: false,
        is_request: false,
      });

      if (follow_request_status) {
        is_request = false;
      }

      var follow_request_status_true = await follower_following
        .findOne()
        .where({
          user_id: login_user,
          following_id: other_user,
          is_deleted: false,
          is_request: true,
        });

      if (follow_request_status_true) {
        is_request = true;
      }

      if (!follow_request_status && !follow_request_status_true) {
        is_request = null;
      }

      // var interest_data = [];
      // if (find_user?.interested) {
      //   const interestMap = new Map();

      //   find_sub_interest.forEach((sub_interest) => {
      //     interestMap.set(sub_interest._id.toString(), sub_interest);
      //   });

      //   find_user.interested.forEach((data) => {
      //     const subInterestData = interestMap.get(data.toString());

      //     console.log("hindi+++++++", subInterestData)

      //     if (subInterestData) {
      //       const interestId = subInterestData.interest_id._id.toString();

      //       const existingInterest = interest_data.find(
      //         (interest) => interest._id === interestId
      //       );

      //       if (existingInterest) {
      //         existingInterest.sub_interest_data.push(subInterestData);
      //       } else {
      //         const newInterest = {
      //           _id: interestId,

      //           interest: subInterestData.interest_id.interest,
      //           color_code: subInterestData.interest_id.color_code,
      //           telugu: subInterestData.interest_id.telugu,
      //           tamil: subInterestData.interest_id.tamil,
      //           malayalam: subInterestData.interest_id.malayalam,
      //           kannada: subInterestData.interest_id.kannada,
      //           hindi: subInterestData.interest_id.hindi,
      //           sub_interest_data: [subInterestData],
      //         };
      //         interest_data.push(newInterest);
      //       }
      //     }
      //   });
      // }

      var interest_data = [];

      // if (find_user?.interested) {
      //   const interestMap = new Map();

      //   find_sub_interest.forEach((sub_interest) => {
      //     interestMap.set(sub_interest._id.toString(), sub_interest);
      //   });

      //   find_user.interested.forEach((data) => {
      //     const subInterestData = interestMap.get(data.toString());

      //     console.log("hindi+++++++", subInterestData)

      //     if (subInterestData) {
      //       const interestId = subInterestData.interest_id._id.toString();
      //       const existingInterest = interest_data.find(
      //         (interest) => interest._id === interestId
      //       );

      //       // Check if the user prefers Hindi

      //       // Get the interest and sub-interest names based on user preference
      //       const interestName = language == "hindi" ? subInterestData.interest_id.hindi : subInterestData.interest_id.interest;
      //       const subInterestName = language == "hindi" ? subInterestData.hindi : subInterestData.sub_interest;

      //       if (existingInterest) {
      //         existingInterest.sub_interest_data.push({
      //           ...subInterestData._doc,
      //           sub_interest: subInterestName
      //         });
      //       } else {
      //         const newInterest = {
      //           _id: interestId,
      //           interest: interestName,
      //           color_code: subInterestData.interest_id.color_code,
      //           telugu: subInterestData.interest_id.telugu,
      //           tamil: subInterestData.interest_id.tamil,
      //           malayalam: subInterestData.interest_id.malayalam,
      //           kannada: subInterestData.interest_id.kannada,
      //           hindi: subInterestData.interest_id.hindi,
      //           sub_interest_data: [{
      //             ...subInterestData._doc,
      //             sub_interest: subInterestName
      //           }],
      //         };
      //         interest_data.push(newInterest);
      //       }
      //     }
      //   });
      // }

      if (find_user?.interested) {
        const interestMap = new Map();

        // Create a map of sub_interests for quick access
        find_sub_interest.forEach((sub_interest) => {
          interestMap.set(sub_interest._id.toString(), sub_interest);
        });

        // Helper function to get the user's preferred language value
        const getUserPreferredValue = (object, key) => {
          const userLanguage = language;
          return object[userLanguage] || object[key];
        };

        // Iterate through each user's interested data
        find_user.interested.forEach((data) => {
          const subInterestData = interestMap.get(data.toString());

          if (subInterestData) {
            const interestId = subInterestData.interest_id._id.toString();
            const existingInterest = interest_data.find(
              (interest) => interest._id === interestId
            );

            // Get the interest and sub-interest names based on user preference
            const interestName = getUserPreferredValue(
              subInterestData.interest_id,
              "interest"
            );
            const subInterestName = getUserPreferredValue(
              subInterestData,
              "sub_interest"
            );

            if (existingInterest) {
              existingInterest.sub_interest_data.push({
                ...subInterestData._doc,
                sub_interest: subInterestName,
              });
            } else {
              const newInterest = {
                _id: interestId,
                interest: interestName,
                color_code: subInterestData.interest_id.color_code,
                telugu: subInterestData.interest_id.telugu,
                tamil: subInterestData.interest_id.tamil,
                malayalam: subInterestData.interest_id.malayalam,
                kannada: subInterestData.interest_id.kannada,
                hindi: subInterestData.interest_id.hindi,
                sub_interest_data: [
                  {
                    ...subInterestData._doc,
                    sub_interest: subInterestName,
                  },
                ],
              };
              interest_data.push(newInterest);
            }
          }
        });
      }

      const user_following_data = await follower_following.find({
        user_id: login_user,
        following_id: other_user,
        is_deleted: false,
        is_request: true,
      });

      const other_following_data = await follower_following.find({
        following_id: login_user,
        user_id: other_user,
        is_deleted: false,
        is_request: true,
      });

      var is_connection;

      if (user_following_data.length > 0 && other_following_data.length > 0) {
        is_connection = true;
      } else {
        is_connection = false;
      }
      var group_details;

      if (other_user != undefined) {
        var find_group = await group_members
          .find()
          .where({
            is_deleted: false,
            user_id: other_user,
          })
          .populate({
            path: "group_id",
            populate: {
              path: "user_id",
              select:
                "unique_name full_name post_type profile_url profile_picture full_name",
            },
          });

        if (find_group) {
          group_details = find_group;
        }
      } else {
        var user_id = login_user.toString();
        var find_groups = await group_members
          .find()
          .where({
            is_deleted: false,
            user_id: user_id,
          })
          .populate("group_id");

        if (find_groups) {
          group_details = find_groups;
        }
      }

      const is_otheruser_follow = await follower_following.findOne({
        user_id: other_user,
        following_id: login_user,
        is_deleted: false,
        is_request: true,
      });

      var is_otheruser_follow_status;
      if (is_otheruser_follow) {
        is_otheruser_follow_status = true;
      } else {
        is_otheruser_follow_status = false;
      }

      if (other_user) {
        if (find_user?.$__) {
          find_user = {
            ...find_user._doc,
            report_count: find_report_count,
            post_count: find_post_count,
            follower_count: follower_count,
            following_count: following_count,
            block_list_count: block_user_count,
            comment_list_count: comment_count,
            post_like_count: post_like_count,
            interested: interest_data,
            account_verification: find_account_verification[0],
            follow_request: is_request,
            is_connection: is_connection,
            group_details: group_details,
            is_otheruser_follow_status: is_otheruser_follow_status,
          };
        } else {
          find_user = {
            ...find_user,
            report_count: find_report_count,
            post_count: find_post_count,
            follower_count: follower_count,
            following_count: following_count,
            block_list_count: block_user_count,
            comment_list_count: comment_count,
            post_like_count: post_like_count,
            interested: interest_data,
            account_verification: find_account_verification[0],
            follow_request: is_request,
            is_connection: is_connection,
            group_details: group_details,
            is_otheruser_follow_status: is_otheruser_follow_status,
          };
        }
      }

      if (login_user) {
        if (!other_user) {
          find_user = {
            ...find_user._doc,
            interested: interest_data,
            group_details: group_details,
          };
        }
      }

      if (find_user?.account_verification?.gov_document) {
        find_user.account_verification.gov_document =
          process.env.BASE_URL + find_user.account_verification.gov_document;
      }

      const baseUrl = process.env.BASE_URL;

      if (find_user && find_user.group_details) {
        find_user.group_details = find_user.group_details.map(async (data) => {
          const groupId = data?.group_id?._id;

          const memberCount = await group_members.countDocuments({
            group_id: groupId,
            is_deleted: false,
          });

          const updatedGroup = {
            ...data?.group_id?._doc,
            member_count: memberCount,
          };

          return {
            ...data._doc,
            group_id: updatedGroup,
          };
        });

        find_user.group_details = await Promise.all(find_user.group_details);

        find_user.group_details = find_user.group_details.map((data) => ({
          ...data,
          group_id: {
            ...data.group_id,
            group_image:
              data.group_id &&
                data.group_id.group_image &&
                !data.group_id.group_image.includes(baseUrl)
                ? baseUrl + data.group_id.group_image
                : data.group_id.group_image,
            members: null,
            is_requested: null,
            is_invited: null,
            is_join: null,
            last_message: null,
            last_message_time: null,
            unread_message: null,
          },
        }));
      }

      if (!find_user) {
        return errorRes(res, "Couldn't found user");
      } else {
        return successRes(res, `User details get successfully`, find_user);
      }
    }
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const blockTouser = async (req, res) => {
  try {
    var { user_id, block_user_id } = req.body;

    if (user_id) {
      var find_user = await users
        .findById(user_id)
        .where({ is_deleted: false, is_block: false });

      if (!find_user) {
        return errorRes(res, "Could't found user");
      }

      if (block_user_id) {
        var find_block_user = await users
          .findById(block_user_id)
          .where({ is_deleted: false, is_block: false });

        if (!find_block_user) {
          return errorRes(res, "Could't found block user");
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
          return successRes(res, `User unblock successfully`);
        }
      } else {
        var create_record = await block_user.create({
          user_id: user_id,
          block_user_id: block_user_id,
          is_deleted: false,
        });
      }

      if (create_record) {
        return successRes(res, `User block successfully`, create_record);
      }
    }
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal Server Error!");
  }
};

const block_list = async (req, res) => {
  try {
    var { user_id } = req.body;

    var block_user_list = await block_user
      .find({
        user_id: user_id,
        is_deleted: false,
      })
      .populate("block_user_id");

    var block_list_count = await block_user.countDocuments({
      user_id: user_id,
      is_deleted: false,
    });

    block_user_list.forEach((value) => {
      if (
        value?.block_user_id?.profile_picture &&
        !value?.block_user_id?.profile_picture.startsWith(process.env.BASE_URL)
      ) {
        value.block_user_id.profile_picture =
          process.env.BASE_URL + value.block_user_id.profile_picture;
      }
    });

    return multiSuccessRes(
      res,
      "Block list get successfully",
      block_user_list,
      block_list_count
    );
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal Server Error!");
  }
};

const notificationList = async (req, res) => {
  try {
    if (!req.body.user_id) {
      var user_id = req.user._id;
    } else {
      var user_id = req.body.user_id;
    }

    var { filter_type, page = 1, limit = 10 } = req.body;

    var matchCond = {
      receiver_id: user_id,
      is_deleted: false,
    };

    if (filter_type == "newfollow") {
      matchCond = {
        ...matchCond,

        noti_for: {
          $in: [
            "follow_request",
            "started_following",
            "follow_request_accepted",
          ],
        },
        is_accepted: { $nin: [false] },
      };
    }

    if (filter_type == "activities") {
      matchCond = {
        ...matchCond,
        noti_for: {
          $in: [
            "group_join_request",
            "group_invite",
            "group_join_request_accept",
            "group_join_request_decline",
            "like_post",
            "group_chat_message",
            "post_comment",
            "repost",
            "like_comment",
          ],
        },
      };
    }

    let notification_data = await notifications
      .find(matchCond)
      .populate({
        path: "sender_id",
        select:
          "full_name unique_name profile_picture profile_url is_verified is_private_account",
      })
      .populate({
        path: "receiver_id",
        select:
          "full_name unique_name profile_picture profile_url is_verified is_private_account",
      })
      .populate({
        path: "group_id",
        select: "group_image group_description user_id group_name",
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    await users.findByIdAndUpdate(user_id, { noti_badge: 0 });

    notification_data = await Promise.all(
      notification_data.map(async (value) => {
        var is_request;
        var follow_request_status = await follower_following.findOne({
          user_id: value?.sender_id?._id,
          following_id: user_id,
          is_deleted: false,
          is_request: false,
        });

        if (follow_request_status) {
          is_request = false;
        }

        var follow_request_status_true = await follower_following.findOne({
          user_id: value?.sender_id?._id,
          following_id: user_id,
          is_deleted: false,
          is_request: true,
        });

        if (follow_request_status_true) {
          is_request = true;
        }

        if (!follow_request_status && !follow_request_status_true) {
          is_request = null;
        }

        var follow_status;

        var follow_sender_status = await follower_following.findOne({
          user_id: user_id,
          following_id: value?.sender_id?._id,
          is_deleted: false,
          is_request: false,
        });

        if (follow_sender_status) {
          follow_status = false;
        }

        var follow_sender_true = await follower_following.findOne({
          user_id: user_id,
          following_id: value?.sender_id?._id,
          is_deleted: false,
          is_request: true,
        });

        if (follow_sender_true) {
          follow_status = true;
        }

        if (!follow_sender_status && !follow_sender_true) {
          follow_status = null;
        }

        const user_following_data = await follower_following.find({
          user_id: value?.sender_id?._id,
          following_id: user_id,
          is_deleted: false,
          is_request: true,
        });

        const other_following_data = await follower_following.find({
          following_id: value?.sender_id?._id,
          user_id: user_id,
          is_deleted: false,
          is_request: true,
        });

        var is_connection;

        if (user_following_data.length > 0 && other_following_data.length > 0) {
          is_connection = true;
        } else {
          is_connection = false;
        }

        const is_otheruser_follow = await follower_following.findOne({
          user_id: value?.sender_id?._id,
          following_id: user_id,
          is_deleted: false,
          is_request: true,
        });

        var is_otheruser_follow_status;
        if (is_otheruser_follow) {
          is_otheruser_follow_status = true;
        } else {
          is_otheruser_follow_status = false;
        }

        const updatedPost = {
          ...value.toObject(),
          is_request: is_request,
          is_connection: is_connection,
          follow_status: follow_status,
          is_otheruser_follow_status: is_otheruser_follow_status,
        };

        return updatedPost;
      })
    );

    let totalCount = await notifications
      .find({
        receiver_id: user_id,
      })
      .count();

    notification_data.map((data) => {
      if (data?.sender_id?.profile_picture !== null) {
        data.sender_id.profile_picture =
          process.env.BASE_URL + data.sender_id.profile_picture;
      }
      if (data?.receiver_id?.profile_picture !== null) {
        data.receiver_id.profile_picture =
          process.env.BASE_URL + data.receiver_id.profile_picture;
      }
      if (data?.group_id?.group_image) {
        data.group_id.group_image =
          process.env.BASE_URL + data.group_id.group_image;
      }
    });

    if (notification_data) {
      return successRes(
        res,
        `Notification list get successfully`,
        notification_data
      );
    }
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal Server Error!");
  }
};

const searchPage = async (req, res) => {
  try {
    var user_id = req.user._id;
    var { search, page = 1, limit = 3, language } = req.body;

    if (!search) {
      return errorRes(res, "Please enter search text");
    } else {
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

      var datas = {
        users: [],
        posts: [],
      };
      if (!search || search.length < 2) {
        return successRes(
          res,
          "Please enter at least two characters for the search",
          datas
        );
      }
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
            {
              is_deleted: false,
            },
          ],
        })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ is_verified: -1 });

      var following_data = await follower_following.find().where({
        user_id: user_id,
        is_deleted: false,
        is_request: true,
      });

      const following_user_Ids = following_data.map(
        (data) => data.following_id
      );

      var limit = 3;
      var skip = (page - 1) * limit;
      var find_post = await post.aggregate([
        {
          $lookup: {
            from: "interests",
            localField: "interest_id",
            foreignField: "_id",
            as: "interestDetails",
          },
        },
        {
          $unwind: "$interestDetails",
        },
        {
          $lookup: {
            from: "sub_interests",
            localField: "sub_interest_id",
            foreignField: "_id",
            as: "subInterestDetails",
          },
        },
        {
          $unwind: "$subInterestDetails",
        },
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $unwind: "$userDetails",
        },
        {
          $lookup: {
            from: "posts",
            localField: "repost_id",
            foreignField: "_id",
            as: "repost_id",
          },
        },
        {
          $unwind: {
            path: "$repost_id",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "repost_id.user_id",
            foreignField: "_id",
            as: "repostUserDetails",
          },
        },
        {
          $addFields: {
            repostData: {
              $cond: {
                if: "$repost_id",
                then: {
                  _id: "$repost_id._id",
                  user_id: "$repost_id.user_id",
                  userDetails: { $arrayElemAt: ["$repostUserDetails", 0] },
                },
                else: null,
              },
            },
          },
        },
        {
          $project: {
            _id: 1,
            repost_id: {
              _id: "$repost_id._id",
              user_id: { $arrayElemAt: ["$repostUserDetails", 0] },
              interest_id: "$repost_id.interest_id",
              title: "$repost_id.title",
              description: "$repost_id.description",
              post_type: "$repost_id.post_type",
              question: "$repost_id.question",
              options: "$repost_id.options",
              is_repost: "$repost_id.is_repost",
              location: "$repost_id.location",
              vote_counter: "$repost_id.vote_counter",
              repost_count: "$repost_id.repost_count",
              comment_count: "$repost_id.comment_count",
              view_count: "$repost_id.view_count",
              like_count: "$repost_id.like_count",
              is_deleted: "$repost_id.is_deleted",
              post_media: "$repost_id.post_media",
              createdAt: "$repost_id.createdAt",
              updatedAt: "$repost_id.updatedAt",
            },
            title: 1,
            description: 1,
            post_type: 1,
            question: 1,
            options: 1,
            is_repost: 1,
            location: 1,
            vote_counter: 1,
            repost_count: 1,
            comment_count: 1,
            view_count: 1,
            like_count: 1,
            is_deleted: 1,
            post_media: 1,
            createdAt: 1,
            updatedAt: 1,
            interest_id: {
              _id: "$interestDetails._id",
              color_code: "$interestDetails.color_code",
              interest: "$interestDetails.interest",
              is_deleted: "$interestDetails.is_deleted",
              hindi: "$interestDetails.hindi",
              tamil: "$interestDetails.tamil",
              kannada: "$interestDetails.kannada",
              malayalam: "$interestDetails.malayalam",
              telugu: "$interestDetails.telugu",
            },
            sub_interest_id: {
              _id: "$subInterestDetails._id",
              sub_interest: "$subInterestDetails.sub_interest",
              interest_id: "$subInterestDetails.interest_id",
              is_deleted: "$subInterestDetails.is_deleted",
              hindi: "$subInterestDetails.hindi",
              tamil: "$subInterestDetails.tamil",
              kannada: "$subInterestDetails.kannada",
              malayalam: "$subInterestDetails.malayalam",
              telugu: "$subInterestDetails.telugu",
            },
            sub_interest_id: "$subInterestDetails",
            interestName: "$interestDetails.interest",
            subInterestName: "$subInterestDetails.sub_interest",
            user_full_name: "$userDetails.full_name",
            user_id: {
              _id: "$userDetails._id",
              is_verified: "$userDetails.is_verified",
              full_name: "$userDetails.full_name",
              unique_name: "$userDetails.unique_name",
              profile_picture: "$userDetails.profile_picture",
              profile_url: "$userDetails.profile_url",
              is_deleted: "$userDetails.is_deleted",
              is_private_account: "$userDetails.is_private_account",
            },
          },
        },
        {
          $sort: {
            is_verified: -1,
          },
        },
        {
          $match: {
            $and: [
              { "interest_id.is_deleted": false },
              { "sub_interest_id.is_deleted": false },
              { "user_id.is_deleted": false },
              { is_deleted: false },
              {
                $or: [
                  { interestName: { $regex: regex } },
                  { subInterestName: { $regex: regex } },
                  { title: { $regex: regex } },
                  { description: { $regex: regex } },
                  { user_full_name: { $regex: regex } },
                ],
              },
            ],
          },
        },
        {
          $match: {
            "user_id._id": { $nin: blockedUserIds },
            $or: [
              { "user_id.is_private_account": { $ne: true } },
              { "user_id._id": { $in: following_user_Ids } },
            ],
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
      ]);

      find_post = await Promise.all(
        find_post.map(async (data) => {
          const isMongooseDocument = data instanceof mongoose.Document;

          const postObject = isMongooseDocument ? data.toObject() : data;

          const isLiked = await like_post.findOne({
            user_id: user_id,
            post_id: postObject._id,
          });
          const isSaved = await save_post.findOne({
            user_id: user_id,
            post_id: postObject._id,
          });
          const isPolled = await pollvotes.findOne({
            user_id: user_id,
            post_id: postObject._id,
          });
          var store_option_id = isPolled?.option_id;

          const is_repost_you_status = await post?.findOne({
            user_id: user_id,
            repost_id: postObject._id,
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
          } else if (language === "malayalam") {
            data.interest_id.interest = data.interest_id.malayalam;
            data.sub_interest_id.sub_interest = data.sub_interest_id.malayalam;
          } else if (language === "tamil") {
            data.interest_id.interest = data.interest_id.tamil;
            data.sub_interest_id.sub_interest = data.sub_interest_id.tamil;
          }

          const updatedPost = {
            ...postObject,
            is_like: !!isLiked,
            is_save: !!isSaved,
            is_poll_response: !!isPolled,
            store_option_id: store_option_id,
            is_repost_you: !!is_repost_you_status,
          };
          if (updatedPost.is_repost && updatedPost.repost_id) {
            const repostIsLiked = await like_post.findOne({
              user_id: user_id,
              post_id: updatedPost.repost_id._id,
            });
            const repostIsSaved = await save_post.findOne({
              user_id: user_id,
              post_id: updatedPost.repost_id._id,
            });
            const repostIsPolled = await pollvotes.findOne({
              user_id: user_id,
              post_id: updatedPost.repost_id._id,
            });

            var store_option_id = repostIsPolled?.option_id;

            const is_repost_you_status = await post?.findOne({
              user_id: user_id,
              repost_id: updatedPost?.repost_id?._id,
              is_deleted: false,
              is_repost: true,
            });

            const is_view_impression = await user_impressions.findOne({
              user_id: user_id,
              post_id: data.repost_id._id,
            });

            const is_view_Post = await view_post.findOne({
              user_id: user_id,
              post_id: data.repost_id._id,
            });

            updatedPost.repost_id = {
              ...updatedPost.repost_id,
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

      var find_group = await group
        .find({
          group_name: regex,
          is_deleted: false,
        })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate({
          path: "user_id",
          select: "full_name profile_url profile_picture",
        })
        .sort({ is_verified: -1 });

      var find_group = await Promise.all(
        find_group.map(async (value) => {
          var result = { ...value._doc };

          if (result?.group_image) {
            result.group_image = result.group_image
              ? process.env.BASE_URL + result.group_image
              : null;
          }
          if (result?.user_id?.profile_picture) {
            result.user_id.profile_picture = result.user_id.profile_picture
              ? process.env.BASE_URL + result.user_id.profile_picture
              : null;
          }

          var group_members_count = await group_members
            .find()
            .where({ is_deleted: false, group_id: result._id })
            .count();

          result = {
            ...result,
            member_count: group_members_count,
          };

          let is_requested = false;
          let is_invited = false;
          let is_join = false;

          var request_check = await notifications.findOne().where({
            is_deleted: false,
            group_id: result._id,
            is_accepted: null,
            sender_id: user_id,
            noti_for: "group_join_request",
          });

          if (request_check) {
            is_requested = true;
          }

          var invite_check = await notifications.findOne().where({
            is_deleted: false,
            group_id: result._id,
            is_accepted: null,
            receiver_id: user_id,
            noti_for: "group_invite",
          });

          if (invite_check) {
            is_invited = true;
          }

          var group_join_check = await group_members.findOne().where({
            is_deleted: false,
            user_id: user_id,
            group_id: result._id,
          });

          if (group_join_check) {
            is_join = true;
          }

          result = {
            ...result,
            is_requested: is_requested,
            is_invited: is_invited,
            is_join: is_join,
          };

          return result;
        })
      );

      result?.forEach((value) => {
        if (value?.profile_picture) {
          value.profile_picture = process.env.BASE_URL + value.profile_picture;
        }
      });

      find_post.forEach((value) => {
        if (
          value?.user_id?.profile_picture &&
          !value?.user_id?.profile_picture.startsWith(process.env.BASE_URL)
        ) {
          value.user_id.profile_picture =
            process.env.BASE_URL + value.user_id.profile_picture;
        }

        if (value?.post_media) {
          value.post_media.map((media) => {
            if (media.file_type === "image" || media.file_type === "video") {
              media.file_name = process.env.BASE_URL + media.file_name;
              if (media.thumb_name) {
                media.thumb_name = process.env.BASE_URL + media.thumb_name;
              }
            }
          });
        }

        if (
          value?.repost_id?.user_id?.profile_picture &&
          !value?.repost_id?.user_id?.profile_picture.startsWith(
            process.env.BASE_URL
          )
        ) {
          value.repost_id.user_id.profile_picture =
            process.env.BASE_URL + value.repost_id.user_id.profile_picture;
        }

        if (value?.repost_id?.post_media) {
          value.repost_id.post_media.map((media) => {
            if (media.file_type === "image" || media.file_type === "video") {
              media.file_name = process.env.BASE_URL + media.file_name;
              if (media.thumb_name) {
                media.thumb_name = process.env.BASE_URL + media.thumb_name;
              }
            }
          });
        }
      });

      find_group?.forEach((value) => {
        if (
          value?.group_image &&
          !value?.group_image.startsWith(process.env.BASE_URL)
        ) {
          value.group_image = process.env.BASE_URL + value.group_image;
        }
      });

      var data = {
        users: result,
        posts: find_post,
        groups: find_group,
      };

      return successRes(res, "Searching response get successful", data);
    }
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal Server Error!");
  }
};

const searchUser = async (req, res) => {
  try {
    var user_id = req.user._id;
    var { search, page = 1, limit = 10 } = req.body;

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
          { is_deleted: false },
        ],
      })
      .count();

    result.forEach((value) => {
      if (
        value?.profile_picture &&
        !value?.profile_picture.startsWith(process.env.BASE_URL)
      ) {
        value.profile_picture = process.env.BASE_URL + value.profile_picture;
      }
    });

    return multiSuccessRes(
      res,
      "Searching user data get successful",
      result,
      result_count
    );
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal Server Error!");
  }
};

const searchPost = async (req, res) => {
  try {
    var user_id = req.user._id;
    var { search, page = 1, limits = 10, language } = req.body;

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

    const searchTerms = search.split(" ");
    const regex = new RegExp(searchTerms.join("|"), "i");
    var following_data = await follower_following.find().where({
      user_id: user_id,
      is_deleted: false,
      is_request: true,
    });

    const following_user_Ids = following_data.map((data) => data.following_id);

    const skip = (page - 1) * limits;
    var find_post = await post.aggregate([
      {
        $lookup: {
          from: "interests",
          localField: "interest_id",
          foreignField: "_id",
          as: "interestDetails",
        },
      },
      {
        $unwind: "$interestDetails",
      },
      {
        $lookup: {
          from: "sub_interests",
          localField: "sub_interest_id",
          foreignField: "_id",
          as: "subInterestDetails",
        },
      },
      {
        $unwind: "$subInterestDetails",
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $lookup: {
          from: "posts",
          localField: "repost_id",
          foreignField: "_id",
          as: "repost_id",
        },
      },

      {
        $unwind: {
          path: "$repost_id",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "repost_id.user_id",
          foreignField: "_id",
          as: "repostUserDetails",
        },
      },
      {
        $addFields: {
          repostData: {
            $cond: {
              if: "$repost_id",
              then: {
                _id: "$repost_id._id",
                user_id: "$repost_id.user_id",
                userDetails: { $arrayElemAt: ["$repostUserDetails", 0] },
              },
              else: null,
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          repost_id: {
            _id: "$repost_id._id",
            user_id: { $arrayElemAt: ["$repostUserDetails", 0] },
            interest_id: "$repost_id.interest_id",
            title: "$repost_id.title",
            description: "$repost_id.description",
            post_type: "$repost_id.post_type",
            question: "$repost_id.question",
            options: "$repost_id.options",
            location: "$repost_id.location",
            vote_counter: "$repost_id.vote_counter",
            repost_count: "$repost_id.repost_count",
            view_count: "$repost_id.view_count",
            comment_count: "$repost_id.comment_count",
            like_count: "$repost_id.like_count",
            is_deleted: "$repost_id.is_deleted",
            is_repost: "$repost_id.is_repost",
            post_media: "$repost_id.post_media",
            createdAt: "$repost_id.createdAt",
            updatedAt: "$repost_id.updatedAt",
          },
          title: 1,
          description: 1,
          post_type: 1,
          question: 1,
          options: 1,
          location: 1,
          vote_counter: 1,
          repost_count: 1,
          view_count: 1,
          like_count: 1,
          is_repost: 1,
          is_deleted: 1,
          comment_count: 1,
          post_media: 1,
          createdAt: 1,
          updatedAt: 1,
          interest_id: {
            _id: "$interestDetails._id",
            color_code: "$interestDetails.color_code",
            interest: "$interestDetails.interest",
            is_deleted: "$interestDetails.is_deleted",
            hindi: "$interestDetails.hindi",
            tamil: "$interestDetails.tamil",
            kannada: "$interestDetails.kannada",
            malayalam: "$interestDetails.malayalam",
            telugu: "$interestDetails.telugu",
          },
          sub_interest_id: {
            _id: "$subInterestDetails._id",
            sub_interest: "$subInterestDetails.sub_interest",
            interest_id: "$subInterestDetails.interest_id",
            is_deleted: "$subInterestDetails.is_deleted",
            hindi: "$subInterestDetails.hindi",
            tamil: "$subInterestDetails.tamil",
            kannada: "$subInterestDetails.kannada",
            malayalam: "$subInterestDetails.malayalam",
            telugu: "$subInterestDetails.telugu",
          },
          interestName: "$interestDetails.interest",
          subInterestName: "$subInterestDetails.sub_interest",
          user_full_name: "$userDetails.full_name",
          user_id: {
            _id: "$userDetails._id",
            is_verified: "$userDetails.is_verified",
            full_name: "$userDetails.full_name",
            unique_name: "$userDetails.unique_name",
            profile_picture: "$userDetails.profile_picture",
            profile_url: "$userDetails.profile_url",
            is_deleted: "$userDetails.is_deleted",
            is_private_account: "$userDetails.is_private_account",
          },
        },
      },
      {
        $sort: {
          is_verified: -1,
        },
      },
      {
        $match: {
          $and: [
            { "interest_id.is_deleted": false },
            { "sub_interest_id.is_deleted": false },
            { "user_id.is_deleted": false },
            { is_deleted: false },
            {
              $or: [
                { interestName: { $regex: regex } },
                { subInterestName: { $regex: regex } },
                { title: { $regex: regex } },
                { description: { $regex: regex } },
                { user_full_name: { $regex: regex } },
              ],
            },
          ],
        },
      },
      {
        $match: {
          "user_id._id": { $nin: blockedUserIds },
          $or: [
            { "user_id.is_private_account": { $ne: true } },
            { "user_id._id": { $in: following_user_Ids } },
          ],
        },
      },

      {
        $skip: (page - 1) * limits,
      },
      {
        $limit: limits,
      },
    ]);

    find_post = await Promise.all(
      find_post.map(async (data) => {
        const isMongooseDocument = data instanceof mongoose.Document;

        const postObject = isMongooseDocument ? data.toObject() : data;

        const isLiked = await like_post.findOne({
          user_id: user_id,
          post_id: postObject._id,
        });
        const isSaved = await save_post.findOne({
          user_id: user_id,
          post_id: postObject._id,
        });
        const isPolled = await pollvotes.findOne({
          user_id: user_id,
          post_id: postObject._id,
        });
        var store_option_id = isPolled?.option_id;

        const is_repost_you_status = await post?.findOne({
          user_id: user_id,
          repost_id: postObject._id,
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
        } else if (language === "malayalam") {
          data.interest_id.interest = data.interest_id.malayalam;
          data.sub_interest_id.sub_interest = data.sub_interest_id.malayalam;
        } else if (language === "tamil") {
          data.interest_id.interest = data.interest_id.tamil;
          data.sub_interest_id.sub_interest = data.sub_interest_id.tamil;
        }

        const updatedPost = {
          ...postObject,
          is_like: !!isLiked,
          is_save: !!isSaved,
          is_poll_response: !!isPolled,
          store_option_id: store_option_id,
          is_repost_you: !!is_repost_you_status,
        };
        if (updatedPost.is_repost && updatedPost.repost_id) {
          const repostIsLiked = await like_post.findOne({
            user_id: user_id,
            post_id: updatedPost.repost_id._id,
          });
          const repostIsSaved = await save_post.findOne({
            user_id: user_id,
            post_id: updatedPost.repost_id._id,
          });
          const repostIsPolled = await pollvotes.findOne({
            user_id: user_id,
            post_id: updatedPost.repost_id._id,
          });

          var store_option_id = repostIsPolled?.option_id;

          const is_repost_you_status = await post?.findOne({
            user_id: user_id,
            repost_id: updatedPost?.repost_id?._id,
            is_deleted: false,
            is_repost: true,
          });

          const is_view_impression = await user_impressions.findOne({
            user_id: user_id,
            post_id: data.repost_id._id,
          });

          const is_view_Post = await view_post.findOne({
            user_id: user_id,
            post_id: data.repost_id._id,
          });

          updatedPost.repost_id = {
            ...updatedPost.repost_id,
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
    var data = find_post.length;

    find_post.forEach((value) => {
      if (
        value?.user_id?.profile_picture &&
        !value?.user_id?.profile_picture.startsWith(process.env.BASE_URL)
      ) {
        value.user_id.profile_picture =
          process.env.BASE_URL + value.user_id.profile_picture;
      }

      if (value?.post_media) {
        value.post_media.map((media) => {
          if (media.file_type === "image" || media.file_type === "video") {
            media.file_name = process.env.BASE_URL + media.file_name;
            if (media.thumb_name) {
              media.thumb_name = process.env.BASE_URL + media.thumb_name;
            }
          }
        });
      }

      if (
        value?.repost_id?.user_id?.profile_picture &&
        !value?.repost_id?.user_id?.profile_picture.startsWith(
          process.env.BASE_URL
        )
      ) {
        value.repost_id.user_id.profile_picture =
          process.env.BASE_URL + value.repost_id.user_id.profile_picture;
      }

      if (value?.repost_id?.post_media) {
        value.repost_id.post_media.map((media) => {
          if (media.file_type === "image" || media.file_type === "video") {
            media.file_name = process.env.BASE_URL + media.file_name;
            if (media.thumb_name) {
              media.thumb_name = process.env.BASE_URL + media.thumb_name;
            }
          }
        });
      }
    });
    return multiSuccessRes(
      res,
      "Searching post data get successful",
      find_post,
      data
    );
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal Server Error!");
  }
};

const searchGroups = async (req, res) => {
  try {
    var user_id = req.user._id;
    var { search, page = 1, limit = 10 } = req.body;

    const searchTerms = search.split(" ");
    const regex = new RegExp(searchTerms.join("|"), "i");

    var find_group = await group
      .find({
        group_name: regex,
        is_deleted: false,
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({
        path: "user_id",
        select: "full_name profile_url profile_picture",
      })
      .sort({ is_verified: -1 });

    var find_group_count = await group
      .find({
        group_name: regex,
      })
      .count();

    find_group = await Promise.all(
      find_group.map(async (value) => {
        var result = { ...value._doc };

        if (
          result?.user_id?.profile_picture &&
          !result?.user_id?.profile_picture.startsWith(process.env.BASE_URL)
        ) {
          result.user_id.profile_picture = result.user_id.profile_picture
            ? process.env.BASE_URL + result.user_id.profile_picture
            : null;
        }
        if (
          result?.group_image &&
          !result?.group_image.startsWith(process.env.BASE_URL)
        ) {
          result.group_image = process.env.BASE_URL + result.group_image;
        }
        var group_members_count = await group_members
          .find()
          .where({ is_deleted: false, group_id: result._id })
          .count();

        result = {
          ...result,
          member_count: group_members_count,
        };

        let is_requested = false;
        let is_invited = false;
        let is_join = false;

        var request_check = await notifications.findOne().where({
          is_deleted: false,
          group_id: result._id,
          is_accepted: null,
          sender_id: user_id,
          noti_for: "group_join_request",
        });

        if (request_check) {
          is_requested = true;
        }

        var invite_check = await notifications.findOne().where({
          is_deleted: false,
          group_id: result._id,
          is_accepted: null,
          receiver_id: user_id,
          noti_for: "group_invite",
        });

        if (invite_check) {
          is_invited = true;
        }

        var group_join_check = await group_members.findOne().where({
          is_deleted: false,
          user_id: user_id,
          group_id: result._id,
        });

        if (group_join_check) {
          is_join = true;
        }

        result = {
          ...result,
          is_requested: is_requested,
          is_invited: is_invited,
          is_join: is_join,
        };

        return result;
      })
    );

    return multiSuccessRes(
      res,
      "Searching groups data get successfully",
      find_group,
      find_group_count
    );
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal Server Error!");
  }
};

const privateAccount = async (req, res) => {
  try {
    if (!req.body.user_id) {
      var user_id = req.user._id;
    } else {
      var user_id = req.body.user_id;
    }

    var { private_status } = req.body;
    if (user_id) {
      var user_details = await users
        .findOne()
        .where({ _id: user_id, is_deleted: false });
      if (!user_details) {
        return errorRes(res, "User details not found");
      }
    }

    if (private_status == true || private_status == "true") {
      var updated_data = await users.findByIdAndUpdate(
        { _id: user_id },
        { $set: { is_private_account: true } },
        { new: true }
      );

      return successRes(res, "Your account private successfully", updated_data);
    }

    if (private_status == false || private_status == "false") {
      const follow_following_ids = await follower_following.find({
        following_id: user_id,
        is_request: false,
        is_deleted: false,
      });

      for (const value of follow_following_ids) {
        await notifications.updateMany(
          {
            sender_id: value?.user_id,
            noti_for: "follow_request",
            is_accepted: null,
            is_deleted: false,
          },
          {
            $set: {
              noti_title: "New follower",
              noti_for: "started_following",
              noti_msg: "started following you",
              follow_id: value?._id,
              is_accepted: true,
            },
          }
        );

        await follower_following.updateMany(
          {
            _id: value?._id,
            is_request: false,
            is_deleted: false,
          },
          {
            $set: {
              is_request: true,
            },
          }
        );
      }

      var updated_data = await users.findByIdAndUpdate(
        { _id: user_id },
        { $set: { is_private_account: false } },
        { new: true }
      );
      return successRes(res, "Your account public successfully", updated_data);
    }
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal Server Error!");
  }
};

const getUserInterests = async (req, res) => {
  try {
    if (!req.body.user_id) {
      var user_id = req.user._id;
    } else {
      var user_id = req.body.user_id;
    }

    var find_user = await users.findById(user_id).where({ is_deleted: false });

    if (!find_user) {
      return errorRes(res, "Couldn't found user");
    }

    var find_sub_interest = await subinterest
      .find()
      .populate("interest_id", "interest color_code")
      .where({ is_deleted: false });

    var interest_data = [];

    if (find_user?.interested) {
      find_user?.interested.map((data) => {
        find_sub_interest.map((sub_interest) => {
          if (sub_interest._id.equals(data)) {
            const existingInterest = interest_data.find((item) =>
              item._id.equals(sub_interest.interest_id._id)
            );

            if (existingInterest) {
              existingInterest.sub_interest_data.push(sub_interest);
            } else {
              const newInterest = {
                _id: sub_interest.interest_id._id,
                is_deleted: sub_interest.interest_id.is_deleted,
                createdAt: sub_interest.interest_id.createdAt,
                updatedAt: sub_interest.interest_id.updatedAt,
                interest: sub_interest.interest_id.interest,
                color_code: sub_interest.interest_id.color_code,
                sub_interest_data: [sub_interest],
              };
              interest_data.push(newInterest);
            }
          }
        });
      });
    }
    return successRes(res, "User interests get successfully", interest_data);
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal Server Error!");
  }
};

const editUserInterests = async (req, res) => {
  try {
    if (!req.body.user_id) {
      var user_id = req.user._id;
    } else {
      var user_id = req.body.user_id;
    }

    var { interested } = req.body;

    var find_user = await users.findById(user_id).where({ is_deleted: false });

    if (!find_user) {
      return errorRes(res, "Couldn't found user");
    }

    interested = JSON.parse(interested);

    find_user.interested = [...new Set(interested)];

    var update_data = {
      interested: find_user.interested,
      updatedAt: Date.now(),
    };

    var updated_interest = await users.findByIdAndUpdate(
      { _id: user_id },
      update_data,
      { new: true }
    );

    return successRes(
      res,
      "User interests updated successfully",
      updated_interest
    );
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal Server Error!");
  }
};

const faqList = async (req, res) => {
  try {
    // var getFaq = await faq.find({ is_deleted: false });
    let data = {
      faq: process.env.FAQ,
    };

    return successRes(res, "Frequently asked questions get successfully", data);
  } catch (error) {
    console.log("Error: ", error);
    return errorRes(res, "Internal server error");
  }
};

const privacyPolicy = async (req, res) => {
  try {
    let data = {
      privacy_policy: process.env.PRIVACY_POLICY,
    };
    return successRes(res, `Privacy policy get successfully.`, data);
  } catch (error) {
    console.log(error);
    return errorRes(res, "Internal Server Error!");
  }
};

const about = async (req, res) => {
  try {
    let data = {
      about: process.env.ABOUT,
    };
    return successRes(res, `About get successfully.`, data);
  } catch (error) {
    console.log(error);
    return errorRes(res, "Internal Server Error!");
  }
};

const termsandConditions = async (req, res) => {
  try {
    let data = {
      terms_and_conditions: process.env.TERMS_AND_CONDITIONS,
    };
    return successRes(res, `Terms and conditions get successfully.`, data);
  } catch (error) {
    console.log(error);
    return errorRes(res, "Internal Server Error!");
  }
};

const directMessageSetting = async (req, res) => {
  try {
    if (!req.body.user_id) {
      var user_id = req.user._id;
    } else {
      var user_id = req.body.user_id;
    }
    var { social_platform_data } = req.body;

    var find_data = await users.findById({ _id: user_id }).where({
      is_block: false,
      is_deleted: false,
    });
    if (!find_data) {
      return errorRes(res, "Couldn't found user");
    } else {
      var update_user = await users.findByIdAndUpdate(
        { _id: user_id },
        {
          $set: {
            social_platform_data: social_platform_data,
          },
        },
        { new: true }
      );

      if (update_user) {
        return successRes(
          res,
          "Direct message setting updated successfully",
          update_user
        );
      }
    }
  } catch (error) {
    console.log(error);
    return errorRes(res, "Internal Server Error!");
  }
};

const deleteVerificationRequest = async (req, res) => {
  try {
    if (!req.body.user_id) {
      var user_id = req.user._id;
    } else {
      var user_id = req.body.user_id;
    }

    var find_user = await users.findById({ _id: user_id }).where({
      is_block: false,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, "Couldn't found user");
    } else {
      var update_user_verification_status =
        await accountVerification.updateMany(
          { user_id: user_id },
          {
            $set: {
              is_deleted: true,
            },
          },
          { new: true }
        );

      if (update_user_verification_status) {
        return successRes(
          res,
          "User verification request deleted successfully",
          true
        );
      }
    }
  } catch (error) {
    console.log(error);
    return errorRes(res, "Internal Server Error!");
  }
};

const universalTruthsEnglish100Title = [
  "The sun rises in the east.",
  "What goes up must come down.",
  "Time waits for no one.",
  "Actions speak louder than words.",
  "Change is inevitable.",
  "The only constant in life is change.",
  "You reap what you sow.",
  "The truth will set you free.",
  "Love conquers all.",
  "Beauty is in the eye of the beholder.",
];

const universalTruthsEnglish100Description = [
  "Life is short.",
  "Nothing lasts forever.",
  "To err is human, to forgive divine.",
  "Where there is a will, there is a way.",
  "Knowledge is power.",
  "Honesty is the best policy.",
  "Practice makes perfect.",
  "Two wrongs don't make a right.",
  "Laughter is the best medicine.",
  "The early bird catches the worm.",
];

const testsignup = async (req, res) => {
  try {
    const { count } = req.body;

    const createdUsers = [];
    for (let i = 0; i < count; i++) {
      const randomName = chance.name();
      const randomEmail = chance.email();
      const fullNameData = randomName;
      const spaceIndex = fullNameData.indexOf(" ");
      const firstName = fullNameData.substring(0, spaceIndex);
      const lastName = fullNameData.substring(spaceIndex + 1);
      const randomEmailAddress = `${firstName}@gmail.com`;

      const existingEmail = await users.findOne({
        email_address: randomEmailAddress,
        is_deleted: false,
      });

      const existingUniqueName = await users.findOne({
        unique_name: { $regex: new RegExp("^" + firstName + "$", "i") },
        is_deleted: false,
      });

      if (existingEmail || existingUniqueName) {
        console.log(
          `User ${i + 1} skipped. Email or unique name already exists.`
        );
        continue;
      }

      const insertData = {
        user_type: "user",
        full_name: randomName,
        email_address: randomEmailAddress,
        password: "Test@123",
        country_code: "91",
        mobile_number: "123567895",
        unique_name: firstName,
        interested: await getRandomSubinterests(),
        dob: "2002-02-23T00:00:00.000Z",
        is_fake: true,
      };

      const createUser = await users.create(insertData);

      if (createUser) {
        const userPosts = [];
        for (let j = 0; j < 5; j++) {
          const data = await getRandomSubinterestsforpost();
          const find_sub_interest = await subinterest
            .findById(data[0])
            .where({ is_deleted: false });

          var locationdata = {
            type: "Point",
            coordinates: [73.015729, 20.994871],
          };

          const insert_data = {
            user_id: createUser?._id,
            interest_id: find_sub_interest?.interest_id,
            sub_interest_id: find_sub_interest?._id,
            title: "test",
            description: "654654654654",
            post_type: "text",
            location: locationdata,
            is_fake_post: true,
            is_fake_post_updated: false,
          };

          const create_post = await post.create(insert_data);
          userPosts.push(create_post);
        }
        createdUsers.push({ user: createUser, posts: userPosts });
      }
    }

    return successRes(res, `Users signed up successfully`, createdUsers);
  } catch (error) {
    console.error("Error:", error);
    return errorRes(res, "Internal server error");
  }
};
function addOneMinute(dateString) {
  let date = new Date(dateString);
  date.setTime(date.getTime() + 60 * 1000);
  let newDateString =
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0") +
    "T" +
    String(date.getHours()).padStart(2, "0") +
    ":" +
    String(date.getMinutes()).padStart(2, "0") +
    ":" +
    String(date.getSeconds()).padStart(2, "0") +
    "." +
    String(date.getMilliseconds()).padStart(3, "0") +
    "Z";

  return newDateString;
}

async function getRandomSubinterests() {
  const allSubinterests = await subinterest.find({
    is_deleted: false,
    $nin: [process.env.SUB_OFF_TOPIC_ID],
  });
  const interest_array = allSubinterests.map((data) => data._id.toString());
  const shuffledInterests = interest_array.sort(() => Math.random() - 0.5);
  const randomInterests = shuffledInterests.slice(0, 10);
  return randomInterests;
}

async function getRandomSubinterestsforpost() {
  const allSubinterests = await subinterest.find({
    is_deleted: false,
    $nin: [process.env.SUB_OFF_TOPIC_ID],
  });
  const interest_array = allSubinterests.map((data) => data._id.toString());
  const shuffledInterests = interest_array.sort(() => Math.random() - 0.5);
  const randomInterests = shuffledInterests.slice(0, 1);
  return randomInterests;
}

const title_descriptions = async (req, res) => {
  try {
    const posts_ids = [];
    const find_posts_data = await post.find({
      is_fake_post: true,
      is_deleted: false,
      is_fake_post_updated: false,
    });

    if (find_posts_data) {
      find_posts_data?.map((data) => {
        posts_ids.push(data?._id);
      });
    }

    for (let i = 0; i < find_posts_data.length; i++) {
      const post_id = posts_ids[i];
      const title = universalTruthsEnglish100Title[i];
      const description = universalTruthsEnglish100Description[i];
      const find_post = await post.findByIdAndUpdate(
        {
          _id: post_id,
          is_fake_post_updated: false,
        },
        {
          $set: {
            title: title,
            description: description,
            is_fake_post_updated: true,
          },
        },
        { new: true }
      );
    }
  } catch (error) {
    console.error("Error:", error);
    return errorRes(res, "Internal server error");
  }
};

const changeToken = async (req, res) => {
  try {
    var { user_id, oldToken, newToken } = req.body;

    var find_user = await users.findOne({ _id: user_id, is_deleted: false });

    if (!find_user) {
      return errorRes(res, "User not found");
    }

    var find_token = await user_session.findOneAndUpdate(
      {
        user_id: user_id,
        device_token: oldToken,
      },
      {
        $set: {
          device_token: newToken,
        },
      },
      { new: true }
    );

    if (find_token) {
      return successRes(res, "Token changed successfully", find_token);
    } else {
      return errorRes(res, "Couldn't found token");
    }
  } catch (error) {
    console.error("Error:", error);
    return errorRes(res, "Internal server error");
  }
};

const getUserinfo = async (req, res) => {
  try {
    if (!req.body.user_id) {
      var user_id = req.user._id;
    } else {
      var user_id = req.body.user_id;
    }

    var find_user = await users
      .findById({ _id: user_id })
      .where({
        is_block: false,
        is_deleted: false,
      })
      .select("_id full_name mobile_number email_address country_code");

    if (!find_user) {
      return errorRes(res, "Couldn't found user");
    } else {
      return successRes(res, `Get user Details`, find_user);
    }
  } catch (error) {
    console.error("Error:", error);
    return errorRes(res, "Internal server error");
  }
};

const uplodelinkedinMedia = async (req, res) => {
  try {
    var { linkedin_media } = req.files;
    var { urls } = req.body;

    var insert_data = {};

    var check_media = util.isArray(linkedin_media);

    if (check_media == false) {
      var linkedin_media_array = [];
      linkedin_media_array.push(linkedin_media);
    } else {
      var linkedin_media_array = linkedin_media;
    }
    var multiplelinkedin_media_array = [];
    if (linkedin_media_array) {
      for (var value of linkedin_media_array) {
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
            file_name: `linkedin_media/${file_name_gen}`,
            thumb_name: `linkedin_media/${thumbnail_path}`,
          };
          let old_path = value.path;
          let new_path = "public/linkedin_media/" + file_name_gen;
          let new_path_thumb = "public/linkedin_media/" + thumbnail_path;

          await fs.promises.copyFile(old_path, new_path);

          ffmpeg(new_path)
            .screenshots({
              timestamps: ["50%"],
              filename: file_name_gen.replace(/\.[^/.]+$/, ".jpeg"),
              folder: "public/linkedin_media",
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

          multiplelinkedin_media_array.push(file_data);
        }

        if (
          file_extension == "pdf" ||
          file_extension == "docx" ||
          file_extension == "doc"
        ) {
          let file_data = {
            file_type: "document",
            file_name: `linkedin_media/${file_name_gen}`,
          };
          let old_path = value.path;
          let new_path = "public/linkedin_media/" + file_name_gen;
          await fs.readFile(old_path, function (err, data) {
            if (err) throw err;
            fs.writeFile(new_path, data, function (err) {
              if (err) throw err;
            });
          });

          multiplelinkedin_media_array.push(file_data);
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
            file_name: `linkedin_media/${file_name_gen}`,
          };
          let old_path = value.path;
          let new_path = "public/linkedin_media/" + file_name_gen;
          await fs.readFile(old_path, function (err, data) {
            if (err) throw err;
            fs.writeFile(new_path, data, function (err) {
              if (err) throw err;
            });
          });

          multiplelinkedin_media_array.push(file_data);
        }
      }
    }

    urls = JSON.parse(urls);

    if (urls) {
      urls.map((value) => {
        if (value?.url) {
          let file_data = {
            file_type: "url",
            file_name: value.url,
          };
          multiplelinkedin_media_array.push(file_data);
        }
      });
    }
    if (multiplelinkedin_media_array) {
      return successRes(
        res,
        `linkedin post media`,
        multiplelinkedin_media_array
      );
    }
  } catch (error) {
    console.error("Error:", error);
    return errorRes(res, "Internal server error");
  }
};

const addEduaction = async (req, res) => {
  try {
    if (!req.body.user_id) {
      var user_id = req.user._id;
    } else {
      var user_id = req.body.user_id;
    }

    var {
      school,
      degree,
      field_of_Study,
      start_date,
      end_date,
      grade,
      activities_and_societies,
      description,
    } = req.body;

    let startDate = addOneMinute(start_date);
    var enddate;
    if (end_date) {
      enddate = addOneMinute(end_date);
    }

    var insert_data = {
      user_id,
      school,
      degree,
      field_of_Study,
      start_date: startDate,
      end_date: end_date ? enddate : end_date,
      grade,
      activities_and_societies,
      description,
    };

    let user_data = await users.findOne({
      _id: user_id,
      is_deleted: false,
    });

    if (!user_data) {
      return errorRes(res, `Account is not found`);
    }

    if (insert_data) {
      var create_eduaction = await eduaction.create(insert_data);
      const sql = "SELECT * from user WHERE identifier  = ?";
      const values = [user_data?._id.toString()];
      const results = await performQuery(sql, values);

      if (results.affectedRows === 0) {
        console.log("Couldn't found user.");
      } else {
        const data = [
          identifier = create_eduaction?._id.toString(),
          user_idfr = results[0].id,
          degree_obtained = create_eduaction?.degree,
          field_of_study = create_eduaction?.field_of_Study,
          institution_attended = create_eduaction?.school,
          start_date = create_eduaction?.start_date,
          end_date = create_eduaction?.end_date,
          description = create_eduaction?.description,
          activities_societies = create_eduaction?.activities_and_societies,
          grade = create_eduaction?.grade
        ];

        const insertdata = await performQuery(
          "INSERT INTO user_education (identifier, user_idfr, degree_obtained ,field_of_study ,institution_attended ,start_date ,end_date ,description ,activities_societies ,grade ) values(?,?,?,?,?,?,?,?,?,?)",
          data
        );
        if (insertdata.affectedRows === 0) {
          console.log("User not found.");
        } else {
          console.log(" Education data add successfully.");
        }
      }
      if (create_eduaction) {
        var update_user = await users.findByIdAndUpdate(
          { _id: user_id },
          { $push: { education: create_eduaction?._id } },
          { new: true }
        );
      }

      if (update_user) {
        return successRes(
          res,
          `Eduaction added successfully`,
          create_eduaction
        );
      }
    }
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const editEduaction = async (req, res) => {
  try {
    if (!req.body.user_id) {
      var user_id = req.user._id;
    } else {
      var user_id = req.body.user_id;
    }

    var {
      education_id,
      school,
      degree,
      field_of_Study,
      start_date,
      end_date,
      grade,
      activities_and_societies,
      description,
    } = req.body;

    let startDate = addOneMinute(start_date);
    var enddate;
    if (end_date) {
      enddate = addOneMinute(end_date);
    }

    let user_data = await users.findOne({
      _id: user_id,
      is_deleted: false,
    });

    if (!user_data) {
      return errorRes(res, `Account is not found`);
    }

    if (education_id) {
      let find_eduaction = await eduaction.findOne({
        _id: education_id,
        user_id: user_id,
        is_deleted: false,
      });

      if (!find_eduaction) {
        return errorRes(res, `Eduaction id is not found`);
      }
    }

    var update_data = {
      user_id,
      school: school,
      grade: grade,
      field_of_Study: field_of_Study,
      start_date: startDate,
      end_date: end_date ? enddate : end_date,
      degree: degree,
      activities_and_societies: activities_and_societies,
      description: description,
    };

    var update_user = await eduaction.findByIdAndUpdate(
      { _id: education_id },
      update_data,
      { new: true }
    );


    if (update_user) {
      const data = [
        degree_obtained = update_user?.degree,
        field_of_study = update_user?.field_of_Study,
        institution_attended = update_user?.school,
        start_date = update_user?.start_date,
        end_date = update_user?.end_date,
        description = update_user?.description,
        activities_societies = update_user?.activities_and_societies,
        grade = update_user?.grade,
        update_user._id.toString(),
      ];

      const updatedata = await performQuery(
        "UPDATE user_education SET degree_obtained = ?, field_of_study = ?, institution_attended = ?, start_date = ?, end_date = ?, description = ? , activities_societies = ? , grade =?  WHERE identifier = ?",
        data
      );
    }
    if (update_user) {
      if (update_user) {
        return successRes(res, `Eduaction updated successfully`, update_user);
      }
    }
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const deleteEduaction = async (req, res) => {
  try {
    if (!req.body.user_id) {
      var user_id = req.user._id;
    } else {
      var user_id = req.body.user_id;
    }

    var { education_id } = req.body;

    console.log("req.body", req.body);

    let user_data = await users.findOne({
      _id: user_id,
      is_deleted: false,
    });

    if (!user_data) {
      return errorRes(res, `Account is not found`);
    }

    if (education_id) {
      let find_eduaction = await eduaction.findOne({
        _id: education_id,
        user_id: user_id,
        is_deleted: false,
      });

      if (!find_eduaction) {
        return errorRes(res, `Eduaction id is not found`);
      }
    }

    var educationIdToRemove = new ObjectId(education_id);
    var remove_eduaction = await users.updateOne(
      { _id: user_id },
      { $pull: { education: educationIdToRemove } }
    );

    var delete_eduaction = await eduaction.findByIdAndDelete({
      _id: education_id,
    });

    const updatedata = await performQuery(
      "DELETE FROM user_education  WHERE identifier = ?",
      [education_id]
    );

    if (delete_eduaction) {
      return successRes(
        res,
        `Eduaction deleted successfully`,
        delete_eduaction
      );
    }
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const eduactionList = async (req, res) => {
  try {
    if (!req.body.user_id) {
      var user_id = req.user._id;
    } else {
      var user_id = req.body.user_id;
    }
    if (user_id) {
      let find_eduaction = await eduaction
        .find({
          user_id: user_id,
          is_deleted: false,
        })
        .sort({ createdAt: -1 });

      console.log("find_eduaction", find_eduaction);

      if (find_eduaction) {
        return successRes(
          res,
          `Eduaction list get successfully`,
          find_eduaction
        );
      }
    }
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const addExperience = async (req, res) => {
  try {
    if (!req.body.user_id) {
      var user_id = req.user._id;
    } else {
      var user_id = req.body.user_id;
    }

    var {
      title,
      emp_type,
      company_name,
      location,
      address,
      is_cuurrently_working,
      start_date,
      end_date,
      industry,
      description,
      urls,
    } = req.body;

    let startDate = addOneMinute(start_date);
    var enddate;
    if (end_date) {
      enddate = addOneMinute(end_date);
    }
    if (req.files != undefined) {
      var { media } = req.files;
    }
    var insert_data = {
      user_id,
      title,
      emp_type,
      company_name,
      location,
      address,
      is_cuurrently_working,
      start_date: startDate,
      end_date: end_date ? enddate : end_date,
      industry,
      description,
    };
    if (location) {
      location = JSON.parse(location);
      insert_data = {
        ...insert_data,
        location: location,
      };
    }

    var check_media = util.isArray(media);

    if (check_media == false) {
      var linkedin_media_array = [];
      linkedin_media_array.push(media);
    } else {
      var linkedin_media_array = media;
    }
    var multiplelinkedin_media_array = [];

    if (linkedin_media_array[0] != undefined) {
      for (var value of linkedin_media_array) {
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

        console.log("file_extension", file_extension);

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
            file_name: `linkedin_media/${file_name_gen}`,
            thumb_name: `linkedin_media/${thumbnail_path}`,
          };
          let old_path = value.path;
          let new_path = "public/linkedin_media/" + file_name_gen;
          let new_path_thumb = "public/linkedin_media/" + thumbnail_path;

          await fs.promises.copyFile(old_path, new_path);

          ffmpeg(new_path)
            .screenshots({
              timestamps: ["50%"],
              filename: file_name_gen.replace(/\.[^/.]+$/, ".jpeg"),
              folder: "public/linkedin_media",
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

          multiplelinkedin_media_array.push(file_data);
        }

        insert_data = {
          ...insert_data,
          media: multiplelinkedin_media_array,
        };

        if (
          file_extension == "pdf" ||
          file_extension == "docx" ||
          file_extension == "doc"
        ) {
          let file_data = {
            file_type: "document",
            file_name: `linkedin_media/${file_name_gen}`,
          };
          let old_path = value.path;
          let new_path = "public/linkedin_media/" + file_name_gen;
          await fs.readFile(old_path, function (err, data) {
            if (err) throw err;
            fs.writeFile(new_path, data, function (err) {
              if (err) throw err;
            });
          });

          multiplelinkedin_media_array.push(file_data);
        }
        insert_data = {
          ...insert_data,
          media: multiplelinkedin_media_array,
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
            file_name: `linkedin_media/${file_name_gen}`,
          };
          let old_path = value.path;
          let new_path = "public/linkedin_media/" + file_name_gen;
          await fs.readFile(old_path, function (err, data) {
            if (err) throw err;
            fs.writeFile(new_path, data, function (err) {
              if (err) throw err;
            });
          });

          multiplelinkedin_media_array.push(file_data);
        }
        insert_data = {
          ...insert_data,
          media: multiplelinkedin_media_array,
        };
      }
    }

    if (urls) {
      urls = JSON.parse(urls);

      if (urls) {
        urls.map((value) => {
          if (value) {
            let file_data = {
              file_type: "url",
              file_name: value,
            };
            multiplelinkedin_media_array.push(file_data);
          }
        });
        insert_data = {
          ...insert_data,
          media: multiplelinkedin_media_array,
        };
      }
    }

    let user_data = await users.findOne({
      _id: user_id,
      is_deleted: false,
    });

    if (!user_data) {
      return errorRes(res, `Account is not found`);
    }

    if (insert_data) {
      var create_experience = await experienceSchema.create(insert_data);


      if (create_experience) {
        const sql = "SELECT * from user WHERE identifier  = ?";
        const values = [user_data?._id.toString()];
        const results = await performQuery(sql, values);

        console.log("results", results)

        if (results.length == 0) {
          console.log("Couldn't found user.");
        } else {

          console.log("results+++++++++++", results)
          const data = [
            identifier = create_experience?._id.toString(),
            user_idfr = results[0].id,
            job_title = create_experience?.title,
            employee_type = create_experience?.emp_type,
            company_name = create_experience?.company_name,
            company_address = create_experience?.address,
            industry = create_experience?.industry,
            start_date = create_experience?.start_date,
            end_date = create_experience?.end_date,
            job_description = create_experience?.description,
          ];
          const insertdata = await performQuery(
            "INSERT INTO user_experience (identifier, user_idfr, job_title,employee_type, company_name, company_address, industry, start_date, end_date, job_description) values(?,?,?,?,?,?,?,?,?,?)",
            data
          );

          console.log({ insertdata });
          if (insertdata.affectedRows === 0) {
            console.log("User not found.");
          } else {
            create_experience?.media.map(async (value) => {
              if (value?.file_type == "image" || value?.file_type == "document" || value?.file_type == "video" || value?.file_type == "url") {
                const data1 = [
                  identifier = value?._id.toString(),
                  user_experience_idfr = insertdata.insertId,
                  media_url = value?.file_name,
                  media_size = value?.file_size,
                  media_type = value?.file_type,
                ];

                const insertdata1 = await performQuery(
                  "INSERT INTO user_experience_media (identifier, user_experience_idfr, media_url, media_size, media_type) values(?,?,?,?,?)",
                  data1
                );

                if (insertdata1.affectedRows === 0) {
                  console.log("User experience not found.");
                } else {
                  console.log("User experience media data add successfully.");
                }
              }

            });
            console.log("User experience data add successfully.");
          }
        }
      }

      create_experience?.media.map((value) => {
        if (value?.file_type == "image" || value?.file_type == "document") {
          value.file_name = process.env.BASE_URL + value.file_name;
        }
        if (value?.file_type == "video") {
          value.file_name = process.env.BASE_URL + value.file_name;
          value.thumb_name = process.env.BASE_URL + value.thumb_name;
        }
      });

      if (create_experience) {
        var update_user = await users.findByIdAndUpdate(
          { _id: user_id },
          { $push: { experience: create_experience?._id } },
          { new: true }
        );
      }

      if (update_user) {
        return successRes(
          res,
          `Experience and skill added successfully`,
          create_experience
        );
      }
    }
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const editExperince = async (req, res) => {
  try {
    if (!req.body.user_id) {
      var user_id = req.user._id;
    } else {
      var user_id = req.body.user_id;
    }

    var {
      experince_id,
      title,
      emp_type,
      company_name,
      location,
      address,
      is_cuurrently_working,
      start_date,
      end_date,
      industry,
      description,
      media,
      urls,
      delete_media_array,
    } = req.body;

    let startDate = addOneMinute(start_date);
    var enddate;
    if (end_date) {
      enddate = addOneMinute(end_date);
    }

    console.log("enddate", enddate);

    if (req.files != undefined) {
      var { media } = req.files;
    }
    var update_data = {
      title,
      emp_type,
      company_name,
      location,
      address,
      is_cuurrently_working,
      start_date: startDate,
      end_date: end_date ? enddate : end_date,
      industry,
      description,
    };

    console.log("update_data", update_data);

    if (delete_media_array) {
      delete_media_array = JSON.parse(delete_media_array);
      for (var value1 of delete_media_array) {
        var find_image = await experienceSchema.findOne({
          _id: experince_id,
          "media._id": value1,
        });
        if (find_image) {
          for (var value of find_image.media) {
            if (value._id == value1) {
              if (value.file_type != "url") {
                unlink(`${outputPath}/public/${value.file_name}`, (err) => {
                  if (err) console.log(err);
                });

                if (value?.file_type == "video") {
                  unlink(`${outputPath}/public/${value.thumb_name}`, (err) => {
                    if (err) console.log(err);
                  });
                }
              }
            }
          }
          var remove_image = await experienceSchema.updateOne(
            { _id: experince_id },
            { $pull: { media: { _id: value1 } } }
          );
          const deleteData = await performQuery(
            "DELETE FROM user_experience_media WHERE identifier = ?",
            [value1.toString()]
          );
        }
      }
    }

    if (location) {
      location = JSON.parse(location);
      update_data = {
        ...update_data,
        location: location,
      };
    }

    var check_media = util.isArray(media);

    if (check_media == false) {
      var linkedin_media_array = [];
      linkedin_media_array.push(media);
    } else {
      var linkedin_media_array = media;
    }
    var multiplelinkedin_media_array = [];
    if (linkedin_media_array[0] != undefined) {
      for (var value of linkedin_media_array) {
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
            file_name: `linkedin_media/${file_name_gen}`,
            thumb_name: `linkedin_media/${thumbnail_path}`,
          };
          let old_path = value.path;
          let new_path = "public/linkedin_media/" + file_name_gen;
          let new_path_thumb = "public/linkedin_media/" + thumbnail_path;

          await fs.promises.copyFile(old_path, new_path);

          ffmpeg(new_path)
            .screenshots({
              timestamps: ["50%"],
              filename: file_name_gen.replace(/\.[^/.]+$/, ".jpeg"),
              folder: "public/linkedin_media",
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
          var updated_image = await experienceSchema.findByIdAndUpdate(
            { _id: experince_id },
            { $push: { media: file_data } },
            { new: true }
          );
        }

        if (
          file_extension == "pdf" ||
          file_extension == "docx" ||
          file_extension == "doc"
        ) {
          let file_data = {
            file_type: "document",
            file_name: `linkedin_media/${file_name_gen}`,
          };
          let old_path = value.path;
          let new_path = "public/linkedin_media/" + file_name_gen;
          await fs.readFile(old_path, function (err, data) {
            if (err) throw err;
            fs.writeFile(new_path, data, function (err) {
              if (err) throw err;
            });
          });

          var updated_image = await experienceSchema.findByIdAndUpdate(
            { _id: experince_id },
            { $push: { media: file_data } },
            { new: true }
          );
        }

        if (
          file_extension == "jpeg" ||
          file_extension == "jpg" ||
          file_extension == "png" ||
          file_extension == "raw" ||
          file_extension == "mpeg" ||
          file_extension == "jfif" ||
          file_extension == "webp"
        ) {
          let file_data = {
            file_type: "image",
            file_name: `linkedin_media/${file_name_gen}`,
          };
          let old_path = value.path;
          let new_path = "public/linkedin_media/" + file_name_gen;
          await fs.readFile(old_path, function (err, data) {
            if (err) throw err;
            fs.writeFile(new_path, data, function (err) {
              if (err) throw err;
            });
          });

          var updated_image = await experienceSchema.findByIdAndUpdate(
            { _id: experince_id },
            { $push: { media: file_data } },
            { new: true }
          );
        }
      }
    }

    if (urls) {
      urls = JSON.parse(urls);
      if (urls) {
        urls.map(async (value) => {
          if (value) {
            let file_data = {
              file_type: "url",
              file_name: value,
            };
            var updated_image = await experienceSchema.findByIdAndUpdate(
              { _id: experince_id },
              { $push: { media: file_data } },
              { new: true }
            );
          }
        });
      }
    }

    let user_data = await users.findOne({
      _id: user_id,
      is_deleted: false,
    });

    if (!user_data) {
      return errorRes(res, `Account is not found`);
    }

    if (update_data) {
      var update_experince = await experienceSchema.findByIdAndUpdate(
        { _id: experince_id },
        update_data,
        { new: true }
      );

      var update_experince_data = await experienceSchema.findOne({
        _id: update_experince._id
      });
      if (update_experince) {
        const sql = "SELECT * from user WHERE identifier  = ?";
        const values = [user_data?._id.toString()];
        const results = await performQuery(sql, values);

        if (results.affectedRows === 0) {
          console.log("Couldn't found user.");
        } else {
          const data = [
            update_experince?.title ?? null,
            update_experince?.emp_type ?? null,
            update_experince?.company_name ?? null,
            update_experince?.address ?? null,
            update_experince?.industry ?? null,
            update_experince?.start_date ?? null,
            update_experince?.end_date ?? null,
            update_experince?.description ?? null,
            results[0].id,
            update_experince._id.toString(),
          ];
          const updatedata = await performQuery(
            "UPDATE user_experience SET job_title = ?, employee_type = ?, company_name = ?, company_address = ?, industry = ?, start_date = ?, end_date = ?, job_description = ? WHERE user_idfr = ? AND identifier = ?",
            data
          );

          if (updatedata.affectedRows === 0) {
            console.log("User not found.");
          } else {
            update_experince_data?.media.map(async (value) => {
              if (value?.file_type == "image" || value?.file_type == "document" || value?.file_type == "video" || value?.file_type == "url") {
                const sql = "SELECT * from user_experience_media WHERE identifier  = ?";
                const values = [value?._id.toString()];
                const results = await performQuery(sql, values);

                if (results.length > 0) {
                  const data1 = [
                    media_url = value?.file_name,
                    media_size = value?.file_size,
                    media_type = value?.file_type,
                    identifier = value?._id.toString(),
                  ];

                  const updatedata1 = await performQuery(
                    "UPDATE user_experience_media SET media_url = ?, media_size = ?, media_type = ? WHERE identifier = ?",
                    data1
                  );

                  if (updatedata1.affectedRows === 0) {
                    console.log("User experience not found.");
                  } else {
                    console.log("User experience media data updatd successfully.");
                  }
                } else {
                  const sql = "SELECT * from user_experience WHERE identifier = ?";
                  const values = [update_experince_data?._id.toString()];
                  const results = await performQuery(sql, values);

                  const data1 = [
                    identifier = value._id.toString(),
                    user_experience_idfr = results[0].id,
                    media_url = value?.file_name,
                    media_size = value?.file_size,
                    media_type = value?.file_type,
                  ];

                  const insertdata1 = await performQuery(
                    "INSERT INTO user_experience_media (identifier, user_experience_idfr, media_url, media_size, media_type) values(?,?,?,?,?)",
                    data1
                  );

                  if (insertdata1.affectedRows === 0) {
                    console.log("User experience not found.");
                  } else {
                    console.log("User experience media data add successfully.");
                  }
                }
              }

            });
            console.log("User experience data updatd successfully.");
          }
        }
      }

      update_experince?.media.map((value) => {
        if (value?.file_type == "image" || value?.file_type == "document") {
          value.file_name = process.env.BASE_URL + value.file_name;
        }
        if (value?.file_type == "video") {
          value.file_name = process.env.BASE_URL + value.file_name;
          value.thumb_name = process.env.BASE_URL + value.thumb_name;
        }
      });

      console.log("update_experince", update_experince);

      if (update_experince) {
        return successRes(
          res,
          `Experience updated successfully`,
          update_experince
        );
      }
    }
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const deleteExperince = async (req, res) => {
  try {
    if (!req.body.user_id) {
      var user_id = req.user._id;
    } else {
      var user_id = req.body.user_id;
    }

    var { experince_id } = req.body;

    console.log("req.body", req.body);

    let user_data = await users.findOne({
      _id: user_id,
      is_deleted: false,
    });

    if (!user_data) {
      return errorRes(res, `Account is not found`);
    }

    if (experince_id) {
      let find_experince = await experienceSchema.findOne({
        _id: experince_id,
        user_id: user_id,
        is_deleted: false,
      });

      if (!find_experince) {
        return errorRes(res, `Experience and skills is not found`);
      }
    }

    var experinceIdToRemove = new ObjectId(experince_id);
    var remove_experince = await users.updateOne(
      { _id: user_id },
      { $pull: { experience: experinceIdToRemove } }
    );
    var find_image = await experienceSchema.findOne({
      _id: experince_id,
    });

    if (find_image) {
      for (var value of find_image.media) {
        if (value.file_type != "url") {
          if (`${outputPath}/public/${value?.file_name}`) {
            unlink(`${outputPath}/public/${value?.file_name}`, (err) => {
              if (err) console.log(err);
            });
          }
          if (value?.file_type != null && value?.file_type == "video") {
            if (`${outputPath}/public/${value?.thumb_name}`) {
              unlink(`${outputPath}/public/${value?.thumb_name}`, (err) => {
                if (err) console.log(err);
              });
            }
          }
        }


        const deleteData = await performQuery(
          "DELETE FROM user_experience_media WHERE identifier = ?",
          [value.toString()]
        );
      }
    }

    var delete_remove_experince = await experienceSchema.findByIdAndDelete({
      _id: experince_id,
    });

    const deleteData1 = await performQuery(
      "DELETE FROM user_experience WHERE identifier = ?",
      [delete_remove_experince?._id.toString()]
    );


    if (delete_remove_experince) {
      return successRes(
        res,
        `Experience and skills deleted successfully`,
        delete_remove_experince
      );
    }
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const experinceList = async (req, res) => {
  try {
    if (!req.body.user_id) {
      var user_id = req.user._id;
    } else {
      var user_id = req.body.user_id;
    }
    if (user_id) {
      let find_experience = await experienceSchema
        .find({
          user_id: user_id,
          is_deleted: false,
        })
        .sort({ createdAt: -1 });

      find_experience?.map((data) => {
        if (data?.media) {
          data.media.map((value) => {
            if (value?.file_type == "image" || value?.file_type == "document") {
              value.file_name = process.env.BASE_URL + value.file_name;
            }
            if (value?.file_type == "video") {
              value.file_name = process.env.BASE_URL + value.file_name;
              value.thumb_name = process.env.BASE_URL + value.thumb_name;
            }
          });
        }
      });

      if (find_experience) {
        return successRes(
          res,
          `Experience list get successfully`,
          find_experience
        );
      }
    }
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const addCustomfield = async (req, res) => {
  try {
    if (!req.body.user_id) {
      var user_id = req.user._id;
    } else {
      var user_id = req.body.user_id;
    }

    var { title, description } = req.body;

    var insert_data = {
      user_id,
      title,
      description,
    };

    let user_data = await users.findOne({
      _id: user_id,
      is_deleted: false,
    });

    if (!user_data) {
      return errorRes(res, `Account is not found`);
    }

    if (insert_data) {
      var create_customfield = await custom_field.create(insert_data);

      const sql = "SELECT * from user WHERE identifier  = ?";
      const values = [user_data?._id.toString()];
      const results = await performQuery(sql, values);

      if (results.affectedRows === 0) {
        console.log("Couldn't found user.");
      } else {
        //identifier : custom field id
        const data = [
          identifier = create_customfield?._id.toString(),
          user_idfr = results[0].id,
          title = create_customfield?.title,
          description = create_customfield?.description
        ];
        const insertdata = await performQuery(
          "INSERT INTO user_custom_field (identifier, user_idfr, title ,description ) values(?,?,?,?)",
          data
        );
        if (insertdata.affectedRows === 0) {
          console.log("User not found.");
        } else {
          console.log(" User_custom_field data add successfully.");
        }
      }

      if (create_customfield) {
        var update_user = await users.findByIdAndUpdate(
          { _id: user_id },
          { $push: { custom_field: create_customfield?._id } },
          { new: true }
        );
      }

      if (update_user) {
        return successRes(
          res,
          `Custom field added successfully`,
          create_customfield
        );
      }
    }
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const editCustomfield = async (req, res) => {
  try {
    if (!req.body.user_id) {
      var user_id = req.user._id;
    } else {
      var user_id = req.body.user_id;
    }

    var { customfield_id, title, description } = req.body;

    let user_data = await users.findOne({
      _id: user_id,
      is_deleted: false,
    });

    if (!user_data) {
      return errorRes(res, `Account is not found`);
    }

    if (customfield_id) {
      let find_customfield = await custom_field.findOne({
        _id: customfield_id,
        user_id: user_id,
        is_deleted: false,
      });

      if (!find_customfield) {
        return errorRes(res, `Customfield is not found`);
      }
    }

    var update_data = {
      title: title,
      description: description,
    };

    var update_user = await custom_field.findByIdAndUpdate(
      { _id: customfield_id },
      update_data,
      { new: true }
    );
    if (update_user) {
      const data = [
        title,
        description,
        update_user._id.toString(),
      ];

      const updatedata = await performQuery(
        "UPDATE user_custom_field SET title = ?, description = ? WHERE identifier = ?",
        data
      );
    }
    if (update_user) {
      return successRes(res, `Custom field updated successfully`, update_user);
    }
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const deleteCustomfield = async (req, res) => {
  try {
    if (!req.body.user_id) {
      var user_id = req.user._id;
    } else {
      var user_id = req.body.user_id;
    }

    var { customfield_id } = req.body;

    console.log("req.body", req.body);

    let user_data = await users.findOne({
      _id: user_id,
      is_deleted: false,
    });

    if (!user_data) {
      return errorRes(res, `Account is not found`);
    }

    if (customfield_id) {
      let find_customfield = await custom_field.findOne({
        _id: customfield_id,
        user_id: user_id,
        is_deleted: false,
      });

      if (!find_customfield) {
        return errorRes(res, `find_customfield id is not found`);
      }
    }

    var customfieldIdToRemove = new ObjectId(customfield_id);
    var remove_customfield = await users.updateOne(
      { _id: user_id },
      { $pull: { custom_field: customfieldIdToRemove } }
    );

    var delete_custom_field = await custom_field.findByIdAndDelete({
      _id: customfield_id,
    });

    const updatedata = await performQuery(
      "DELETE FROM user_custom_field  WHERE identifier = ?",
      [customfield_id]
    );

    if (delete_custom_field) {
      return successRes(
        res,
        `Customfield deleted successfully`,
        delete_custom_field
      );
    }
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const customfieldList = async (req, res) => {
  try {
    if (!req.body.user_id) {
      var user_id = req.user._id;
    } else {
      var user_id = req.body.user_id;
    }
    if (user_id) {
      let find_customfield = await custom_field
        .find({
          user_id: user_id,
          is_deleted: false,
        })
        .sort({ createdAt: -1 });

      if (find_customfield) {
        return successRes(
          res,
          `Customfield list get successfully`,
          find_customfield
        );
      }
    }
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const linkedinpersonalInfo = async (req, res) => {
  try {
    if (!req.body.user_id) {
      var user_id = req.user._id;
    } else {
      var user_id = req.body.user_id;
    }

    var find_user = await users
      .findById({ _id: user_id })
      .where({
        is_block: false,
        is_deleted: false,
      })
      .select(
        "_id skills_details demographics social_media_link is_linkedin_complete"
      );

    if (!find_user) {
      return errorRes(res, `Account is not found`);
    }

    if (user_id) {
      let find_customfield = await custom_field
        .find({
          user_id: user_id,
          is_deleted: false,
        })
        .sort({ createdAt: -1 });

      let find_eduaction = await eduaction
        .find({
          user_id: user_id,
          is_deleted: false,
        })
        .sort({ createdAt: -1 });

      let find_experience = await experienceSchema
        .find({
          user_id: user_id,
          is_deleted: false,
        })
        .sort({ createdAt: -1 });

      var data = {
        skills_details: find_user?.skills_details,
        demographics: find_user?.demographics,
        social_media_link: find_user?.social_media_link,
        linkedin_personalinfo: find_user?.is_linkedin_complete,
        education: find_eduaction,
        custom_field: find_customfield,
        experience: find_experience,
      };

      data?.experience?.map((data) => {
        if (data?.media) {
          data.media.map((value) => {
            if (value?.file_type == "image" || value?.file_type == "document") {
              value.file_name = process.env.BASE_URL + value.file_name;
            }
            if (value?.file_type == "video") {
              value.file_name = process.env.BASE_URL + value.file_name;
              value.thumb_name = process.env.BASE_URL + value.thumb_name;
            }
          });
        }
      });

      if (find_customfield) {
        return successRes(
          res,
          `Linkedin personal information get successfully`,
          data
        );
      }
    }
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const getsubInteresttesting = async (req, res) => {
  try {
    var { language } = req.body;

    if (language == undefined) {
      var find_interest = await interest
        .find()
        .where({ is_deleted: false, is_block: false })
        .sort({ createdAt: 1 });
      var final_array = [];
      for (var data of find_interest) {
        var find_sub_interest = await subinterest
          .find()
          .where({
            interest_id: new ObjectId(data._id),
            is_deleted: false,
            is_block: false,
          })
          .sort({ createdAt: 1 });
        var value;
        if (data?._id == process.env.OFF_TOPIC_ID) {
          value = {
            ...data._doc,
            sub_interest_data: [],
          };
        } else {
          value = {
            ...data._doc,
            sub_interest_data: find_sub_interest,
          };
        }

        final_array.push(value);
      }
      return successRes(res, `Interest get successfully`, final_array);
    }

    var pipeline = [];
    if (language) {
      pipeline.push(
        {
          $match: { is_deleted: false, is_block: false },
        },
        {
          $project: {
            _id: 1,
            interest: `$${language}`,
            color_code: 1,
          },
        }
      );
    } else {
      pipeline.push(
        {
          $match: { is_deleted: false, is_block: false },
        },
        {
          $project: {
            _id: 1,
            interest: 1,
            color_code: 1,
          },
        }
      );
    }
    pipeline.push({
      $sort: { createdAt: 1 },
    });
    var find_interest = await interest.aggregate(pipeline);

    var final_array = [];

    for (var data of find_interest) {
      var find_sub_interest = await subinterest
        .find({
          interest_id: new ObjectId(data._id),
          is_deleted: false,
          is_block: false,
        })
        .sort({ createdAt: 1 });

      var value;

      if (data != null && data._id == process.env.OFF_TOPIC_ID) {
        value = {
          ...data,
          sub_interest_data: [],
        };
      } else {
        value = {
          ...data,
          sub_interest_data: find_sub_interest.map((sub) => {
            if (language && sub[language]) {
              return { ...sub._doc, sub_interest: sub[language] };
            } else {
              return sub._doc;
            }
          }),
        };
      }

      final_array.push(value);
    }
    return successRes(res, `Interest get successfully`, final_array);
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const createTable = async (req, res) => {
  try {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      identifier CHAR(36) NOT NULL,
      first_name VARCHAR(255) NOT NULL,
      profile_picture TEXT,
      profile_url TEXT,
      user_id VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE (identifier)
    )
  `;
    return;
    // const alterTableQuery = `
    // ALTER TABLE users
    //   MODIFY COLUMN profile_picture TEXT,
    //   MODIFY COLUMN profile_url TEXT
    // `;

    // const dropColumnQuery = `
    // ALTER TABLE users
    //   DROP COLUMN profile_picture
    // `;

    // Execute the SQL query to create the table
    // database_connection.query(createTableQuery, (err, result) => {
    //   if (err) {

    //     return errorRes(res, "something went wrong",err);
    //   } else {
    //     return successRes(res, `Table created successfully`);
    //   }
    // });
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const healthCheck = async (req, res) => {
  return successRes(res, "App APIs is running fine..");
};

const mysqlscript = async (req, res) => {
  try {

    // var find_user = await users.find({ is_deleted: false, is_block: false })
    var find_user_data = await users.findOne({
      is_deleted: false, is_block: false, _id: new ObjectId("665576ab5c9c61bfac79ba07")
    })

    // console.log("find_user", find_user)

    var find_user = []
    find_user.push(find_user_data)



    if (find_user) {
      find_user.map(async (value) => {
        const updatedata = await performQuery(
          "SELECT * FROM user WHERE identifier = ?",
          value._id.toString()
        );

        if (updatedata.length == 0) {

          const nameParts = value.full_name.split(' ');
          var firstName = nameParts[0];
          var middleName = nameParts[0];
          var lastName = nameParts[0];
          console.log("firstName", firstName)

          const data = [
            identifier = value._id.toString(),
            first_name = firstName,
            profile_picture = value?.profile_picture ? value.profile_picture : value.profile_url,
            dob = value?.dob,
            user_id = value.unique_name,
            last_seen = value.user_last_active_date,
            is_online = value.is_online,
            disability = value?.demographics?.disability,
            gender = value?.demographics?.gender,
            relation_status = value?.demographics?.marriage_status
          ];

          const insertdata = await performQuery(
            "INSERT INTO user(identifier, first_name, profile_picture,dob ,user_id,last_seen,is_online,disability,gender,relation_status ) values(?,?,?,?,?,?,?,?,?,?)",
            data
          );

          if (insertdata) {
            console.log("insertdata-----+++++++++++++------", insertdata.insertId)


            if (value?.demographics?.zipcode != null && value?.demographics?.zipcode != '') {
              const addressdata = [
                identifier = value?._id.toString(),
                user_idfr = insertdata?.insertId,
                zipcode = value?.demographics?.zipcode,
              ]


              console.log('addressdata', addressdata)


              const add_address = await performQuery(
                "INSERT INTO user_address(identifier, user_idfr, zipcode) values(?,?,?)",
                addressdata
              );

            }
            var linkedin_link = value?.social_media_link?.linkedin
            var facebook_link = value?.social_media_link?.facebook
            var twitter_link = value?.social_media_link?.twitter
            var instagram_link = value?.social_media_link?.instagram

            const social_data = [
              identifier = value?._id.toString(),
              user_idfr = insertdata?.insertId,
              linkedin_link = linkedin_link,
              facebook_link = facebook_link,
              twitter_link = twitter_link,
              instagram_link = instagram_link,
            ];

            const add_social = await performQuery(
              "INSERT INTO user_social(identifier, user_idfr, linkedin_link ,facebook_link,twitter_link,instagram_link ) values(?,?,?,?,?,?)",
              social_data
            );


            if (value?.skills_details != null && value?.skills_details.length > 0) {
              value?.skills_details.map(async (val) => {
                if (val?._id) {
                  const datas = [
                    identifier = val?._id.toString(),
                    user_idfr = insertdata?.insertId,
                    skill = val?.skill_name,
                    level = 5,
                  ];

                  const insertdatafsd = await performQuery(
                    "INSERT INTO user_skill(identifier, user_idfr, skill ,level ) values(?,?,?,?)",
                    datas
                  );
                }

              })
            }




            var find_session = await user_session.find({
              user_id: value?._id,
              is_deleted: false,
            })

            if (find_session) {

              find_session?.map(async (val) => {

                const data = [
                  identifier = val.user_id.toString(),
                  user_idfr = insertdata?.insertId,
                  login_timestamp = val.createdAt,
                  session_token = val.device_token,
                  device_info = val.device_type,
                  logout_timestamp = val.logout_time
                ]
                const session_data = await performQuery(
                  "INSERT INTO user_session(identifier, user_idfr, login_timestamp ,session_token,device_info ,logout_timestamp) values(?,?,?,?,?,?)",
                  data
                );

              })

            }
            var find_customfield = await custom_field.find({
              user_id: value?._id,
              is_deleted: false,
            });


            console.log("find_customfield", insertdata?.insertId)
            if (find_customfield) {
              find_customfield?.map(async (val) => {
                const data = [
                  identifier = val?.user_id.toString(),
                  user_idfr = insertdata?.insertId,
                  title = val?.title,
                  description = val?.description
                ];
                const insertdataaa = await performQuery(
                  "INSERT INTO user_custom_field (identifier, user_idfr, title ,description ) values(?,?,?,?)",
                  data
                );
              })
            }


            var find_user_experience = await experienceSchema.find({
              user_id: value?._id,
              is_deleted: false,
            })


            if (find_user_experience) {
              find_user_experience.map(async (val) => {


                const data = [
                  identifier = val?._id.toString(),
                  user_idfr = insertdata?.insertId,
                  job_title = val?.title,
                  employee_type = val?.emp_type,
                  company_name = val?.company_name,
                  company_address = val?.address,
                  industry = val?.industry,
                  start_date = val?.start_date,
                  end_date = val?.end_date,
                  job_description = val?.description,
                ];

                const insertingdata = await performQuery(
                  "INSERT INTO user_experience (identifier, user_idfr, job_title,employee_type, company_name, company_address, industry, start_date, end_date, job_description) values(?,?,?,?,?,?,?,?,?,?)",
                  data
                );

                console.log({ insertingdata });
                if (insertingdata.affectedRows === 0) {
                  console.log("User not found.");
                } else {

                  console.log("insertingdata of find_user_experience", insertingdata)

                  if (val?.media.length > 0) {
                    val?.media.map(async (valuedata) => {
                      if (valuedata?.file_type == "image" || valuedata?.file_type == "document" || valuedata?.file_type == "video" || valuedata?.file_type == "url") {
                        const data1 = [
                          identifier = valuedata?._id.toString(),
                          user_experience_idfr = insertingdata.insertId,
                          media_url = valuedata?.file_name,
                          media_size = valuedata?.file_size,
                          media_type = valuedata?.file_type,
                        ];

                        const insertdata1 = await performQuery(
                          "INSERT INTO user_experience_media (identifier, user_experience_idfr, media_url, media_size, media_type) values(?,?,?,?,?)",
                          data1
                        );

                        if (insertdata1.affectedRows === 0) {
                          console.log("User experience not found.");
                        } else {
                          console.log("User experience media data add successfully.");
                        }
                      }

                    });
                  }
                  console.log("User experience data add successfully.");
                }
              })

            }


            var find_eduaction = await eduaction.find({
              user_id: value?._id,
              is_deleted: false,
            })

            if (find_eduaction) {
              find_eduaction?.map(async (val) => {
                const data = [
                  identifier = val?._id.toString(),
                  user_idfr = insertdata?.insertId,
                  degree_obtained = val?.degree,
                  field_of_study = val?.field_of_Study,
                  institution_attended = val?.school,
                  start_date = val?.start_date,
                  end_date = val?.end_date,
                  description = val?.description,
                  activities_societies = val?.activities_and_societies,
                  grade = val?.grade
                ];

                const inserteducation = await performQuery(
                  "INSERT INTO user_education (identifier, user_idfr, degree_obtained ,field_of_study ,institution_attended ,start_date ,end_date ,description ,activities_societies ,grade ) values(?,?,?,?,?,?,?,?,?,?)",
                  data
                );
                if (inserteducation.affectedRows === 0) {
                  console.log("User not found.");
                } else {
                  console.log(" Education data add successfully.");
                }
              })
            }

          }

        }

      })


    }


    return successRes(res, `All data add in mysql successfully`);


  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
}

module.exports = {
  signup,
  sendOTP,
  verifyOtp,
  resetPassword,
  checkEmail,
  signIn,
  changePassword,
  deactiveAccount,
  logout,
  getsubInterest,
  changeFollowername,
  selfDelete,
  editProfile,
  createReportforproblem,
  createSupport,
  accountVerifications,
  getUserdetails,
  getverifiedUserDetails,
  reporttoUser,
  blockTouser,
  block_list,
  notificationList,
  searchPage,
  privateAccount,
  searchUser,
  searchPost,
  searchGroups,
  getUserInterests,
  editUserInterests,
  faqList,
  privacyPolicy,
  termsandConditions,
  directMessageSetting,
  deleteVerificationRequest,
  testsignup,
  title_descriptions,
  changeToken,
  about,
  getUserinfo,
  uplodelinkedinMedia,
  addEduaction,
  editEduaction,
  deleteEduaction,
  eduactionList,
  addCustomfield,
  editCustomfield,
  deleteCustomfield,
  customfieldList,
  addExperience,
  editExperince,
  deleteExperince,
  experinceList,
  linkedinpersonalInfo,
  getsubInteresttesting,
  createTable,
  healthCheck,
  mysqlscript
};
