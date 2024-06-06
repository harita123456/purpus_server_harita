const router = require("express").Router();
const multipart = require("connect-multiparty");
const multipartMiddleware = multipart();
const userAuth = require("../../../middlewares/auth");
const validateRequest = require("../../../middlewares/validation");
const { connectionListDto, connectionCountDto,
  connectionSuggestionDto,
  allInterestuserDto } = require("../../../dto/app/v1/connection_dto");

const {
  connectionList,
  connectionCount,
  connectionSuggestion,
  allInterestuser,
} = require("../../../api/controller/app/v1/C_connection");

router.post(
  "/connection_list",
  multipartMiddleware,
  userAuth,
  validateRequest(connectionListDto),
  connectionList
);
router.post(
  "/connection_count",
  multipartMiddleware,
  userAuth,
  validateRequest(connectionCountDto),
  connectionCount
);

router.post(
  "/connection_suggestion",
  multipartMiddleware,
  userAuth,
  validateRequest(connectionSuggestionDto),
  connectionSuggestion
);

router.post(
  "/all_interest_user",
  multipartMiddleware,
  userAuth, 
  validateRequest(allInterestuserDto),
  allInterestuser
);

module.exports = router;
