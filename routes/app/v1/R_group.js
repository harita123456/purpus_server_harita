const router = require("express").Router();
const multipart = require("connect-multiparty");
const multipartMiddleware = multipart();
const userAuth = require("../../../middlewares/auth");
const validateRequest = require("../../../middlewares/validation");

const {
  createGroup,
  editGroup,
  groupDetails,
  groupList,
  joinGroup,
  requestToJoinGroup,
  leaveGroup,
  acceptDeclineJoinRequest,
  deleteGroup,
  inviteUserInGroup,
  membersList,
  groupReport,
  userInGroup,
  shareUserlist,
  groupListcheck
} = require("../../../api/controller/app/v1/C_group");

const {
  createGroupDto,
  editGroupDto,
  groupDetailsDto,
  groupListDto,
  joinGroupDto,
  requestToJoinGroupDto,
  leaveGroupDto,
  acceptDeclineJoinRequestDto,
  deleteGroupDto,
  membersListDto,
  inviteUserInGroupDto,
  groupReportDto,
  userInGroupDto,
  shareUserlistDto,
} = require("../../../dto/app/v1/group_dto");

router.post(
  "/create_group",
  userAuth,
  multipartMiddleware,
  validateRequest(createGroupDto),
  createGroup
);

router.post(
  "/edit_group",
  userAuth,
  multipartMiddleware,
  validateRequest(editGroupDto),
  editGroup
);

router.post(
  "/group_details",
  userAuth,
  multipartMiddleware,
  validateRequest(groupDetailsDto),
  groupDetails
);

router.post(
  "/group_list",
  userAuth,
  multipartMiddleware,
  validateRequest(groupListDto),
  groupList
);

router.post(
  "/join_group",
  userAuth,
  multipartMiddleware,
  validateRequest(joinGroupDto),
  joinGroup
);

router.post(
  "/request_join_group",
  userAuth,
  multipartMiddleware,
  validateRequest(requestToJoinGroupDto),
  requestToJoinGroup
);

router.post(
  "/accept_decline_request",
  userAuth,
  multipartMiddleware,
  validateRequest(acceptDeclineJoinRequestDto),
  acceptDeclineJoinRequest
);

router.post(
  "/leave_group",
  userAuth,
  multipartMiddleware,
  validateRequest(leaveGroupDto),
  leaveGroup
);

router.post(
  "/delete_group",
  userAuth,
  multipartMiddleware,
  validateRequest(deleteGroupDto),
  deleteGroup
);

router.post(
  "/member_list",
  userAuth,
  multipartMiddleware,
  validateRequest(membersListDto),
  membersList
);

router.post(
  "/invite_members",
  userAuth,
  multipartMiddleware,
  validateRequest(inviteUserInGroupDto),
  inviteUserInGroup
);

router.post("/group_report", userAuth, multipartMiddleware, validateRequest(groupReportDto), groupReport);
router.post("/user_group_status", multipartMiddleware, validateRequest(userInGroupDto), userInGroup);
router.post("/share_user_list", userAuth, multipartMiddleware, validateRequest(shareUserlistDto), shareUserlist);

router.post("/group_list_check", userAuth, multipartMiddleware, groupListcheck);

module.exports = router;
