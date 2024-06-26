const db = require("../database/db.js"); // db.js 파일의 경로에 맞게 수정

exports.post = (req, res) => {
  const { title, author, content } = req.body;

  if (!title || !author || !content) {
    return res.status(400).json({
      success: false,
      message: "제목, 작성자, 내용을 모두 제공해야 합니다.",
    });
  }

  // 현재 시간을 UTC로 변환하여 저장
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
  const koreaTimeDiff = 9 * 60 * 60 * 1000;
  const created_at = new Date(utc + koreaTimeDiff);
  // 데이터베이스에 텍스트 정보 저장
  const sql =
    "INSERT INTO posts (title, author, content, created_at) VALUES (?, ?, ?, ?)";
  db.query(sql, [title, author, content, created_at], (err, result) => {
    if (err) {
      console.error("Error inserting text into database:", err);
      res.status(500).json({
        success: false,
        message: "텍스트를 데이터베이스에 저장하는 중 오류가 발생했습니다.",
      });
      return;
    }

    console.log("텍스트를 데이터베이스에 성공적으로 저장했습니다.");
    res.status(201).json({
      success: true,
      message: "텍스트가 데이터베이스에 성공적으로 저장되었습니다.",
    });
  });
};

exports.getPostById = (req, res) => {
  const { id } = req.params; // URL에서 파라미터로 전달된 아이디 값

  // 데이터베이스에서 특정 아이디의 포스트를 가져오는 쿼리
  const sql = "SELECT * FROM posts WHERE id = ?";

  // 쿼리 실행
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error fetching post by id:", err);
      res.status(500).json({
        success: false,
        message: "아이디로 포스트를 가져오는 중 오류가 발생했습니다.",
      });
      return;
    }

    // 해당 아이디에 해당하는 포스트가 없을 경우
    if (result.length === 0) {
      res.status(404).json({
        success: false,
        message: "해당 아이디에 해당하는 포스트를 찾을 수 없습니다.",
      });
      return;
    }

    // 성공적으로 포스트를 가져왔을 때 클라이언트로 응답 전송
    res.status(200).json({ success: true, post: result[0] });
  });
};

exports.ModifyPost = (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  const sql = "UPDATE posts SET title = ?, content = ? WHERE id = ?";
  db.query(sql, [title, content, id], (err, result) => {
    if (err) {
      console.error("Error updating post:", err);
      res.status(500).json({
        success: false,
        message: "포스트를 업데이트하는 중 오류가 발생했습니다.",
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: "포스트가 성공적으로 업데이트되었습니다.",
    });
  });
};

exports.deletePostById = (req, res) => {
  const { id } = req.params;

  // 데이터베이스에서 해당 ID의 포스트를 삭제하는 쿼리
  const sql = "DELETE FROM posts WHERE id = ?";

  // 쿼리 실행
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting post:", err);
      res.status(500).json({
        success: false,
        message: "포스트를 삭제하는 중 오류가 발생했습니다.",
      });
      return;
    }

    // 삭제 성공 시 클라이언트로 응답 전송
    res
      .status(200)
      .json({ success: true, message: "포스트가 성공적으로 삭제되었습니다." });
  });
};

exports.getPosts = (req, res) => {
  // 데이터베이스에서 모든 게시글을 가져오는 쿼리
  const sql =
    "SELECT id, title, author, DATE_FORMAT(created_at, '%Y-%m-%d') AS date FROM posts ORDER BY created_at DESC";

  // 쿼리 실행
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching posts:", err);
      res.status(500).json({
        success: false,
        message: "게시글을 가져오는 중 오류가 발생했습니다.",
      });
      return;
    }
    // 성공적으로 게시글을 가져왔을 때 클라이언트로 응답 전송
    res.status(200).json({ success: true, posts: result });
  });
};

exports.getLatestPosts = (req, res) => {
  // 데이터베이스에서 최신 게시글 5개만 가져오는 쿼리
  const sql =
    "SELECT id, title, author, DATE_FORMAT(created_at, '%Y-%m-%d') AS date FROM posts ORDER BY created_at DESC LIMIT 5";

  // 쿼리 실행
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching latest posts:", err);
      res.status(500).json({
        success: false,
        message: "최신 게시글을 가져오는 중 오류가 발생했습니다.",
      });
      return;
    }
    // 성공적으로 최신 게시글을 가져왔을 때 클라이언트로 응답 전송
    res.status(200).json({ success: true, latestPosts: result });
  });
};
