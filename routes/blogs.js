const express = require("express");
const {
  fetchAllBlogs,
  addBlog,
  deleteBlog,
  updateBlog,
  getComment,
  addComment,
  addVote,
} = require("../controllers/blogs");
const { fetchUser } = require("../middlewares/fetchUser");

const router = express.Router();

router.use(fetchUser);

router.get("/", fetchAllBlogs);

router.post("/addblog", addBlog);

router.delete("/delete/:id", deleteBlog);

router.put("/update/:id", updateBlog);

router.post("/addcomment/:id", addComment);

router.get("/getcomment/:id", getComment);

router.post("/vote/:id", addVote);

module.exports = router;

// .fetch("http://localhost:8080/api/")
