// functions/src/index.ts
import * as dotenv from "dotenv";

import * as functions from "firebase-functions";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

export const parseSms = functions.https.onRequest(async (req, res) => {
  const smsText = req.body.smsText;
  // const userId = req.body.userId;

  if (!smsText) {
    res.status(400).json({ error: "SMS text is required" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Gemini API key is not configured" });
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Parse the following bank SMS and extract transaction details in JSON format:
    - amount: number (in VND, remove commas)
    - date: string (format: dd/mm/yyyy)
    - type: "Thu" or "Chi"
    - description: string
    - bank: string (e.g., "Vietcombank", "Vietinbank")
    - channel: string (e.g., "Online", "Siêu thị", "Chuyển khoản")
    SMS: "${smsText}"
    Return an array of transactions in JSON format. Example:
    [
      {
        "amount": 500000,
        "date": "23/08/2025",
        "type": "Thu",
        "description": "Mua hang tai Shopee",
        "bank": "Vietcombank",
        "channel": "Online"
      }
    ]
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
    const transactions = jsonMatch
      ? JSON.parse(jsonMatch[1])
      : JSON.parse(responseText);
    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error parsing SMS:", error);
    res.status(500).json({ error: "Failed to parse SMS" });
  }
});
