const router = require("express").Router();
const multipart = require("connect-multiparty");
const multipartMiddleware = multipart();

const { uploadeMedia } = require("../../../api/controller/app/v1/C_chat_media");
router.post("/uplode_media", multipartMiddleware, uploadeMedia);

module.exports = router;
