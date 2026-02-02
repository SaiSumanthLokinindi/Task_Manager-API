const router = require("express").Router();
const Tag = require("../models/tagModel");
const auth = require("../middleware/auth");

router.get("/tags/top", auth, async (req, res) => {
  try {
    const tags = await Tag.find({
      owner: req.user._id,
    })
      .sort({ count: -1 })
      .limit(3);

    res.send(tags);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
