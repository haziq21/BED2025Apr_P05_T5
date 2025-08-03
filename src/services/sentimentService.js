import * as comment from "../models/comment.js";

const twinwordApiKey = process.env.TWINWORD_API;
if (!twinwordApiKey) {
  throw new Error("Missing TWINWORD_API in environment variables");
}

export async function getCommentAndAnalyze() {
  try {
    /**
     * @type {{ positive: number, neutral: number, negative: number }}
     */
    const sentimentCounts = {
      positive: 0,
      neutral: 0,
      negative: 0,
    };

    const result = await comment.getSentimentComment();
    
    for (const post of result) {
      if (post.AnalysisStatus === "false") {
        const commentText = post.Comment;

        console.log(" Retrieved Comment:", commentText);

        const twinwordUrl = `https://twinword-twinword-bundle-v1.p.rapidapi.com/sentiment_analyze/?text=${encodeURIComponent(
          commentText
        )}`;

        const twinwordRes = await fetch(twinwordUrl, {
          method: "GET",
          headers: {
            "x-rapidapi-host": "twinword-twinword-bundle-v1.p.rapidapi.com",
            "x-rapidapi-key": String(twinwordApiKey),
          },
        });

        const sentiment = await twinwordRes.json();

        console.log("Status Code:", twinwordRes.status);

        if (sentiment.result_code === "200") {
          /**
           * @type {'positive' | 'neutral' | 'negative'}
           */
          const type = sentiment.type;
          console.log("Sentiment Type:", sentiment.type);
          console.log("Score:", sentiment.score);
          sentimentCounts[type] = (sentimentCounts[type] || 0) + 1;
        } else {
          console.error("API Error:", sentiment.result_msg);
        }

        const data = {
          PostId: post.PostId,
          Comment: post.Comment,
          AnalysisStatus: "true",
          SentimentType : sentiment.type
        };
        //update the sentiment type and stauts
        await comment.updateComment(post.UserId, data);
      }
      // @ts-ignore
      sentimentCounts[post.SentimentType] = (sentimentCounts[post.SentimentType] || 0) +1;
    }
    return [
      sentimentCounts.positive,
      sentimentCounts.neutral,
      sentimentCounts.negative,
    ];
    
  } catch (err) {
    // @ts-ignore
    console.error("Error:", err.message);
  }
}
