import pool from "../db.js";

class Comment {
  /**
   * get the comment by userId(show my own comment)
   * @param {number} userId
   */
 
  static async getCommentById(userId) {
    try {
      const result = await pool.request().input("userId", userId).query(`
            SELECT c.Comment,c.PostId,u.UserId,c.TimeStamp,c.ParentPostId,u.Name AS UserName
            FROM Comment c 
            JOIN Users u ON c.UserId = u.UserId
            WHERE c.UserId = @userId AND c.ParentPostId = -1
            ORDER BY c.TimeStamp DESC;
         `);
      result.recordset.forEach((comment) => {
        if (comment.UserId === userId) {
          comment.loginUser = true;
        } else {
          comment.loginUser = false;
        }
      });
      return result.recordset;
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  }

  /**
   * update the comment by userId
   * @param {number} userId
   * @param {{PostId: number, Comment: string, AnalysisStatus:string,SentimentType:string}} postData
   */
  
  static async updateComment(userId, postData) {
    try {
      const request = pool
        .request()
        .input("PostId", postData.PostId)
        .input("userId", userId)
        .input("Comment", postData.Comment)
        .input("AnalysisStatus", postData.AnalysisStatus)
        .input("SentimentType", postData.SentimentType);

      const result = await request.query(`
        UPDATE Comment
        SET 
            Comment = @Comment,
            AnalysisStatus = @AnalysisStatus,
            SentimentType = @SentimentType
        OUTPUT INSERTED.*
        WHERE PostId = @PostId AND UserId = @userId
    `);
      if (result.recordset.length === 0) {
        return { message: `No comment found with ID ${postData.PostId}.` };
      }

      return result.recordset[0];
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  }

  /**
   * create comment by userId and PostId
   * @param {number} userId
   * @param {{PostId: number, Comment: string,ParentPostId:number,AnalysisStatus:string}} newComment
   */
  
  static async createComment(userId, newComment) {
    try {
      const request = pool
        .request()
        .input("UserId", userId)
        .input("Comment", newComment.Comment)
        .input("ParentPostId", newComment.ParentPostId)
        .input("AnalysisStatus", newComment.AnalysisStatus);

      const result = await request.query(`
        INSERT INTO Comment (UserId,Comment,ParentPostId,AnalysisStatus)
        OUTPUT INSERTED.*
        VALUES(@userId,@Comment,@ParentPostId,@AnalysisStatus)  
            `);
      return result.recordset[0];
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  }

  /**
   * delete the comment by userId and PostId
   * @param {number} PostId
   * @param {number} userId
   */
 
  static async deleteComment(userId, PostId) {
    try {
      const request = pool
        .request()
        .input("PostId", PostId)
        .input("userId", userId);

      const result = await request.query(`
        DELETE FROM Comment 
        OUTPUT DELETED.*
        WHERE PostId = @PostId AND UserId = @userId
            `);

      if (result.recordset.length === 0) {
        return { message: `No comment found with ID ${PostId}.` };
      }

      return { message: `Comment with ID ${PostId} has been deleted.` };
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  }

  /**
   * get replys from each post comment
   * @param {number} PostID
   * @param {number} uid
   */
  
  static async getCommentByOthers(uid, PostID) {
    try {
      const request = pool.request().input("PostId", PostID);

      const result = await request.query(`
            SELECT c.Comment,c.PostId,u.UserId,c.TimeStamp,c.ParentPostId,u.Name AS UserName
            FROM Comment c 
            JOIN Users u ON c.UserId = u.UserId 
            WHERE c.ParentPostId = @PostId
            ORDER BY c.TimeStamp ASC;
         `);
      result.recordset.forEach((comment) => {
        if (comment.UserId === uid) {
          comment.loginUser = true;
        } else {
          comment.loginUser = false;
        }
      });
      return result.recordset;
    } catch (err) {
      console.error("Database error:", err);
    }
  }

  /**
   * get all the comments on comment page(show all comments)
   * @param {number} [uid]
   */
  
  static async getComment(uid) {
    try {
      const result = await pool.request().query(`
            SELECT c.Comment,c.PostId,u.UserId,c.TimeStamp,c.ParentPostId,c.AnalysisStatus,c.SentimentType,u.Name AS UserName 
            FROM Comment c 
            JOIN Users u ON c.UserId = u.UserId 
            WHERE c.ParentPostId = -1
            ORDER BY c.TimeStamp DESC;
         `);

      result.recordset.forEach((comment) => {
        if (comment.UserId === uid) {
          comment.loginUser = true;
        } else {
          comment.loginUser = false;
        }
      });

      return result.recordset;
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  }

 
  static async getSentimentComment() {
    try {
      const result = await pool.request().query(`
            SELECT * 
            FROM Comment;
         `);
      return result.recordset;
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  }
}

export default Comment;