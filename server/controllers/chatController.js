const { CATALOG } = require("../data/catalog");
const User = require("../models/User");
const { chatSuggest } = require("../services/recommend");

exports.chat = async (req, res, next) => {
  try {
    let profile = null;
    if (req.user?.id) profile = await User.findById(req.user.id);
    res.json(chatSuggest(CATALOG, req.body.message, profile));
  } catch (err) {
    next(err);
  }
};
