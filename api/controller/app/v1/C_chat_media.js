const util = require("util");
const fs = require("fs");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffprobePath = require("@ffprobe-installer/ffprobe").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const {
  successRes,
  errorRes,
} = require("../../../../utils/common_fun");

const uploadeMedia = async (req, res) => {
  try {
    var { multimedia_files } = req.files;
    var check_image = util.isArray(multimedia_files);

    var inserData;
    if (check_image == false) {
      var multimedia_array = [];
      multimedia_array.push(multimedia_files);
    } else {
      var multimedia_array = multimedia_files;
    }

    if (multimedia_files) {
      var multiple_media_array = [];
      for (var value of multimedia_array) {
        let file_extension = value.originalFilename
          .split(".")
          .pop()
          .toLowerCase();

        var file_name =
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
          file_extension == "mkv"
        ) {
          let thumbnail_path = file_name.replace(/\.[^/.]+$/, ".jpeg");

          let file_data = {
            file_type: "video",
            video_name: `chat_media/${file_name}`,
            thumbnail: `chat_media/${thumbnail_path}`,
          };
          let old_path = value.path;
          let new_path = "public/chat_media/" + file_name;
          let new_path_thumb = "public/chat_media/" + thumbnail_path;

          await fs.promises.copyFile(old_path, new_path);

          ffmpeg(new_path)
            .screenshots({
              timestamps: ["50%"],
              filename: file_name.replace(/\.[^/.]+$/, ".jpeg"),
              folder: "public/chat_media",
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

          multiple_media_array.push(file_data);
        }
        inserData = {
          ...inserData,
          media_file: multiple_media_array,
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
            image_file: `chat_media/${file_name}`,
          };
          let old_path = value.path;
          let new_path = "public/chat_media/" + file_name;
          await fs.readFile(old_path, function (err, data) {
            if (err) throw err;
            fs.writeFile(new_path, data, function (err) {
              if (err) throw err;
            });
          });

          multiple_media_array.push(file_data);
        }
        inserData = {
          ...inserData,
          media_file: multiple_media_array,
        };

        if (
          file_extension == "mp3" ||
          file_extension == "mpeg" ||
          file_extension == "aac" ||
          file_extension == "avi" ||
          file_extension == "m4a"
        ) {
          let file_data = {
            file_type: "audio",
            audio_file: `chat_media/${file_name}`,
          };

          let old_path = value.path;
          let new_path = "public/chat_media/" + file_name;

          await fs.readFile(old_path, function (err, data) {
            if (err) throw err;
            fs.writeFile(new_path, data, function (err) {
              if (err) throw err;
            });
          });

          multiple_media_array.push(file_data);
        }
        inserData = {
          ...inserData,
          media_file: multiple_media_array,
        };
      }
    }

    if (inserData) {
      return successRes(res, "Your data is ineserted successfully", inserData);
    }
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

module.exports = {
  uploadeMedia,
};