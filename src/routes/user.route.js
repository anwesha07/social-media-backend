const mongoose = require("mongoose");
const router = require("express").Router();
const userRepo = require("../models/User.js");
const postRepo = require("../models/Post.js");
const bcrypt = require("bcrypt");
const {
  authenticateUser: authMiddleware,
} = require("../middlewares/auth.middleware");
const validateUpdateUserData = require("../middlewares/user.middleware");
const InternalServerErrorException = require("../utils/exceptions/InternalServerErrorException.js");
const NotFoundException = require("../utils/exceptions/NotFoundException.js");
const ForbiddenException = require("../utils/exceptions/ForbiddenException.js");
const { upload } = require("../middlewares");

router.get("/me", authMiddleware, async (req, res) => {
  // const user = req.user.toObject();
  delete req.user.token;
  console.log(req.user);
  res.json(req.user);
});

//authenticate user
router.post("/verify", authMiddleware, async (req, res) => {
  const { username, profilePicture, _id } = req.user;
  res.status(200).json({ username, profilePicture, _id });
});

// get timeline of user
router.get("/timeline", authMiddleware, async (req, res) => {
  try {
    const NUM_POSTS_PER_PAGE = 10;
    const page = req.query.page || 1;
    // console.log(req.query.page);
    const id_Array = [...req.user.following, req.user._id.toString()]; // array spreading
    const totalPostCount = await postRepo.count({
      author: { $in: id_Array.map((id) => mongoose.Types.ObjectId(id)) },
    });
    const hasNextPage = totalPostCount - page * NUM_POSTS_PER_PAGE > 0;
    const posts = await postRepo
      .find(
        {
          author: {
            $in: id_Array.map((id) => mongoose.Types.ObjectId(id)),
          },
        },
        {
          description: 1,
          image: 1,
          numOfLikes: {
            $size: "$likes",
          },
          numOfComments: {
            $size: "$comments",
          },
          author: 1,
          createdAt: 1,
        }
      )
      .sort({ createdAt: -1 })
      .skip((page - 1) * NUM_POSTS_PER_PAGE)
      .limit(NUM_POSTS_PER_PAGE)
      .populate({
        path: "author",
        select: {
          username: 1,
          profilePicture: 1,
        },
      });
    res.json({ posts, hasNextPage });
  } catch (error) {
    console.log(error);
    throw new InternalServerErrorException(error.message);
  }
});

// get a user by id
router.get("/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await userRepo
      .findOne(
        { _id: userId },
        {
          username: 1,
          profilePicture: 1,
          coverPicture: 1,
          followers: 1,
          following: 1,
        }
      )
      .lean();
    if (user) {
      res.json(user);
    } else {
      throw new NotFoundException("user doesnot exist");
    }
  } catch (err) {
    throw new InternalServerErrorException(err.message);
  }
});

// search user by username
router.get("/", async (req, res) => {
  const name = req.query.name;
  const NUM_RESULTS_PER_PAGE = 2;
  const page = req.query.page || 1;
  // Take page as query param
  // const NUM_RESULTS_PER_PAGE = 10
  try {
    const user = await userRepo
      .find(
        { username: { $regex: name, $options: "i" } },
        {
          username: 1,
          profilePicture: 1,
          coverPicture: 1,
          followers: 1,
          following: 1,
        }
      )
      .lean()
      .skip((page - 1) * NUM_RESULTS_PER_PAGE)
      .limit(NUM_RESULTS_PER_PAGE);
    // Use .skip() for offset and .limit() for number of results
    res.json(user);
  } catch (err) {
    throw new InternalServerErrorException(err.message);
  }
});

// edit user profile details

//multer middleware
const uploadPhotos = upload.fields([
  { name: "profilePicture", maxCount: 1 },
  { name: "coverPicture", maxCount: 1 },
]);

//creating a middleware to call the middleware returned by upload.fields and handle the errors
const handleUploadPhotos = (req, res, next) => {
  uploadPhotos(req, res, function (err) {
    if (err) {
      //error ocurred while uploading the files using multer
      throw new InternalServerErrorException(err.message);
    }
    //uploading was successful
    next();
  });
};

router.put(
  "/me",
  handleUploadPhotos,
  validateUpdateUserData,
  authMiddleware,
  async (req, res) => {
    try {
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        req.body.password = hashedPassword;
      }
      if (req.files.coverPicture) {
        console.log(req.files.coverPicture[0].path);
        req.body.coverPicture = req.files.coverPicture[0].path;
      }
      if (req.files.profilePicture) {
        console.log(req.files.profilePicture[0].path);
        req.body.profilePicture = req.files.profilePicture[0].path;
      }
      console.log(req.body);
      console.log({ ...req.user, ...req.body });
      const updatedUser = await userRepo
        .findOneAndUpdate(
          { _id: req.user._id },
          { $set: { ...req.user, ...req.body } },
          { projection: { password: 0, __v: 0, token: 0 }, new: true }
        )
        .lean();
      res.json(updatedUser);
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
);

// delete profile
router.delete("/me", authMiddleware, async (req, res) => {
  try {
    await userRepo.deleteOne({ _id: req.user._id });
    res.status(204).json();
  } catch (err) {
    throw new InternalServerErrorException(err.message);
  }
});

// follow user
router.put("/follow/:id", authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const userId = req.params.id;

    if (currentUserId == userId) {
      throw new ForbiddenException("You cannot follow yourself");
    } else {
      const user = await userRepo.findOne(
        { _id: userId },
        { password: 0, __v: 0, token: 0 }
      );

      if (user) {
        const currentUser = await userRepo.findOne({ _id: currentUserId });

        if (currentUser.following.includes(userId))
          res.json({ message: "user is already followed" });
        else {
          await currentUser.updateOne({ $push: { following: userId } });
          await user.updateOne({ $push: { followers: currentUserId } });
          res.json({ message: `user ${user._id} followed succesfully` });
        }
      } else {
        throw new NotFoundException("User doesnot exist");
      }
    }
  } catch (err) {
    throw new InternalServerErrorException(err.message);
  }
});

// unfollow user
router.put("/unfollow/:id", authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const userId = req.params.id;

    if (currentUserId == userId) {
      throw new ForbiddenException("You cannot follow yourself");
    } else {
      const user = await userRepo.findOne(
        { _id: userId },
        { password: 0, __v: 0, token: 0 }
      );
      console.log(user);

      if (user) {
        const currentUser = await userRepo.findOne(
          { _id: currentUserId },
          { password: 0, __v: 0, token: 0 }
        );

        if (currentUser.following.includes(userId)) {
          await currentUser.updateOne({ $pull: { following: userId } });
          await user.updateOne({ $pull: { followers: currentUserId } });
          res.json({ message: `user ${user._id} unfollowed succesfully` });
        } else {
          res.json({ message: "user is not followed" });
        }
      } else {
        throw new NotFoundException("User doesnot exist");
      }
    }
  } catch (err) {
    throw new InternalServerErrorException(err.message);
  }
});

// get all posts of user
router.get("/:id/posts", authMiddleware, async (req, res) => {
  try {
    const userId = req.params.id === "me" ? req.user._id : req.params.id;

    const NUM_POSTS_PER_PAGE = 5;
    const page = req.query.page || 1;

    const user = await userRepo
      .findOne({ _id: userId }, { username: 1, profilePicture: 1 })
      .lean();
    if (user) {
      const totalPostCount = await postRepo.count({
        author: userId,
      });
      const hasNextPage = totalPostCount - page * NUM_POSTS_PER_PAGE > 0;

      // aggregate is used for multi stage query processing one by one
      const posts = await postRepo.aggregate([
        {
          $match: {
            author: mongoose.Types.ObjectId(userId),
          },
        },
        {
          $project: {
            description: 1,
            image: 1,
            numOfLikes: {
              $size: "$likes",
            },
            numOfComments: {
              $size: "$comments",
            },
            author: 1,
            createdAt: 1,
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $skip: (page - 1) * NUM_POSTS_PER_PAGE,
        },
        {
          $limit: NUM_POSTS_PER_PAGE,
        },
      ]);
      await userRepo.populate(posts, {
        path: "author",
        select: {
          username: 1,
          profilePicture: 1,
        },
      });
      res.json({ ...user, posts, hasNextPage });
    } else {
      throw new NotFoundException("User doesnot exist");
    }
  } catch (err) {
    throw new InternalServerErrorException(err.message);
  }
});

module.exports = router;
