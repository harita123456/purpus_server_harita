const router = require("express").Router();
const multipart = require("connect-multiparty");
const multipartMiddleware = multipart();
const userAuth = require("../../../middlewares/auth");
const validateRequest = require("../../../middlewares/validation");

const {
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
  healthCheck,
  mysqlscript
} = require("../../../api/controller/app/v1/C_user");

const {
  userSignUpDto,
  userSigninDto,
  sendotpdto,
  verifyOtpDto,
  resetPasswordDto,
  checkmailDto,
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
  customfieldListDto,
} = require("../../../dto/app/v1/user_dto");

// this api is for heath check for docker
router.get("/health_check", multipartMiddleware, healthCheck);

router.post(
  "/sign_up",
  multipartMiddleware,
  validateRequest(userSignUpDto),
  signup
);

router.post(
  "/sign_in",
  multipartMiddleware,
  validateRequest(userSigninDto),
  signIn
);

router.post(
  "/send_otp",
  multipartMiddleware,
  validateRequest(sendotpdto),
  sendOTP
);

router.post(
  "/verify_otp",
  multipartMiddleware,
  validateRequest(verifyOtpDto),
  verifyOtp
);

router.post(
  "/reset_password",
  multipartMiddleware,
  validateRequest(resetPasswordDto),
  resetPassword
);

router.post(
  "/check_mail",
  multipartMiddleware,
  // validateRequest(checkmailDto),
  checkEmail
);

router.post(
  "/change_password",
  multipartMiddleware,
  userAuth,
  validateRequest(changePasswordDto),
  changePassword
);

router.post(
  "/deactive_account",
  multipartMiddleware,
  userAuth,
  validateRequest(deactiveAccountDto),
  deactiveAccount
);

router.post("/logout", multipartMiddleware, userAuth, logout);
router.post("/getsub_interest", multipartMiddleware, getsubInterest);

router.post(
  "/change_followers",
  multipartMiddleware,
  userAuth,
  validateRequest(changeFollowernameDto),
  changeFollowername
);

router.post("/self_delete", multipartMiddleware, userAuth, selfDelete);

router.post(
  "/edit_profile",
  multipartMiddleware,
  userAuth,
  validateRequest(editProfileDto),
  editProfile
);

router.post(
  "/create_report_problem",
  multipartMiddleware,
  userAuth,
  validateRequest(createReportDto),
  createReportforproblem
);

router.post(
  "/create_support",
  multipartMiddleware,
  userAuth,
  validateRequest(createSupportDto),
  createSupport
);

router.post(
  "/account_verification",
  multipartMiddleware,
  userAuth,
  validateRequest(accountVerificationsDto),
  accountVerifications
);

router.post(
  "/get_user_details",
  multipartMiddleware,
  userAuth,
  validateRequest(getUserdetailsDto),
  getUserdetails
);

router.post(
  "/getverified_details",
  multipartMiddleware,
  userAuth,
  validateRequest(getverifiedUserDetailsDto),
  getverifiedUserDetails
);

router.post(
  "/report_user",
  multipartMiddleware,
  userAuth,
  validateRequest(reporttoUserDto),
  reporttoUser
);

router.post(
  "/block_user",
  multipartMiddleware,
  userAuth,
  validateRequest(blockTouserDto),
  blockTouser
);

router.post(
  "/block_user_list",
  multipartMiddleware,
  userAuth,
  validateRequest(block_listDto),
  block_list
);

router.post(
  "/notification_list",
  multipartMiddleware,
  userAuth,
  validateRequest(notificationListDto),
  notificationList
);

router.post(
  "/search_page",
  multipartMiddleware,
  userAuth,
  validateRequest(searchPageDto),
  searchPage
);

router.post(
  "/private_account",
  multipartMiddleware,
  userAuth,
  validateRequest(privateAccountDto),
  privateAccount
);

router.post("/faq_list", multipartMiddleware, userAuth, faqList);
router.post(
  "/search_user",
  multipartMiddleware,
  userAuth,
  validateRequest(searchUserDto),
  searchUser
);
router.post(
  "/search_post",
  multipartMiddleware,
  userAuth,
  validateRequest(searchPostDto),
  searchPost
);
router.post(
  "/search_groups",
  multipartMiddleware,
  userAuth,
  validateRequest(searchGroupsDto),
  searchGroups
);

router.post(
  "/get_user_interests",
  multipartMiddleware,
  userAuth,
  validateRequest(getUserInterestsDto),
  getUserInterests
);

router.post(
  "/edit_user_interests",
  multipartMiddleware,
  userAuth,
  validateRequest(editUserInterestsDto),
  editUserInterests
);

router.post("/privacy_policy", multipartMiddleware, privacyPolicy);

router.post("/terms_and_conditions", multipartMiddleware, termsandConditions);

router.post(
  "/direct_message_setting",
  multipartMiddleware,
  userAuth,
  validateRequest(directMessageSettingDto),
  directMessageSetting
);

router.post(
  "/delete_verification_request",
  multipartMiddleware,
  userAuth,
  validateRequest(deleteVerificationRequestDto),
  deleteVerificationRequest
);

router.post("/test_signup", multipartMiddleware, testsignup);

router.post("/title_descripti", multipartMiddleware, title_descriptions);

router.post("/change_token", multipartMiddleware, changeToken);
router.post("/about", multipartMiddleware, about);

router.post("/get_user_info", multipartMiddleware, userAuth, getUserinfo);
router.post("/uplode_linkedin_media", multipartMiddleware, uplodelinkedinMedia);

router.post(
  "/add_eduaction",
  multipartMiddleware,
  userAuth,
  validateRequest(addEduactionDto),
  addEduaction
);
router.post(
  "/edit_eduaction",
  multipartMiddleware,
  userAuth,
  validateRequest(editEduactionDto),
  editEduaction
);
router.post(
  "/delete_eduaction",
  multipartMiddleware,
  userAuth,
  validateRequest(deleteEduactionDto),
  deleteEduaction
);
router.post(
  "/eduaction_list",
  multipartMiddleware,
  userAuth,
  validateRequest(eduactionListDto),
  eduactionList
);

router.post(
  "/add_customefield",
  multipartMiddleware,
  userAuth,
  validateRequest(addCustomfieldDto),
  addCustomfield
);
router.post(
  "/edit_customefield",
  multipartMiddleware,
  userAuth,
  validateRequest(editCustomfieldDto),
  editCustomfield
);
router.post(
  "/delete_customefield",
  multipartMiddleware,
  userAuth,
  validateRequest(deleteCustomfieldDto),
  deleteCustomfield
);
router.post(
  "/customefield_list",
  multipartMiddleware,
  userAuth,
  validateRequest(customfieldListDto),
  customfieldList
);
router.post(
  "/add_experience",
  multipartMiddleware,
  userAuth,
  validateRequest(addExperinceDto),
  addExperience
);
router.post(
  "/edit_experience",
  multipartMiddleware,
  userAuth,
  validateRequest(editExperinceDto),
  editExperince
);
router.post(
  "/delete_experience",
  multipartMiddleware,
  userAuth,
  validateRequest(deleteExperinceDto),
  deleteExperince
);
router.post(
  "/experience_list",
  multipartMiddleware,
  userAuth,
  validateRequest(experinceListDto),
  experinceList
);
router.post(
  "/linkedin_personalinfo",
  multipartMiddleware,
  userAuth,
  linkedinpersonalInfo
);

router.post(
  "/getsub_Interest_testing",
  multipartMiddleware,
  getsubInteresttesting
);

router.post("/mysql_script", multipartMiddleware, mysqlscript);

module.exports = router;
