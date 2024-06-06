const joi = require("joi");

const createGroupDto = joi.object().keys({
  group_name: joi.string().required().label("Group name"),
  group_description: joi.string().required().label("Group description"),
  interest_id: joi.string().allow().label("Interest id"),
  sub_interest_id: joi.string().allow().label("Sub interest id"),
  is_private: joi.boolean().allow().label("Group status"),
  group_image: joi.string().allow().label("Group image"),
});

const editGroupDto = joi.object().keys({
  group_id: joi.string().required().label("Group id"),
  group_name: joi.string().allow().label("Group name"),
  group_description: joi.string().allow().label("Group description"),
  interest_id: joi.string().allow().label("Interest id"),
  sub_interest_id: joi.string().allow().label("Sub interest id"),
  is_private: joi.boolean().allow().label("Group status"),
  group_image: joi.string().allow().label("Group image"),
});

const groupDetailsDto = joi.object().keys({
  group_id: joi.string().required().label("Group id"),
});

const groupListDto = joi.object().keys({
  page: joi.string().allow(),
  limit: joi.string().allow(),
  other_user_id: joi.string().allow().label("Other user id"),
  group_type: joi
    .string()
    .valid("my_group", "discover")
    .allow()
    .label("Group type"),
  page: joi.string().allow().label("Page"),
  limit: joi.string().allow().label("Limit"),
});

const joinGroupDto = joi.object().keys({
  group_id: joi.string().required().label("Group id"),
});

const acceptDeclineJoinRequestDto = joi.object().keys({
  notification_id: joi.string().required().label("Notification id"),
  notification_status: joi.string().required().label("Group id"),
});

const requestToJoinGroupDto = joi.object().keys({
  group_id: joi.string().required().label("Group id"),
});

const leaveGroupDto = joi.object().keys({
  group_id: joi.string().required().label("Group id"),
});

const deleteGroupDto = joi.object().keys({
  group_id: joi.string().required().label("Group id"),
});

const membersListDto = joi.object().keys({
  search: joi.string().allow().label("search"),
  group_id: joi.string().allow().label("Group id"),
  page: joi.string().allow().label("Page"),
  limit: joi.string().allow().label("Limit"),
});

const inviteUserInGroupDto = joi.object().keys({
  group_id: joi.string().required().label("Group id"),
  user_ids: joi.string().required().label("User ids"),
});

const groupReportDto = joi.object().keys({
  user_id: joi.string().allow().label("user id"),
  reason_report: joi.string().required().label("Report reason"),
  group_id: joi.string().required().label("Group id"),
});

const userInGroupDto = joi.object().keys({
  user_id: joi.string().allow().label("user id"),
  group_id: joi.string().required().label("Group id"),
});

const shareUserlistDto = joi.object().keys({
  user_id: joi.string().allow().label("user id"),
  search: joi.string().allow().label("search"),
  page: joi.string().allow().label("Page"),
  limit: joi.string().allow().label("Limit"),
});

module.exports = {
  createGroupDto,
  editGroupDto,
  groupDetailsDto,
  groupListDto,
  joinGroupDto,
  requestToJoinGroupDto,
  acceptDeclineJoinRequestDto,
  leaveGroupDto,
  deleteGroupDto,
  membersListDto,
  inviteUserInGroupDto,
  groupReportDto,
  userInGroupDto,
  shareUserlistDto,
};
