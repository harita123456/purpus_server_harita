const fs = require("fs");
const { errorRes } = require("./common_fun");

const removeFile = (data, res) => { // Add 'res' parameter
  try {
    if (Array.isArray(data)) {
      data.forEach((image) => {
        const filepath = "./uploads/" + image;
        fs.unlink(filepath, (error) => {
          if (error) {
            console.error(`Failed to delete file: ${filepath}`, error);
          } else {
            console.log(`Successfully deleted file: ${filepath}`);
          }
        });
      });
    } else {
      const filepath = "./uploads/" + data;
      fs.unlink(filepath, (error) => {
        if (error) {
          console.error(`Failed to delete file: ${filepath}`, error);
        } else {
          console.log(`Successfully deleted file: ${filepath}`);
        }
      });
    }
  } catch (error) {
    return errorRes(res, error.message);
  }
};

module.exports = { removeFile };
