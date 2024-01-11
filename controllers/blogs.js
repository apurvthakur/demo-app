const User = require("../models/User");
const Blog = require("../models/Blog");
const Comment = require("../models/Comment");
const Tag = require("../models/Tag");

// consider that user is logged in and its info is present in req.user

module.exports.fetchAllBlogs = async (req, res) => {
  const blogs = await Blog.find({});
  res.status(201).json({ blogs });
};

module.exports.addBlog = async (req, res) => {
  try {
    const { title, descripion, tag, imageUrl } = req.body;
    const userId = req.user.id;

    const user = User.findById(userId);

    const blog = new Blog({
      title,
      descripion,
      tag,
      imageUrl,
      user: userId,
      username: user.username,
      upvote: 0,
      downvote: 0,
      comments: [],
    });

    const newBlog = await blog.save();

    for (const tagContent of tag) {
      const existingTag = await Tag.findOne({ categoryName: tagContent });

      if (!existingTag) {
        const newTag = new Tag({
          categoryName: tagContent,
          category: [newBlog._id],
        });
        await newTag.save();
      } else {
        existingTag.category.push(newBlog._id);
        await existingTag.save();
      }
    }
    res.status(200).json({ blog: newBlog });
  } catch (e) {
    console.log("error: " + JSON.stringify(e));
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.deleteBlog = async (req, res) => {
  try {
    const blogId = req.params.id;

    const userId = req.user.id;

    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res
        .status(404)
        .json({ message: "Blog not found", status: "error" });
    }

    if (blog.user !== userId) {
      return res.status(403).json({
        message: "Forbidden, you cannot delete someone else blog",
        status: "error",
      });
    }
    await Blog.findByIdAndDelete(blogId);

    res.status(200).json({ status: "success", blog });
  } catch (e) {
    console.log("error: " + JSON.stringify(e));
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.updateBlog = async (req, res) => {
  try {
    const blogId = req.params.id;

    const userId = req.user.id;

    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res
        .status(404)
        .json({ message: "Blog not found", status: "error" });
    }

    if (blog.user !== userId) {
      return res.status(403).json({
        message: "Forbidden, you cannot edit someone else blog",
        status: "error",
      });
    }

    if (req.body.title) {
      blog.title = req.body.title;
    }
    if (req.body.descripion) {
      blog.descripion = req.body.descripion;
    }
    if (req.body.tag) {
      blog.tag = req.body.tag;
    }
    if (req.body.imageUrl) {
      blog.imageUrl = req.body.imageUrl;
    }

    // TODO: update Tag Collection as well

    await Blog.findByIdAndUpdate(blogId, blog);

    res.status(200).json({ status: "success", blog });
  } catch (e) {
    console.log("error: " + JSON.stringify(e));
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.getComment = async (req, res) => {
  const commentId = req.params.id;
  const comment = await Comment.findById(commentId);
  if (!comment) {
    return res
      .status(404)
      .json({ message: "Comment not found", status: "error" });
  }
  res.status(201).json({ comment });
};

module.exports.addComment = async (req, res) => {
  try {
    const blogId = req.params.id;

    const { message, parentCommentId } = req.body;

    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res
        .status(404)
        .json({ message: "Blog not found", status: "error" });
    }

    const newComment = new Comment({
      user: req.user.id,
      message,
      parentComment: parentCommentId,
      blog: blogId,
      like: 0,
      isNested: !!parentCommentId,
    });

    await newComment.save();

    res.status(200).json({ newComment });
  } catch (e) {
    console.log("error: " + JSON.stringify(e));
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.addVote = async (req, res) => {
  try {
    const blogId = req.params.id;
    const userId = req.user.id;
    const { voteType } = req.body; // upvote || downvote

    const blog = Blog.findById(blogId);

    if (!blog) {
      return res
        .status(404)
        .json({ message: "Blog not found", status: "error" });
    }

    //check if user has already voted
    if (blog.votedBy.includes(userId)) {
      return res
        .status(400)
        .json({ message: "User has already voted", status: "error" });
    }

    blog.upvote = voteType === "upvote" ? blog.upvote + 1 : blog.upvote;
    blog.downvote = voteType === "downvote" ? blog.downvote + 1 : blog.downvote;

    blog.votedBy.push(userId);

    const newBlog = await blog.save();
    res.status(200).json({ message: "Voted Successfully", blog: newBlog });
  } catch (e) {
    console.log("error: " + JSON.stringify(e));
    res.status(500).json({ message: "Internal Server Error" });
  }
};
