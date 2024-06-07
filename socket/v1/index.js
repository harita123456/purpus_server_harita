const {
  createRoom,
  chatUserList,
  sendMessage,
  getAllMessage,
  deleteChat,
  deleteOneChat,
  unreadMessage,
  setSocketId,
  disconnectSocket,
  screenUserCheck,
  requesteList,
  requestAccept,
  deleteAllrequest,
  blockRequestUser,
  sharePost,
  checkMessage,
} = require("./chat");

const users = require("../../models/M_user");
const chat_room = require("../../models/M_chat_room");
const group_members = require("../../models/M_group_members");
const group = require("../../models/M_group");

const {
  chatGroupList,
  sendGroupMessage,
  getGroupAllMessage,
  addVote,
  unreadGroupMessage,
  addScreenStatus,
  pollsDetails
} = require("./group_chat");

module.exports = function (io) {
  var v1version = io.of("/v1");
  v1version.on("connection", (socket) => {
    console.log("Socket connected  v1.....", socket.id);

    socket.on("disconnect", async (data) => {
      try {
        var socket_data = socket.id;

        const user = await users.find({ socket_id: socket_data });

        console.log("user disconnect", user)

        var user_id = user[0]._id;
        await group_members.updateMany(
          { user_id: user_id, in_screen: true },
          {
            $set: {
              in_screen: false,
            },
          },
          { new: true }
        );

        var match_condition = {
          $or: [{ user_id: user_id }, { other_user_id: user_id }],
          is_deleted: false,
        };

        var findRoom = await chat_room
          .find(match_condition)
          .populate("user_id")
          .populate("other_user_id");

        findRoom?.map(async (data) => {
          if (user_id.equals(data?.other_user_id?._id)) {
            await chat_room.findByIdAndUpdate(
              {
                _id: data._id,
              },
              {
                $set: {
                  screen_otheruser_status: false,
                },
              },

              { new: true }
            );
          }

          if (user_id.equals(data?.user_id?._id)) {
            await chat_room.findByIdAndUpdate(
              {
                _id: data._id,
              },
              {
                $set: {
                  screen_user_status: false,
                },
              },

              { new: true }
            );
          }
        });

        const socketIds = [];
        function isSocketIdUnique(socketId) {
          return !socketIds.includes(socketId);
        }
        findRoom.forEach((item) => {
          if (
            item.user_id &&
            item.user_id.socket_id &&
            isSocketIdUnique(item.user_id.socket_id)
          ) {
            if (item.user_id.socket_id != null) {
              socketIds.push(item.user_id.socket_id);
            }
          }
          if (
            item.other_user_id &&
            item.other_user_id.socket_id != null &&
            isSocketIdUnique(item.other_user_id.socket_id != null)
          ) {
            if (item.other_user_id.socket_id != null) {
              socketIds.push(item.other_user_id.socket_id);
            }
          }
        });

        var check = {
          user_id: user_id,
          is_online: false,
        };
        socketIds.forEach((socket_id) => {
          socket.to(socket_id).emit("isOfflineStatus", check);
        });

        let socketcheckData = await disconnectSocket(socket_data);
        socket.emit("setSocketId", socketcheckData);
      } catch (error) {
        console.log("=== disconnect ===", error.message);
      }
    });

    /*  PAYLOAD --> 
      {
        "user_id":"63c8c46dedf1682155c610f2",
        "other_user_id":"63c8c46dedf1682155c610f2"
      } 
    */
    socket.on("createRoom", async (data) => {
      try {
        console.log(" -----------  v1 calling  -----------  ");
        console.log(" createRoom  on ::  ", data);
        var create_room = await createRoom(data);

        socket.join(create_room);

        v1version.to(create_room).emit("createRoom", create_room);

      } catch (error) {
        console.log("=== createRoom ===", error);
      }
    });

    /*  PAYLOAD --> 
      {
        "user_id":"63c8c46dedf1682155c610f2"  // user_id = login_user_id
      }
    */

    /*  PAYLOAD-- >
      {
        "chat_room_id": "63b32c21dedac0b126bb30fd",
        "sender_id": "64059b1e6b6e26e64c9df0c3",
        "receiver_id": "640aafb8a4d96f9c88e1e2a2",
        "message": "Hello",
        "message_type": "text"    
      }

      {
        "chat_room_id": "63b32c21dedac0b126bb30fd",
        "sender_id": "64059b1e6b6e26e64c9df0c3",
        "receiver_id": "640aafb8a4d96f9c88e1e2a2",
        "message": "",
        "message_type": "media",
        "image_file":[
            {
                "file_type": "image",
                "file_name": "chat_files/image_2845_1679984879527.jpg"
            },
            {
                "file_type": "video",
                "file_name": "chat_files/video_5577_1679984880988.mp4",
                "thumb_url": "chat_files/thumb_grb_2.png"
            }
        ]
      }
   */
    socket.on("sendMessage", async (data) => {
      console.log("sendMessage ==> ", data);
      socket.join(data.chat_room_id);

      let newMessage = await sendMessage(data);

      v1version.to(data.chat_room_id).emit("sendMessage", newMessage);

      let senderChatUserData = await chatUserList({ user_id: data.sender_id });

      let senderrequestUserData = await requesteList({
        user_id: data.sender_id,
      });

      let sender_socket_id = await users.findById(data.sender_id);

      socket
        .to(sender_socket_id?.socket_id)
        .emit("chatUserList", senderChatUserData);

      socket
        .to(sender_socket_id?.socket_id)
        .emit("requesteList", senderrequestUserData);
      let receiver_socket_id = await users.findById(data.receiver_id);
      let receiverChatUserData = await chatUserList({
        user_id: data.receiver_id,
      });

      let receiverrequestUserData = await requesteList({
        user_id: data.receiver_id,
      });
      socket
        .to(receiver_socket_id?.socket_id)
        .emit("chatUserList", receiverChatUserData);
      socket
        .to(receiver_socket_id?.socket_id)
        .emit("requesteList", receiverrequestUserData);
    });

    socket.on("requestAccept", async (data) => {
      console.log("sendMessage ==> ", data);
      socket.join(data.chat_room_id);

      let newMessage = await requestAccept(data);

      v1version.to(data.chat_room_id).emit("requestAccept", newMessage);

      let senderChatUserData = await chatUserList({ user_id: data.sender_id });

      let senderrequestUserData = await requesteList({
        user_id: data.sender_id,
      });

      socket
        .to(newMessage?.sender_socket_id)
        .emit("chatUserList", senderChatUserData);

      socket
        .to(newMessage?.sender_socket_id)
        .emit("requesteList", senderrequestUserData);

      let receiverChatUserData = await chatUserList({
        user_id: data.receiver_id,
      });

      let receiverrequestUserData = await requesteList({
        user_id: data.receiver_id,
      });
      socket
        .to(newMessage?.receiver_socket_id)
        .emit("chatUserList", receiverChatUserData);
      const receiverSocketId = newMessage.receiver_socket_id;
      socket
        .to(newMessage?.receiver_socket_id)
        .emit("requesteList", receiverrequestUserData);
    });

    socket.on("chatUserList", async (data) => {
      try {
        let chatUserData = await chatUserList(data);

        socket.emit("chatUserList", chatUserData);
      } catch (error) {
        console.log("=== chatUserList ===", error);
      }
    });

    socket.on("requesteList", async (data) => {
      try {
        let requestedUserData = await requesteList(data);

        socket.emit("requesteList", requestedUserData);
      } catch (error) {
        console.log("=== requesteList ===", error);
      }
    });

    socket.on("screenUserCheck", async (data) => {
      try {
        let chat_room_data = await screenUserCheck(data);

        socket.emit("screenUserCheck", chat_room_data);
      } catch (error) {
        console.log("=== screenUserCheck ===", error.message);
      }
    });

    /*  PAYLOAD --> 
      {
        "chat_room_id":"6410186be3474c54ffa81232",
        "user_id":"640aaa6298e44c6535bd8c93",    ==> login_user_id
        "page":"1",
        "limit":"10"
      }
    */
    socket.on("getAllMessage", async (data) => {
      try {
        socket.join(data.chat_room_id);

        let allMessageList = await getAllMessage(data);
        socket.emit("getAllMessage", allMessageList);
      } catch (error) {
        console.log("=== getAllMessage ===", error);
      }
    });

    /*  PAYLOAD-- >
      { 
        "user_id": "64059b1e6b6e26e64c9df0c3",  
      }
   */
    socket.on("setSocketId", async (data) => {
      try {
        console.log("socket.id++++++++working", socket.id);
        var socket_data = socket.id;
        data = {
          ...data,
          socket_data,
        };
        let setSocketData = await setSocketId(data);
        socket.emit("setSocketId", setSocketData);

        const user = await users.find({ socket_id: socket_data });

        if (user) {
          await users.findByIdAndUpdate(
            {
              _id: user[0]._id,
            },
            {
              $set: {
                is_online: true,

              },
            },

            { new: true }
          );
        }

        var user_id = user[0]._id;
        var match_condition = {
          $or: [{ user_id: user_id }, { other_user_id: user_id }],
          is_deleted: false,
        };

        var findRoom = await chat_room
          .find(match_condition)
          .populate("user_id")
          .populate("other_user_id");

        const socketIds = [];
        function isSocketIdUnique(socketId) {
          return !socketIds.includes(socketId);
        }
        findRoom.forEach((item) => {
          if (
            item.user_id &&
            item.user_id.socket_id &&
            isSocketIdUnique(item.user_id.socket_id)
          ) {
            if (item.user_id.socket_id != null) {
              socketIds.push(item.user_id.socket_id);
            }
          }
          if (
            item.other_user_id &&
            item.other_user_id.socket_id != null &&
            isSocketIdUnique(item.other_user_id.socket_id != null)
          ) {
            if (item.other_user_id.socket_id != null) {
              socketIds.push(item.other_user_id.socket_id);
            }
          }
        });

        var check = {
          user_id: user_id,
          is_online: true,
        };

        socketIds.forEach((socket_id) => {
          socket.to(socket_id).emit("isOfflineStatus", check);
        });
      } catch (error) {
        console.log("=== setSocketId ===", error.message);
      }
    });

    socket.on("unreadMessage", async (data) => {
      try {
        if (
          data.chat_room_id != undefined &&
          data.chat_room_id != null &&
          data.chat_room_id != ""
        ) {
          socket.join(data.chat_room_id);
          let updateMessage = await unreadMessage(data);

          v1version.to(data.chat_room_id).emit("unreadMessage", updateMessage);

          let user_data = await users.findById(data.user_id);

          let receiverChatUserData = await chatUserList({
            user_id: data.user_id,
          });

          let receiverrequestUserData = await requesteList({
            user_id: data.user_id,
          });
          socket
            .to(user_data?.socket_id)
            .emit("chatUserList", receiverChatUserData);
          socket
            .to(user_data?.socket_id)
            .emit("requesteList", receiverrequestUserData);
        }
      } catch (error) {
        console.log("=== unreadMessage ===", error.message);
      }
    });

    /*  PAYLOAD --> 
      {
        "chat_room_id":"63c8d2a5d101c9e9f4b71523",
        "user_id":"63c8c46dedf1682155c610f2"    ==> login_user_id
      }
    */
    socket.on("deleteChat", async (data) => {
      try {
        let deleteChatData = await deleteChat(data);
        socket.emit("deleteChat", deleteChatData);
        let sender_data = await users.findById(data.user_id);

        let senderrequestUserData = await requesteList({
          user_id: data.user_id,
        });
        let senderChatUserData = await chatUserList({ user_id: data.user_id });
        socket
          .to(sender_data?.socket_id)
          .emit("chatUserList", senderChatUserData);

        socket
          .to(sender_data?.socket_id)
          .emit("requesteList", senderrequestUserData);
      } catch (error) {
        console.log("=== deleteChat ===", error);
      }
    });

    /*  PAYLOAD --> 
      {
        "user_id":"63c8c46dedf1682155c610f2",    ==> login_user_id
        "chat_id":"63c8d2a5d101c9e9f4b71523"
      }
    */
    socket.on("deleteOneChat", async (data) => {
      try {
        let deleteOneChatData = await deleteOneChat(data);
        socket.emit("deleteOneChat", deleteOneChatData);
      } catch (error) {
        console.log("=== deleteOneChat ===", error);
      }
    });

    socket.on("requestAccept", async (data) => {
      socket.join(data.chat_room_id);

      let newMessage = await requestAccept(data);

      v1version.to(data.chat_room_id).emit("requestAccept", newMessage);

      let senderChatUserData = await chatUserList({ user_id: data.user_id });

      let senderrequestUserData = await requesteList({
        user_id: data.user_id,
      });

      socket
        .to(newMessage?.sender_socket_id)
        .emit("chatUserList", senderChatUserData);

      socket
        .to(newMessage?.sender_socket_id)
        .emit("requesteList", senderrequestUserData);

      let receiverChatUserData = await chatUserList({
        user_id: data.receiver_id,
      });

      let receiverrequestUserData = await requesteList({
        user_id: data.receiver_id,
      });
      socket
        .to(newMessage?.receiver_socket_id)
        .emit("chatUserList", receiverChatUserData);
      const receiverSocketId = newMessage.receiver_socket_id;
      socket
        .to(newMessage?.receiver_socket_id)
        .emit("requesteList", receiverrequestUserData);
    });

    socket.on("deleteAllrequest", async (data) => {
      try {
        let deleteChatData = await deleteAllrequest(data);
        socket.emit("deleteAllrequest", deleteChatData);
        let sender_data = await users.findById(data.user_id);

        let senderrequestUserData = await requesteList({
          user_id: data.user_id,
        });
        let senderChatUserData = await chatUserList({ user_id: data.user_id });
        socket
          .to(sender_data?.socket_id)
          .emit("chatUserList", senderChatUserData);

        socket
          .to(sender_data?.socket_id)
          .emit("requesteList", senderrequestUserData);
      } catch (error) {
        console.log("=== deleteAllrequest ===", error);
      }
    });

    socket.on("blockRequestUser", async (data) => {
      try {
        socket.join(data.chat_room_id);

        let blockRequestUserdata = await blockRequestUser(data);
        socket.emit("blockRequestUser", blockRequestUserdata);
        let sender_data = await users.findById(data.user_id);

        let senderrequestUserData = await requesteList({
          user_id: data.user_id,
        });
        let senderChatUserData = await chatUserList({ user_id: data.user_id });
        socket
          .to(sender_data?.socket_id)
          .emit("chatUserList", senderChatUserData);

        socket
          .to(sender_data?.socket_id)
          .emit("requesteList", senderrequestUserData);

        let receiver_data = await users.findById(data.block_user_id);

        let receiverChatUserData = await chatUserList({
          user_id: data.block_user_id,
        });

        let receiverrequestUserData = await requesteList({
          user_id: data.block_user_id,
        });
        socket
          .to(receiver_data?.socket_id)
          .emit("chatUserList", receiverChatUserData);
        socket
          .to(receiver_data?.socket_id)
          .emit("requesteList", receiverrequestUserData);
      } catch (error) {
        console.log("=== blockRequestUser ===", error);
      }
    });

    socket.on("sharepost", async (data) => {
      try {
        let sharepostdata = await sharePost(data, socket);

        socket.emit("sharepost", sharepostdata);

        data.receiver_ids.map(async (receiver_id) => {
          let receiver_socket_id = await users.findById(receiver_id);

          let receiverChatUserData = await chatUserList({
            user_id: receiver_id,
          });
          let receiverrequestUserData = await requesteList({
            user_id: receiver_id,
          });

          socket
            .to(receiver_socket_id?.socket_id)
            .emit("chatUserList", receiverChatUserData);

          socket
            .to(receiver_socket_id?.socket_id)
            .emit("requesteList", receiverrequestUserData);
        });
      } catch (error) {
        console.log("=== sharepost ===", error);
      }
    });

    /*  PAYLOAD --> 
      {
        "chat_room_id":"63c8d2a5d101c9e9f4b71523",
        "user_id":"63c8c46dedf1682155c610f2"    ==> login_user_id
      }
    */

    // =================================    GROUP MESSAGES   ++++++++++++++++++++++++++++++++++++
    /*  PAYLOAD --> 
      {
        "user_id":"657860e4eeec78f9f11b0e42"  // user_id = login_user_id
      }
    */
    socket.on("chatGroupList", async (data) => {
      try {
        let chatUserData = await chatGroupList(data);

        socket.emit("chatGroupList", chatUserData);
      } catch (error) {
        console.log("=== chatGroupList ===", error);
      }
    });

    /*  PAYLOAD-- >
      {
        "chat_room_id": "63b32c21dedac0b126bb30fd",
        "sender_id": "64059b1e6b6e26e64c9df0c3",
        "receiver_id": "640aafb8a4d96f9c88e1e2a2",
        "message": "Hello",
        "message_type": "text"    
      }
   */
    socket.on("sendGroupMessage", async (data) => {
      socket.join(data.group_id);

      let newMessage = await sendGroupMessage(data);

      v1version.to(data.group_id).emit("sendGroupMessage", newMessage);

      var find_group = await group_members.find({
        group_id: data.group_id,
        is_deleted: false,
      });

      find_group.map(async (user_id_data) => {
        let user_data = await users.findById(user_id_data?.user_id);

        let senderChatUserData = await chatGroupList({
          user_id: user_data._id,
        });
        if (user_data != null) {
          socket
            .to(user_data?.socket_id)
            .emit("chatGroupList", senderChatUserData);
        }
      });

    });

    /*  PAYLOAD --> 
      {
        "group_id":"658bbf75fcf698a935a1e374",
        "user_id":"658bbedf35db9fa93654c138"
      }
    */
    socket.on("getGroupAllMessage", async (data) => {
      try {
        socket.join(data.group_id);

        let chatUserData = await getGroupAllMessage(data);

        if (chatUserData == null) {
          v1version.emit("getGroupAllMessage", "Group not found");
        } else {
          socket.emit("getGroupAllMessage", chatUserData);
        }
      } catch (error) {
        console.log("=== getGroupAllMessage ===", error);
      }
    });

    /*  PAYLOAD for poll vote --> 
      {
        "group_id":"658bbf75fcf698a935a1e374",
        "user_id":"658bbedf35db9fa93654c138"
      }
    */
    socket.on("addVote", async (data) => {
      try {
        socket.join(data.group_id);

        let chatUserData = await addVote(data);

        if (chatUserData == null) {
          v1version.emit("addVote", "Group not found");
        } else {
          v1version.to(data.group_id).emit("addVote", chatUserData);

          var find_group_member = await group_members.find({
            group_id: data.group_id,
            is_deleted: false
          });
          find_group_member?.map(async (value) => {
            let user_data = await users.findById(value.user_id).where({ is_deleted: false });

            var info = [];
            info.push(data?.group_chat_id)
            let senderData = await pollsDetails({
              user_id: user_data._id,
              poll_ids: info
            });
            socket
              .to(user_data?.socket_id)
              .emit("pollsDetails", senderData);
          })
        }
      } catch (error) {
        console.log("=== addVote ===", error);
      }
    });

    /*  PAYLOAD for unresd group message --> 
      {
        "group_chat_id":"658bbf75fcf698a935a1e374",
        "user_id":"658bbedf35db9fa93654c138"
      }
    */
    socket.on("unreadGroupMessage", async (data) => {
      try {
        let chatUserData = await unreadGroupMessage(data);

        if (chatUserData == null) {
          socket.emit("unreadGroupMessage", "Group message not found");
        } else {
          socket.emit("unreadGroupMessage", chatUserData);

          let user_data = await users.findById(data.user_id);
          let senderChatUserData = await chatGroupList({
            user_id: user_data._id,
          });

          socket
            .to(user_data?.socket_id)
            .emit("chatGroupList", senderChatUserData);
        }
      } catch (error) {
        console.log("=== unreadGroupMessage ===", error);
      }
    });

    socket.on("addScreenStatus", async (data) => {
      try {
        let chatUserData = await addScreenStatus(data);

        if (chatUserData == null) {
          socket.emit("addScreenStatus", "Group message not found");
        } else {
          socket.emit("addScreenStatus", chatUserData);
        }
      } catch (error) {
        console.log("=== addScreenStatus ===", error);
      }
    });
    socket.on("checkMessage", async (data) => {
      try {
        let chatUserData = await checkMessage(data);

        socket.emit("checkMessage", chatUserData);
      } catch (error) {
        console.log("=== checkMessage ===", error);
      }
    });

    socket.on("pollsDetails", async (data) => {
      try {
        let pollvotedetails = await pollsDetails(data);

        socket.emit("pollsDetails", pollvotedetails);
      } catch (error) {
        console.log("=== pollsDetails ===", error);
      }
    });

  });
};
