const joi = require("joi");
const userSignUpDto = joi.object().keys({
  full_name: joi.string().required().label("Full name"),
  user_type: joi.string().required().valid("user", "admin").label("User type"),
  email_address: joi.string().email().allow().label("Email address"),
  country_code: joi.string().allow().label("Country code"),
  mobile_number: joi.string().allow().label("Mobile number"),
  dob: joi.date().required().label("DOB"),
  password: joi.string().min(6).allow().label("Password"),
  location: joi.string().allow().label("Location"),
  interested: joi.string().required().label("Interested"),
  device_type: joi
    .string()
    .valid("ios", "android", "web")
    .allow()
    .label("Device type"),
  device_token: joi.string().required().label("Device token"),
  unique_name: joi.string().required().label("Unique name"),
  is_social_login: joi.string().allow(),
  social_platform: joi.string().allow(),
  social_id: joi.string().allow(),
  profile_url: joi.string().allow(),

  is_linkdin_connect: joi.string().allow(),
  demographics: joi.string().allow(),
  social_media_link: joi.string().allow(),
  skills_details: joi.string().allow()
});

const userSigninDto = joi.object().keys({
  user_type: joi.string().required().valid("user", "admin").label("User type"),
  email_address: joi.string().allow().label("Email or User name"),
  password: joi.string().min(6).allow().label("Password"),
  interested: joi.string().allow().label("Interested"),
  device_type: joi
    .string()
    .valid("ios", "android", "web")
    .allow()
    .label("Device type"),
  device_token: joi.string().required().label("Device token"),
  location: joi.string().allow().label("Location"),
  is_social_login: joi.string().allow(),
  social_platform: joi.string().allow(),
  social_id: joi.string().allow(),
  profile_url: joi.string().allow(),
  unique_name: joi.string().allow().label("Unique name"),
  mobile_number: joi.string().allow().label("Mobile number"),
  country_code: joi.string().allow().label("Country code"),
});

const sendotpdto = joi.object().keys({
  email_address: joi.string().email().required().label("Email address"),
});
const checkmailDto = joi.object().keys({
  email_address: joi.string().email().required().label("Email address"),
});

const verifyOtpDto = joi.object().keys({
  email_address: joi.string().email().required().label("Email address"),
  otp: joi.string().length(4).required().label("OTP"),
});

const resetPasswordDto = joi.object().keys({
  email_address: joi.string().email().required().label("Email address"),
  password: joi.string().min(6).required().label("Password"),
});

const changePasswordDto = joi.object().keys({
  old_password: joi.string().min(6).required().label("Old password"),
  new_password: joi.string().min(6).required().label("New password"),
});
const deactiveAccountDto = joi.object().keys({
  is_deactive_account: joi.boolean().required().label("Is deactive account"),
});
const changeFollowernameDto = joi.object().keys({
  follower_name: joi.string().required().label("Follower name"),
});

const editProfileDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
  full_name: joi.string().allow().label("Full name"),
  unique_name: joi.string().allow().label("Unique name"),
  twitter_link: joi.allow().label("Twitter link"),
  facebook_link: joi.allow().label("Facebook link"),
  instagram_link: joi.allow().label("Instagram link"),
  website_link: joi.allow().label("Website link"),
  bio: joi.allow().label("Bio"),
  email_address: joi.string().email().allow().label("Email address"),
  country_code: joi.string().allow().label("Country code"),
  mobile_number: joi.string().allow().label("Mobile number"),
  follower_name: joi.string().allow().label("Follower name"),
  token: joi.string().allow().label("Token"),
  is_linkdin_connect: joi.string().allow(),
  demographics: joi.string().allow(),
  social_media_link: joi.string().allow(),
  skills_details: joi.string().allow(),
  is_linkedin_complete: joi.string().allow(),
  is_profile_complete: joi.string().allow(),
  skills_delete_id: joi.string().allow(),
  skills_update: joi.string().allow()
});

const createReportDto = joi.object().keys({
  feedback: joi.string().required().label("Feedback"),
  feedback_photo: joi.string().allow().label("Feedback photo"),
});

const createSupportDto = joi.object().keys({
  title: joi.string().required().label("Title"),
  message: joi.string().required().label("Message"),
});

const accountVerificationsDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
  legal_name: joi.string().required().label("Legal name"),
  dob: joi.date().required().label("DOB"),
  country_name: joi.string().required().label("Country name"),
  profession: joi.string().required().label("Profession"),
  social_link: joi.string().required().label("Social link"),
  news_source_one: joi.string().required().label("News source one"),
  news_source_two: joi.string().required().label("News source two"),
  news_source_three: joi.string().required().label("News source three"),
});

const reporttoUserDto = joi.object().keys({
  report_user_id: joi.string().required().label("Report user id"),
  reason_report: joi.string().required().label("Reason report"),
});

const getverifiedUserDetailsDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
});

const getUserdetailsDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
  language: joi.string().allow().label("language")
});

const blockTouserDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
  block_user_id: joi.string().required().label("Block user id"),
});

const block_listDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
});

const notificationListDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
  filter_type: joi.string().allow().label("Filter type"),
  page: joi.string().allow().label("Page"),
  limit: joi.string().allow().label("Limit"),
});

const searchPageDto = joi.object().keys({
  search: joi.string().allow().label("Search"),
  page: joi.string().allow().label("Page"),
  limit: joi.string().allow().label("Limit"),
  language: joi.string().allow().label("language"),
});

const privateAccountDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
  private_status: joi.string().allow().label("Private status"),
});

const directMessageSettingDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
  social_platform_data: joi.string().allow().label("social platform data"),
});

const deleteVerificationRequestDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
});

const editUserInterestsDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
  interested: joi.string().required().label("Interested"),
});

const getUserInterestsDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
});

const searchGroupsDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
  search: joi.string().allow().label("search"),
  page: joi.string().allow().label("Page"),
  limit: joi.string().allow().label("Limit"),
});

const searchPostDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
  search: joi.string().allow().label("search"),
  page: joi.string().allow().label("Page"),
  limit: joi.string().allow().label("Limit"),
  language: joi.string().allow().label("language"),
});

const searchUserDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
  search: joi.string().allow().label("search"),
  page: joi.string().allow().label("Page"),
  limit: joi.string().allow().label("Limit"),
});

const addEduactionDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
  school: joi.alternatives().try(joi.string(), joi.allow(null, "")).label("school"),
  // degree: joi.string().allow().label("degree"),
  degree: joi.alternatives().try(joi.string(), joi.allow(null, "")).label("degree"),
  field_of_Study: joi.alternatives().try(joi.string(), joi.allow(null, "")).label("field_of_Study"),
  start_date: joi.alternatives().try(joi.string(), joi.allow(null, "")).label("start_date"),
  end_date: joi.alternatives().try(joi.string(), joi.allow(null, "")).label("end_date"),
  grade: joi.alternatives().try(joi.string(), joi.allow(null, "")).label("grade"),
  activities_and_societies: joi.alternatives().try(joi.string(), joi.allow(null, "")).label("activities_and_societies"),
  description: joi.alternatives().try(joi.string(), joi.allow(null, "")).label("description"),
});

const editEduactionDto = joi.object().keys({
  education_id: joi.string().required().label("education id"),
  user_id: joi.string().allow().label("User id"),
  school: joi.alternatives().try(joi.string(), joi.allow(null, "")).label("school"),
  // degree: joi.string().allow().label("degree"),
  degree: joi.alternatives().try(joi.string(), joi.allow(null, "")).label("degree"),
  field_of_Study: joi.alternatives().try(joi.string(), joi.allow(null, "")).label("field_of_Study"),
  start_date: joi.alternatives().try(joi.string(), joi.allow(null, "")).label("start_date"),
  end_date: joi.alternatives().try(joi.string(), joi.allow(null, "")).label("end_date"),
  grade: joi.alternatives().try(joi.string(), joi.allow(null, "")).label("grade"),
  activities_and_societies: joi.alternatives().try(joi.string(), joi.allow(null, "")).label("activities_and_societies"),
  description: joi.alternatives().try(joi.string(), joi.allow(null, "")).label("description"),
});

const deleteEduactionDto = joi.object().keys({
  education_id: joi.string().required().label("education id"),
  user_id: joi.string().allow().label("User id"),
});

const eduactionListDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
});


const addExperinceDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
  title: joi.alternatives().try(joi.string(), joi.allow(null, "")).label("title"),
  emp_type: joi.alternatives().try(joi.string(), joi.allow(null, "")).label("emp_type"),
  company_name: joi.alternatives().try(joi.string(), joi.allow(null, "")).label("company_name"),
  location: joi.alternatives().try(joi.string(), joi.allow(null, "")).label("location"),
  address: joi.alternatives().try(joi.string(), joi.allow(null, "")).label("address"),
  is_cuurrently_working: joi.alternatives().try(joi.string(), joi.allow(null, "")).label("is_cuurrently_working"),
  start_date: joi.alternatives().try(joi.string(), joi.allow(null, "")).label("start_date"),
  end_date: joi.alternatives().try(joi.string(), joi.allow(null, "")).label("end_date"),
  industry: joi.alternatives().try(joi.string(), joi.allow(null, "")).label("industry"),
  description: joi.alternatives().try(joi.string(), joi.allow(null, "")).label("description"),
  media: joi.alternatives().try(joi.string(), joi.allow(null, "")).label("media"),
  urls: joi.alternatives().try(joi.string(), joi.allow(null, "")).label("urls"),
});

const editExperinceDto = joi.object().keys({
  experince_id: joi.string().required().label("experince id"),
  user_id: joi.string().allow().label("User id"),
  title: joi.alternatives().try(joi.string(), joi.allow(null, "")).label("title"),
  emp_type: joi.alternatives().try(joi.string(), joi.allow(null, "")).label("emp_type"),
  company_name: joi.alternatives().try(joi.string(), joi.allow(null, "")).label("company_name"),
  location: joi.alternatives().try(joi.string(), joi.allow(null, "")).label("location"),
  address: joi.alternatives().try(joi.string(), joi.allow(null, "")).label("address"),
  is_cuurrently_working: joi.alternatives().try(joi.string(), joi.allow(null, "")).label("is_cuurrently_working"),
  start_date: joi.alternatives().try(joi.string(), joi.allow(null, "")).label("start_date"),
  end_date: joi.alternatives().try(joi.string(), joi.allow(null, "")).label("end_date"),
  industry: joi.alternatives().try(joi.string(), joi.allow(null, "")).label("industry"),
  description: joi.alternatives().try(joi.string(), joi.allow(null, "")).label("description"),
  media: joi.alternatives().try(joi.string(), joi.allow(null, "")).label("media"),
  urls: joi.alternatives().try(joi.string(), joi.allow(null, "")).label("urls"),
  delete_media_array: joi.alternatives().try(joi.string(), joi.allow(null, "")).label("delete_media_array")
});

const deleteExperinceDto = joi.object().keys({
  experince_id: joi.string().allow().label("experince id"),
  user_id: joi.string().allow().label("User id"),
});

const experinceListDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
});

const addCustomfieldDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
  title: joi.string().allow().label("title"),
  description: joi.string().allow().label("description"),
});

const editCustomfieldDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
  customfield_id: joi.string().required().label("customfield id"),
  title: joi.string().allow().label("title"),
  description: joi.string().allow().label("description"),
});

const deleteCustomfieldDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
  customfield_id: joi.string().required().label("customfield id"),
});

const customfieldListDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
});






module.exports = {
  userSignUpDto,
  userSigninDto,
  sendotpdto,
  verifyOtpDto,
  checkmailDto,
  resetPasswordDto,
  changePasswordDto,
  deactiveAccountDto,
  changeFollowernameDto,
  editProfileDto,
  createReportDto,
  createSupportDto,
  accountVerificationsDto,
  reporttoUserDto,
  getverifiedUserDetailsDto,
  getUserdetailsDto,
  blockTouserDto,
  block_listDto,
  notificationListDto,
  searchPageDto,
  privateAccountDto,
  directMessageSettingDto,
  deleteVerificationRequestDto,
  editUserInterestsDto,
  getUserInterestsDto,
  searchGroupsDto,
  searchPostDto,
  searchUserDto,
  addEduactionDto,
  editEduactionDto,
  deleteEduactionDto,
  eduactionListDto,
  addExperinceDto,
  editExperinceDto,
  deleteExperinceDto,
  experinceListDto,
  addCustomfieldDto,
  editCustomfieldDto,
  deleteCustomfieldDto,
  customfieldListDto
};