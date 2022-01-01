const User = require("../models/user");

const getUsers = async (req, res) => {
  try {
    let { page } = req.query;
    if (!page) page = 1;
    // response limit
    const LIMIT = 100;
    // Get the starting index of every page
    const startIndex = (Number(page) - 1) * LIMIT;
    const totalUsers = await User.countDocuments({});

    const users = await User.find()
      .sort({ _id: -1 })
      .limit(LIMIT)
      .skip(startIndex);

    res.status(200).json({
      success: true,
      data: users,
      currentPage: Number(page),
      numberOfPages: Math.ceil(totalUsers / LIMIT),
    });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

module.exports = { getUsers };
