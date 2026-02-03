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
    res.status(500).send();
  }
});

module.exports = router;

router.get("/tags/suggest", auth, async (req, res) => {
  const query = req.query.q;

  if (!query) res.send([]);

  try {
    const myTags = await Tag.find({
      owner: req.user._id,
      name: { $regex: new RegExp(`^${query}`, "i") },
    })
      .sort({ count: -1 })
      .limit(10);

    const globalTags = await Tag.find({
      owner: { $ne: req.user._id },
      name: { $regex: new RegExp(`^${query}`, "i") },
    })
      .sort({ count: -1 })
      .limit(3);

    const tagSuggestions = [
      ...new Set([
        ...myTags.map((tag) => tag.name),
        ...globalTags.map((tag) => tag.name),
      ]),
    ];

    res.send(tagSuggestions);
  } catch (e) {
    res.status(500).send();
  }
});
