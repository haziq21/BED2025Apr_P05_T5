import { getCommentAndAnalyze } from "../services/sentimentService.js";
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function sentiment(req,res) {
  try {
    const result = await getCommentAndAnalyze();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to analyze sentiment' });
  }
}


