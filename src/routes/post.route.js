const router = require("express").Router();
const postRepo = require("../models/Post");
const commentRepo = require("../models/Comment");
const {
  authenticateUser: authMiddleware,
} = require("../middlewares/auth.middleware");
const validateAuthor = require("../middlewares/post.middleware");
const { upload } = require("../middlewares");
const {
  NotFoundException,
  InternalServerErrorException,
} = require("../utils/exceptions");
const { asyncWrap } = require("../utils");

router.get("/", (_req, res) => {
  res.json({ message: "post route checked" });
});

//create post
const uploadPhotos = upload.array("images", 5);

const handleUploadPhotos = (req, res, next) => {
  uploadPhotos(req, res, function (err) {
    if (err) {
      //error ocurred while uploading the filea using multer
      throw new InternalServerErrorException(err.message);
    }
    //uploading was successful
    next();
  });
};

router.post("/", handleUploadPhotos, authMiddleware, async (req, res) => {
  try {
    const images = req.files.map((fileObj) => {
      return fileObj.path;
    });
    const post = new postRepo({
      ...req.body,
      image: images,
      author: req.user._id,
    });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    throw new InternalServerErrorException(err.message);
  }
});

// middleware to validate post  (all requests to the api s containind id param will pass through this mw)
router.param("id", async (req, _res, next, postId) => {
  try {
    const post = await postRepo.findOne({ _id: postId });
    if (post) {
      req.post = post;
      next();
    } else {
      throw new NotFoundException("post doesnot exist");
    }
  } catch (err) {
    console.log(err.message);
    throw new InternalServerErrorException(err.message);
  }
});

// edit post
router.put("/:id", authMiddleware, validateAuthor, async (req, res) => {
  try {
    await req.post.updateOne({ $set: req.body });
    res.status(200).json({ message: "Post updated successfully" });
  } catch (err) {
    throw new InternalServerErrorException(err.message);
  }
});

//delete post
router.delete("/:id", authMiddleware, validateAuthor, async (req, res) => {
  try {
    await req.post.deleteOne();

    res.status(200).json();
  } catch (err) {
    throw new InternalServerErrorException(err.message);
  }
});

// get post by post id
router.get("/:id", async (req, res) => {
  try {
    const post = await req.post.populate([
      {
        path: "author", // field in post schema to be populated
        select: "_id username profilePicture",
      },
      {
        path: "comments",
        select: "_id content likes author post createdAt updatedAt",
        populate: {
          path: "author",
          select: "_id username profilePicture",
        },
      },
    ]);
    res.json(post);
  } catch (err) {
    throw new InternalServerErrorException(err.message);
  }
});

// get comments of a post with pagination
router.get(
  "/:id/comments",
  asyncWrap(async (req, res) => {
    const NUMBER_OF_COMMENTS_PER_PAGE = 2;
    let hasNextPage = false;
    try {
      const page = req.query.page || 1;

      const comments = await commentRepo
        .find({ post: req.params.id })
        .sort({ createdAt: -1 })
        .skip((page - 1) * NUMBER_OF_COMMENTS_PER_PAGE)
        .limit(NUMBER_OF_COMMENTS_PER_PAGE + 1)
        .populate({
          path: "author", // field in post schema to be populated
          select: "_id username profilePicture",
        });
      if (comments.length === NUMBER_OF_COMMENTS_PER_PAGE + 1) {
        hasNextPage = true;
        comments.pop();
      }
      res.json({ comments, hasNextPage });
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  })
);

// like post
router.put("/:id/like", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    if (req.post.likes.includes(userId)) {
      await req.post.updateOne({ $pull: { likes: req.user._id } });
      res.json({
        postLiked: false,
        message: `post unliked by user ${req.user._id}`,
      });
    } else {
      await req.post.updateOne({ $push: { likes: req.user._id } });
      res.json({
        postLiked: true,
        message: `post liked by user ${req.user._id}`,
      });
    }
  } catch (err) {
    throw new InternalServerErrorException(err.message);
  }
});

// comment on post
router.post(
  "/:id/comment",
  authMiddleware,
  asyncWrap(async (req, res) => {
    try {
      const postId = req.post._id;
      const userId = req.user._id;
      console.log(req.body);
      const comment = new commentRepo({
        content: req.body.comment,
        author: userId,
        post: postId,
      });
      const newComment = await comment.save();
      req.post.comments.push(newComment._id);
      await req.post.save();
      res.status(201).json({ message: "comment saved successfully" });
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  })
);

module.exports = router;
