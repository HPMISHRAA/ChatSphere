import Chat from '../models/chatModel.js';
import user from '../models/userModel.js';
import Message from '../models/messageModel.js';

export const accessChats = async (req, res) => {
  const { userId } = req.body;
  if (!userId) res.send({ message: "Provide User's Id" });
  let chatExists = await Chat.find({
    isGroup: false,
    $and: [
      { users: { $elemMatch: { $eq: userId } } },
      { users: { $elemMatch: { $eq: req.rootUserId } } },
    ],
  })
    .populate('users', '-password')
    .populate('latestMessage');
  chatExists = await user.populate(chatExists, {
    path: 'latestMessage.sender',
    select: 'name email profilePic',
  });
  if (chatExists.length > 0) {
    res.status(200).send(chatExists[0]);
  } else {
    let data = {
      chatName: 'sender',
      users: [userId, req.rootUserId],
      isGroup: false,
    };
    try {
      const newChat = await Chat.create(data);
      const chat = await Chat.find({ _id: newChat._id }).populate(
        'users',
        '-password'
      );
      res.status(200).json(chat);
    } catch (error) {
      res.status(500).send(error);
    }
  }
};
export const fetchAllChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      users: { $elemMatch: { $eq: req.rootUserId } },
    })
      .populate('users')
      .populate('latestMessage')
      .populate('groupAdmin')
      .sort({ updatedAt: -1 });
    const finalChats = await user.populate(chats, {
      path: 'latestMessage.sender',
      select: 'name email profilePic',
    });
    res.status(200).json(finalChats);
  } catch (error) {
    res.status(500).send(error);
    console.log(error);
  }
};
export const creatGroup = async (req, res) => {
  const { chatName, users } = req.body;
  if (!chatName || !users) {
    return res.status(400).json({ message: 'Please fill the fields' });
  }
  const parsedUsers = JSON.parse(users);
  if (parsedUsers.length < 1)
    return res.status(400).send('Group should contain at least 1 other user');
  parsedUsers.push(req.rootUser);
  try {
    const chat = await Chat.create({
      chatName: chatName,
      users: parsedUsers,
      isGroup: true,
      groupAdmin: req.rootUserId,
    });
    const createdChat = await Chat.findOne({ _id: chat._id })
      .populate('users', '-password')
      .populate('groupAdmin', '-password');
    // res.status(200).json(createdChat);
    res.send(createdChat);
  } catch (error) {
    res.sendStatus(500);
  }
};
export const renameGroup = async (req, res) => {
  const { chatId, chatName } = req.body;
  if (!chatId || !chatName)
    res.status(400).send('Provide Chat id and Chat name');
  try {
    const chat = await Chat.findByIdAndUpdate(chatId, {
      $set: { chatName },
    })
      .populate('users', '-password')
      .populate('groupAdmin', '-password');
    if (!chat) res.status(404);
    res.status(200).send(chat);
  } catch (error) {
    res.status(500).send(error);
    console.log(error);
  }
};
export const addToGroup = async (req, res) => {
  const { userId, chatId } = req.body;
  const existing = await Chat.findOne({ _id: chatId });
  if (!existing.users.includes(userId)) {
    const chat = await Chat.findByIdAndUpdate(chatId, {
      $push: { users: userId },
    })
      .populate('groupAdmin', '-password')
      .populate('users', '-password');
      
    if (!chat) return res.status(404).send('Chat not found');

    const addedUser = await user.findById(userId);
    const sysMsg = await Message.create({
      sender: req.rootUserId,
      message: `${addedUser.name} joined the room`,
      chatId: chatId,
      isSystemMessage: true
    });
    
    await Chat.findByIdAndUpdate(chatId, { latestMessage: sysMsg });

    // Emit group updated event to the room
    const io = req.app.get('socketio');
    if (io) {
      io.in(chatId.toString()).emit('group updated');
    }

    res.status(200).send(chat);
  } else {
    res.status(409).send('user already exists');
  }
};
export const removeFromGroup = async (req, res) => {
  const { userId, chatId } = req.body;
  const existing = await Chat.findOne({ _id: chatId });
  if (existing.users.includes(userId)) {
    Chat.findByIdAndUpdate(chatId, {
      $pull: { users: userId },
    })
      .populate('groupAdmin', '-password')
      .populate('users', '-password')
      .then(async (chat) => {
        const removedUser = await user.findById(userId);
        const sysMsg = await Message.create({
          sender: req.rootUserId,
          message: `${removedUser.name} left the room`,
          chatId: chatId,
          isSystemMessage: true
        });
        await Chat.findByIdAndUpdate(chatId, { latestMessage: sysMsg });
        
        // Emit group updated event to the room
        const io = req.app.get('socketio');
        if (io) {
          io.in(chatId.toString()).emit('group updated');
        }

        res.status(200).send(chat);
      })
      .catch((e) => res.status(404).send(e));
  } else {
    res.status(409).send('user doesnt exists');
  }
};
export const removeContact = async (req, res) => {};
