import sql from "mssql";
import pool from "../db.js";

/**
 * get the comment by userId
 * @param {number} userId
 */
export async function getCommentById(userId){
    try {
      const result = await pool
        .request()
        .input("userId", userId)
        .query(`
            SELECT c.Comment,c.PostId,u.UserId,u.Name AS UserName 
            FROM Comment c 
            JOIN Users u ON c.UserId = u.UserId
            WHERE c.UserId = @userId
         `);

    return result.recordset;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
};

/**
 * get all the comments on comment page 
 */
export async function getComment(){
    try {
      const result = await pool
        .request()
        .query(`
            SELECT c.Comment,c.PostId,u.UserId,u.Name AS UserName
            FROM Comment c 
            JOIN Users u ON c.UserId = u.UserId 
         `);

    return result.recordset;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
};

/**
 * update the comment by userId
 * @param {number} userId 
 * @param {{PostId: number, Comment: string}} postData
 */
export async function updateComment(userId,postData) {
    try {
        const request = pool.request()
        .input("PostId", postData.PostId)
        .input("userId",userId)
        .input("Comment", postData.Comment)
      
        const result = await request.query(`
        UPDATE Comment
        SET 
            Comment = @Comment
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
};





/**
 * create comment by userId and PostId
 * @param {number} userId
 * @param {{PostId: number, Comment: string}} newComment
 */
export async function createComment(userId,newComment){
    try{
        const request = pool.request()
        .input("UserId", userId)
        .input("Comment", newComment.Comment)

        const result = await request.query(`
        INSERT INTO Comment (UserId,Comment)
        OUTPUT INSERTED.*
        VALUES(@userId,@Comment)  
            `);
        return result.recordset[0];
    }catch (error) {
    console.error("Database error:", error);
    throw error;
  }
};


/**
 * delete the comment by userId and PostId
 * @param {number} PostId 
 * @param {number} userId
 */
export async function deleteComment(userId,PostId) {
    try{
        const request = pool.request()
        .input("PostId",PostId)
        .input("userId",userId)

        const result = await request.query(`
        DELETE FROM Comment 
        OUTPUT DELETED.*
        WHERE PostId = @PostId AND UserId = @userId
            `);

        if (result.recordset.length === 0) {
        return { message: `No comment found with ID ${PostId}.` };
        }

        return { message: `Comment with ID ${PostId} has been deleted.` };
    }catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}