const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const axios = require("axios");
const User = require("../models/user");
const { jwtSecret, mediaPort } = require("../config/vars");
const {
  sendVerificationEmail,
  sendResetPasswordEmail,
} = require("../helpers/email");
const { validPassword } = require("../helpers/validate");

const getUsers = async (req, res) => {
  try {
    let { username, email, page } = req.query;
    if (!page) page = 1;

    // response limit
    const LIMIT = 100;
    // Get the starting index of every page
    const startIndex = (Number(page) - 1) * LIMIT;
    let searchQuery = {};
    let usernameRegex = null;
    let emailRegex = null;

    // make case insensitive regular expression for searching
    if (username) usernameRegex = new RegExp(username, "i");
    if (email) emailRegex = new RegExp(email, "i");

    if (username && email) {
      // search by both username and email
      searchQuery.$or = [{ username: usernameRegex }, { email: emailRegex }];
    } else if (username) {
      // search by username only
      searchQuery.username = usernameRegex;
    } else if (email) {
      // search by email only
      searchQuery.email = emailRegex;
    }

    // count total number of users for the search query
    totalUsers = await User.countDocuments(searchQuery);
    let users = null;

    // if query is not provided, fetch all users sorted by username
    if (Object.keys(searchQuery).length == 0)
      users = await User.find()
        .sort({ username: 1 })
        .limit(LIMIT)
        .skip(startIndex);
    // else fetch users as per query
    else users = await User.find(searchQuery).limit(LIMIT).skip(startIndex);

    // send only username and email
    users = users.map(({ username, email }) => ({ username, email }));

    res.status(200).json({
      success: true,
      data: users,
      currentPage: Number(page),
      numberOfPages: Math.ceil(totalUsers / LIMIT),
    });
  } catch (error) {
    res
      .status(404)
      .json({ success: false, message: "Something Went Wrong..." });
  }
};

const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // check if user with given username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(400).json({
        success: false,
        message:
          "User already exists with that username. Please login or choose a different username",
      });

    // check if user with given email already exists and the email is verified
    const existingVerifiedUser = await User.findOne({
      $and: [{ email }, { email_verified: true }],
    });

    if (existingVerifiedUser)
      return res.status(400).json({
        success: false,
        message:
          "User already exists with that email. Please login or choose a different email",
      });

    // validate password
    if (!validPassword(password))
      return res.status(400).json({
        success: false,
        message: "Password must contain at least one letter and one number",
      });

    // hash the password
    const hash = await bcrypt.hash(password, 12);

    // create user with given details
    const newUser = await User.create({
      username,
      email,
      hash,
    });

    // send verification email
    sendVerificationEmail(newUser._id, email);

    res.status(201).json({
      success: true,
      message:
        "New user created and verification mail is sent. Please verify your email to login",
      user: newUser,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Something Went Wrong..." });
  }
};

const getUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const authUserId = req.userId;

    // fetch the user data
    const userData = await User.findById(userId);

    // if user is requesting his own data
    if (userId === authUserId)
      res.status(200).json({
        success: true,
        message: "Self data access successful",
        user: userData,
      });
    // user requesting someone else's data
    else
      res.status(200).json({
        success: true,
        message: "User data access successful",
        user: { username: userData.username },
      });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Something Went Wrong..." });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const authUserId = req.userId;
    const { name, username } = req.body;

    // if user is requesting someone else's update
    if (userId !== authUserId)
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User can only update its own data",
      });

    // fetch the user data
    let newUserData = await User.findById(userId).select("+hash");
    // add new/updated data
    if (name) newUserData.name = name;

    // if new username is provided, check if it's unique
    if (username) {
      // check if user with given username already exists
      const existingUser = await User.findOne({ username });
      if (existingUser)
        return res.status(400).json({
          success: false,
          message:
            "User already exists with that username. Please choose a different username",
        });

      // else set the new username
      newUserData.username = username;
    }

    // update the user data
    const userData = await User.findByIdAndUpdate(userId, newUserData, {
      new: true,
    });

    res.status(200).json({
      success: true,
      message: "User data updated successfully",
      user: userData,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Something Went Wrong..." });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const token = req.params.token;
    // decode the token to get userId
    const decodedData = jwt.verify(token, jwtSecret);
    // if id from token does not match
    if (!decodedData?.id)
      return res.status(400).json({ success: false, message: "Invalid Token" });

    const existingUser = await User.findById(decodedData.id);
    // if no user exists with given id
    if (!existingUser)
      return res.status(400).json({ success: false, message: "Invalid Token" });
    else if (existingUser.email_verified)
      // if email is already verified
      return res
        .status(400)
        .json({ success: false, message: "Email already verified" });

    // update the email_verified to true
    await User.findByIdAndUpdate(decodedData.id, { email_verified: true });

    res
      .status(200)
      .json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Something Went Wrong..." });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { username } = req.body;

    // check if user with given username exists
    const existingUser = await User.findOne({ username });
    if (!existingUser)
      return res.status(404).json({
        success: false,
        message: "No user exists with that username.",
      });

    // send the email
    sendResetPasswordEmail(existingUser._id, existingUser.email);

    res
      .status(200)
      .json({ success: true, message: "Reset password email has been sent." });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Something Went Wrong..." });
  }
};

const updatePassword = async (req, res) => {
  try {
    const token = req.params.token;
    const newPassword = req.body.password;

    // decode the token to get userId
    const decodedData = jwt.verify(token, jwtSecret);
    // if id from token does not match
    if (!decodedData?.id)
      return res.status(400).json({ success: false, message: "Invalid Token" });

    const existingUser = await User.findById(decodedData.id);
    // if no user exists with given id
    if (!existingUser)
      return res.status(400).json({ success: false, message: "Invalid Token" });

    // validate new password
    if (!validPassword(newPassword))
      return res.status(400).json({
        success: false,
        message: "Password must contain at least one letter and one number",
      });

    // hash new password
    const hash = await bcrypt.hash(newPassword, 12);

    // update password
    await User.findByIdAndUpdate(decodedData.id, { hash });

    res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Something Went Wrong..." });
  }
};

const getFriends = async (req, res) => {
  try {
    const page = req.query.page ? req.query.page : 1;
    const limit = req.query.perPage ? req.query.perPage : 20;
    const skip = limit * (page - 1);
    const user = await User.findById(req.userId)
      .populate({
        path: "friends",
        model: User,
        select: "name username email profilePic college city",
      })
      .slice("friends", [skip, limit]);

    res.status(200).json({
      success: true,
      message: "Friends list access successful",
      data: user.friends,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Something Went Wrong..." });
  }
};

const getFriendRequests = async (req, res) => {
  try {
    const page = req.query.page ? req.query.page : 1;
    const limit = req.query.perPage ? req.query.perPage : 20;
    const skip = limit * (page - 1);
    const user = await User.findById(req.userId)
      .populate({
        path: "friendRequests",
        model: User,
        select: "name username email profilePic college city",
      })
      .slice("friendRequests", [skip, limit]);

    res.status(200).json({
      success: true,
      message: "Friend requests list access successful",
      data: user.friendRequests,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Something Went Wrong..." });
  }
};

const getFriendRequestsSent = async (req, res) => {
  try {
    const page = req.query.page ? req.query.page : 1;
    const limit = req.query.perPage ? req.query.perPage : 20;
    const skip = limit * (page - 1);
    const user = await User.findById(req.userId)
      .populate({
        path: "friendRequestsSent",
        model: User,
        select: "name username email profilePic college city",
      })
      .slice("friendRequestsSent", [skip, limit]);

    res.status(200).json({
      success: true,
      message: "Friend requests sent list access successful",
      data: user.friendRequestsSent,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Something Went Wrong..." });
  }
};

const getBlockedUsers = async (req, res) => {
  try {
    const page = req.query.page ? req.query.page : 1;
    const limit = req.query.perPage ? req.query.perPage : 20;
    const skip = limit * (page - 1);
    const user = await User.findById(req.userId)
      .populate({
        path: "blockedUsers",
        model: User,
        select: "name username email profilePic college city",
      })
      .slice("blockedUsers", [skip, limit]);

    res.status(200).json({
      success: true,
      message: "Blocked users list access successful",
      data: user.blockedUsers,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Something Went Wrong..." });
  }
};

const sendFriendRequest = async (req, res) => {
  try {
    const friendId = req.params.friendId;
    const userId = req.userId;

    let friend = await User.findById(friendId);
    // check if friendId is valid
    if (!friend || !friend.email_verified)
      return res
        .status(404)
        .json({ success: false, message: "Invalid User id" });

    let user = await User.findById(userId);
    // check if that user is a friend already
    if (user.friends.includes(mongoose.Types.ObjectId(friendId)))
      return res
        .status(400)
        .json({ success: false, message: "User is already a friend" });

    // check if the user is not blocked
    if (
      user.blockedUsers.includes(mongoose.Types.ObjectId(friendId)) ||
      friend.blockedUsers.includes(mongoose.Types.ObjectId(userId))
    )
      return res.status(400).json({
        success: false,
        message: "Blocked user. Cannot send friend request",
      });

    // check if the friendId is already present in pending requests
    if (user.friendRequests.includes(mongoose.Types.ObjectId(friendId)))
      return res
        .status(400)
        .json({ success: false, message: "Friend request already present" });

    // check if friend request is sent already
    if (user.friendRequestsSent.includes(mongoose.Types.ObjectId(friendId)))
      return res
        .status(400)
        .json({ success: false, message: "Friend request already sent" });

    user.friendRequestsSent.unshift(friendId);
    friend.friendRequests.unshift(userId);

    await User.findByIdAndUpdate(userId, user);
    await User.findByIdAndUpdate(friendId, friend);

    res
      .status(200)
      .json({ success: true, message: "Friend request sent successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Something Went Wrong..." });
  }
};

const acceptFriendRequest = async (req, res) => {
  try {
    const friendId = req.params.friendId;
    const userId = req.userId;

    let user = await User.findById(userId);

    // check if friendId is present in pending requests
    if (!user.friendRequests.includes(mongoose.Types.ObjectId(friendId)))
      return res.status(404).json({
        success: false,
        message: "No friend request from that user found",
      });

    let friend = await User.findById(friendId);

    user.friendRequests = user.friendRequests.filter(
      (id) => id.toString() !== friendId
    );
    friend.friendRequestsSent = friend.friendRequestsSent.filter(
      (id) => id.toString() !== userId
    );

    if (!user.friends.includes(mongoose.Types.ObjectId(friendId)))
      user.friends.unshift(friendId);
    if (!friend.friends.includes(mongoose.Types.ObjectId(userId)))
      friend.friends.unshift(userId);

    await User.findByIdAndUpdate(userId, user);
    await User.findByIdAndUpdate(friendId, friend);

    res
      .status(200)
      .json({ success: true, message: "Friend request accepted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Something Went Wrong..." });
  }
};

const rejectFriendRequest = async (req, res) => {
  try {
    const friendId = req.params.friendId;
    const userId = req.userId;

    let user = await User.findById(userId);

    // check if friendId is present in pending requests
    if (!user.friendRequests.includes(mongoose.Types.ObjectId(friendId)))
      return res.status(404).json({
        success: false,
        message: "No friend request from that user found",
      });

    let friend = await User.findById(friendId);

    user.friendRequests = user.friendRequests.filter(
      (id) => id.toString() !== friendId
    );
    friend.friendRequestsSent = friend.friendRequestsSent.filter(
      (id) => id.toString() !== userId
    );

    await User.findByIdAndUpdate(userId, user);
    await User.findByIdAndUpdate(friendId, friend);

    res
      .status(200)
      .json({ success: true, message: "Friend request rejected successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Something Went Wrong..." });
  }
};

const blockUser = async (req, res) => {
  try {
    const blockUserId = req.params.blockUserId;
    const userId = req.userId;

    let blockUser = await User.findById(blockUserId);
    // check if blockUserId is valid
    if (!blockUser || !blockUser.email_verified)
      return res
        .status(404)
        .json({ success: false, message: "Invalid User id" });

    let user = await User.findById(userId);

    user.friends = user.friends.filter((id) => id.toString() !== blockUserId);
    user.friendRequests = user.friendRequests.filter(
      (id) => id.toString() !== blockUserId
    );
    user.friendRequestsSent = user.friendRequestsSent.filter(
      (id) => id.toString() !== blockUserId
    );

    if (!user.blockedUsers.includes(mongoose.Types.ObjectId(blockUserId)))
      user.blockedUsers.unshift(blockUserId);

    blockUser.friends = blockUser.friends.filter(
      (id) => id.toString() !== userId
    );
    blockUser.friendRequests = blockUser.friendRequests.filter(
      (id) => id.toString() !== userId
    );
    blockUser.friendRequestsSent = blockUser.friendRequestsSent.filter(
      (id) => id.toString() !== userId
    );

    await User.findByIdAndUpdate(userId, user);
    await User.findByIdAndUpdate(blockUserId, blockUser);

    res
      .status(200)
      .json({ success: true, message: "User blocked successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Something Went Wrong..." });
  }
};

const removeFriend = async (req, res) => {
  try {
    const friendId = req.params.friendId;
    const userId = req.userId;

    let friend = await User.findById(friendId);
    // check if friendId is valid
    if (!friend || !friend.email_verified)
      return res
        .status(404)
        .json({ success: false, message: "Invalid User id" });

    let user = await User.findById(userId);

    user.friends = user.friends.filter((id) => id.toString() !== friendId);

    friend.friends = friend.friends.filter((id) => id.toString() !== userId);

    await User.findByIdAndUpdate(userId, user);
    await User.findByIdAndUpdate(friendId, friend);

    res
      .status(200)
      .json({ success: true, message: "Friend removed successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Something Went Wrong..." });
  }
};

const suggestFriends = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).populate({
      path: "friends",
      model: User,
      select: "friends",
    });

    let suggestedIds = new Set();
    user.friends.map((friend) => {
      friend.friends.map((fof) => {
        console.log(fof.toString(), typeof fof.toString());
        if (fof.toString() !== userId && !suggestedIds.has(fof.toString()))
          suggestedIds.add(fof.toString());
      });
    });

    let searchQuery = {};
    let collegeRegex = null;
    let cityRegex = null;
    let college = user.college;
    let city = user.city;

    // make case insensitive regular expression for searching
    if (college) collegeRegex = new RegExp(college, "i");
    if (city) cityRegex = new RegExp(city, "i");

    if (college && city) {
      // search by both college and city
      searchQuery.$or = [{ college: collegeRegex }, { city: cityRegex }];
    } else if (college) {
      // search by college only
      searchQuery.college = collegeRegex;
    } else if (city) {
      // search by city only
      searchQuery.city = cityRegex;
    }

    if (Object.keys(searchQuery).length != 0) {
      const searchResults = await User.find(searchQuery).limit(100);

      searchResults?.map(({ _id }) => {
        if (_id.toString() !== userId && !suggestedIds.has(_id.toString()))
          suggestedIds.add(_id.toString());
      });
    }

    let data = [];
    suggestedIds.forEach((id) => data.push(id));

    res.status(200).json({
      success: true,
      message: "Friend Suggestions",
      data,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Something Went Wrong..." });
  }
};

const uploadProfilePic = async (req, res) => {
  try {
    const userId = req.userId;
    if (!req.file)
      return res
        .status(400)
        .json({ success: false, message: "No file selected" });

    let user = await User.findById(userId).select("profilePic cloudinaryId");
    if (user.profilePic !== null) {
      const removeRes = await axios.delete(
        `http://localhost:${mediaPort}/media/remove/${user.cloudinaryId}`
      );

      if (removeRes.status == 500) return res.status(500).json(removeRes);
    }

    const uploadRes = await axios.post(
      `http://localhost:${mediaPort}/media/upload`,
      req.file
    );

    if (uploadRes.status == 500) return res.status(500).json(uploadRes);

    user.profilePic = uploadRes.data.data.secure_url;
    user.cloudinaryId = uploadRes.data.data.public_id;

    await User.findByIdAndUpdate(userId, user);

    res
      .status(200)
      .json({ success: true, message: "Profile picture added successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Something Went Wrong..." });
  }
};

const removeProfilePic = async (req, res) => {
  try {
    const userId = req.userId;
    let user = await User.findById(userId).select("profilePic cloudinaryId");

    const removeRes = await axios.delete(
      `http://localhost:${mediaPort}/media/remove/${user.cloudinaryId}`
    );

    if (removeRes.status == 500) return res.status(500).json(removeRes);

    user.profilePic = null;
    user.cloudinaryId = null;

    await User.findByIdAndUpdate(userId, user);

    res
      .status(200)
      .json({ success: true, message: "Profile picture removed successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Something Went Wrong..." });
  }
};

const getFeed = async (req, res) => {
  try {
    // res.status(200).json({ success: true, message: "" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Something Went Wrong..." });
  }
};

module.exports = {
  getUsers,
  signup,
  getUser,
  updateUser,
  verifyEmail,
  forgotPassword,
  updatePassword,
  getFriends,
  getFriendRequests,
  getFriendRequestsSent,
  getBlockedUsers,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  blockUser,
  removeFriend,
  suggestFriends,
  uploadProfilePic,
  removeProfilePic,
  getFeed,
};
