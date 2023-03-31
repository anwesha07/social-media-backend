const validateAuthor = (req,res,next) => {
    if (req.user._id.toString() === req.post.author.toString()) {
        next();
    } else {
        res.status(403).json({message: "unauthorised user"});
    }
};

// default export, can give any name to obj importing it
module.exports = validateAuthor;
