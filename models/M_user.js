const mongoose = require("mongoose");
const locationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      default: "Point",
    },
    coordinates: {
      type: [Number],
      required: [true, "coordinates is required."], // [long , lat]
    },
  },
  { _id: false }
);

const skillsschema = new mongoose.Schema([
  {
    skill_name: {
      type: String,
    }
  },
]);


const demographicsDetails = new mongoose.Schema(
  {
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    age: {
      type: String,
    },
    disability: {
      type: String,
    },
    zipcode: {
      type: String,
    },
    marriage_status: {
      type: String,
    },
  },
  { _id: false }
);


const socialmedialink_details = new mongoose.Schema([
  {
    linkedin: {
      type: String,
    },
    facebook: {
      type: String,
    },
    twitter: {
      type: String,
    },
    instagram: {
      type: String,
    },
  },
]);

const usersSchema = new mongoose.Schema(
  {
    user_type: {
      type: String,
      enum: ["user", "admin"],
    },
    full_name: {
      type: String,
      default: null,
    },
    email_address: {
      type: String,
      trim: true,
      index: true,
      lowercase: true,
      // validate: {
      //   validator: function (v) {
      //     return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
      //   },
      //   message: "Your email is not valid please enter the correct email",
      // },

      // required: [true, "Email address is required."],
    },
    mobile_number: {
      type: String,
      trim: true,
      required: false,
    },
    country_code: {
      type: String,
      default: null,
    },
    password: {
      type: String,
      default: null,
    },
    location: {
      type: locationSchema,
    },
    dob: {
      type: Date,
      default: null,
    },
    profile_picture: {
      type: String,
      default: null,
    },
    bio: { type: String, default: null },
    unique_name: {
      type: String,
    },
    name_of_followers: {
      type: String,
      default: "Followers",
    },
    is_self_delete: {
      type: Boolean,
      enum: [true, false],
      default: false,
    },
    otp: {
      type: Number,
      length: [4, "OTP must be 4 digit."],
      default: null,
    },
    is_social_login: {
      type: Boolean,
      enum: [true, false],
      default: false, // true- login with social id, false- normal login
    },
    profile_url: {
      type: String,
      default: null,
    },
    social_id: {
      type: String,
      default: null,
    },
    social_platform: {
      type: String,
      enum: ["google", "facebook", "apple", "phone"],
      default: null,
    },
    noti_badge: {
      type: Number,
      default: 0,
    },
    website_link: {
      type: String,
      default: null,
    },
    instagram_link: {
      type: String,
      default: null,
    },
    facebook_link: {
      type: String,
      default: null,
    },
    twitter_link: {
      type: String,
      default: null,
    },
    social_platform_data: {
      type: String,
      enum: ["everyone", "connection", "noone", null],// Direct Message
      default: "everyone",
    },
    user_last_active_date: {
      type: Date,
      default: null,
    },
    is_verified: {
      type: Boolean,
      enum: [true, false],
      default: false, // true-User_verified, false-User_not_verified
    },
    is_private_account: {
      type: Boolean,
      enum: [true, false],
      default: false, // true-private, false-not private
    },
    is_deactive_account: {
      type: Boolean,
      enum: [true, false],
      default: false, // is_active:false ,is_deactive:true
    },
    interested: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "sub_interest", // Refers to thesubinterest model
      },
    ],
    is_login: {
      type: Boolean,
      enum: [true, false],
      default: true, // true-login, false-Not_login
    },
    is_online: {
      type: Boolean,
      enum: [true, false],
      default: true, // true-online, false-Not online
    },
    socket_id: {
      type: String, //store socket ID,
      default: null,
    },
    demographics: { type: demographicsDetails },
    social_media_link: { type: socialmedialink_details },
    education: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "education", // Refers to thesubinterest model
      },
    ],
    experience: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "experience", // Refers to thesubinterest model
      },
    ],
    custom_field: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "custom_field", // Refers to thesubinterest model
      },
    ],
    skills_details: { type: [skillsschema] },
    is_linkedin_complete: {
      type: Boolean,
      enum: [true, false],
      default: false, // true-complete, false-Not complete
    },
    is_profile_complete: {
      type: Boolean,
      enum: [true, false],
      default: false, // true-complete, false-Not complete
    },
    is_coming_soon: {
      type: Boolean,
      enum: [true, false],
      default: false,
    },
    is_block: {
      type: Boolean,
      enum: [true, false],
      default: false, // true-block, false-Not block
    },
    is_fake: {
      type: Boolean,
      enum: [true, false],
      default: false, // true-deleted, false-Not_deleted
    },
    is_deleted: {
      type: Boolean,
      enum: [true, false],
      default: false, // true-deleted, false-Not_deleted
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("users", usersSchema);
