// src/helpers/parsers.ts
import type { Transaction } from "../types";
import { CATEGORIES_BY_PURPOSE, KEYWORD_MAP, PURPOSES } from "./constants";
import { getCategoryRules } from "../api/firestore";
import { normalizeString } from "./formatters";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  console.warn(
    "Gemini API key is not configured. Client-side parsing may fail."
  );
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI
  ? genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
  : null;

export const parseVcbSms = async (
  smsText: string,
  userId?: string
): Promise<Transaction[] | null> => {
  const regex =
    /SD TK 1014456312 ([-+])([\d,]+)VND luc (\d{2}-\d{2}-\d{4}) (\d{2}:\d{2}:\d{2})\.?\s*(.*?)(?=SD TK 1014456312|$)/gs;
  const transactions: Transaction[] = [];
  const matches = [...smsText.matchAll(regex)];

  if (matches.length === 0) {
    return null;
  }

  for (const match of matches) {
    const type = match[1] === "+" ? "Thu" : "Chi";
    const amount = parseFloat(match[2].replace(/,/g, ""));
    const dateStr = match[3];
    const [day, month, year] = dateStr.split("-");
    const date = `${year}-${month}-${day}`;
    const descriptionBlock = match[5].trim();
    let cleanedDescription = "";

    const descriptionRegex =
      /(?:Ref .*?\.|Ref .*?\.QR - )?([^.]*?chuyen tien[^.]*?)(?:\.CT tu|\sSD TK|$)|(Thanh toan cho.*?tu tai khoan)(?=\sSD TK|$)|(TOPUP Viettel.*?)(?:\sSD TK|$)|([^.]*?)(?:\.CT tu|\sSD TK|$)|\.Vietcombank:1014456312:(.*)$/;

    const descriptionMatch = descriptionBlock.match(descriptionRegex);

    if (descriptionMatch) {
      cleanedDescription =
        descriptionMatch[1] ||
        descriptionMatch[2] ||
        descriptionMatch[3] ||
        descriptionMatch[5] ||
        descriptionMatch[4] ||
        "Giao dịch không rõ";
    } else {
      cleanedDescription = "Giao dịch không rõ";
    }

    const { purpose, category, member } = await getSmartCategory(
      cleanedDescription,
      type,
      amount,
      userId
    );
    const channel = getSmartChannel(cleanedDescription);

    transactions.push({
      amount,
      type,
      description: cleanedDescription,
      date,
      account: "Tài khoản ngân hàng",
      purpose,
      category,
      member,
      channel,
    });
  }

  return transactions.length > 0 ? transactions : null;
};

export const parseVtbSms = async (
  smsText: string,
  userId?: string
): Promise<Transaction[] | null> => {
  const regex =
    /VietinBank:(\d{2}\/\d{2}\/\d{4}).*?GD:([+-])([\d,]+)VND.*?ND:(.*?)(~|$)/g;
  const transactions: Transaction[] = [];
  let match;

  while ((match = regex.exec(smsText)) !== null) {
    const dateStr = match[1];
    const [day, month, year] = dateStr.split("/");
    const date = `${year}-${month}-${day}`;
    const type = match[2] === "+" ? "Thu" : "Chi";
    const amount = parseFloat(match[3].replace(/,/g, ""));
    const description = match[4].trim();

    const { purpose, category, member } = await getSmartCategory(
      description,
      type,
      amount,
      userId
    );
    const channel = getSmartChannel(description);

    transactions.push({
      amount,
      type,
      description,
      date,
      account: "Tài khoản ngân hàng",
      purpose,
      category,
      member,
      channel,
    });
  }
  return transactions.length > 0 ? transactions : null;
};

export const parseBidvSms = async (
  smsText: string,
  userId?: string
): Promise<Transaction[] | null> => {
  const lines: string[] = smsText.split("\n");
  const transactions: Transaction[] = [];
  const regex =
    /tai BIDV\s*([+-])([\d,]+)VND(?:.*?)vao\s*(\d{2}:\d{2})\s*(\d{2}\/\d{2}\/\d{2,4}).*ND:\s*([\s\S]+)/;

  for (const line of lines) {
    if (line.trim() === "") continue;
    const match = line.match(regex);
    if (match) {
      const type: "Thu" | "Chi" = match[1] === "+" ? "Thu" : "Chi";
      const amount: number = parseFloat(match[2].replace(/,/g, ""));
      const dateStr: string = match[4];
      const [day, month, year] = dateStr.split("/");
      const fullYear: string = year.length === 2 ? `20${year}` : year;
      const date: string = `${fullYear}-${month}-${day}`;
      let rawDescription: string = match[5].trim();

      const patternsToRemove = [
        /So du:[\d,.]+VND;?/,
        /MB-TKThe :[\d,]+, tai (Techcombank|Vietcombank)./,
        /O@L_.*-BIDV D/,
        /TKThe :[\d,]+, tai TCB./,
        /RE M Tfr Ac:/,
        /FT\d+/,
      ];

      let cleanedDescription = rawDescription;
      for (const pattern of patternsToRemove) {
        cleanedDescription = cleanedDescription.replace(pattern, "").trim();
      }

      const { purpose, category, member } = await getSmartCategory(
        cleanedDescription,
        type,
        amount,
        userId
      );
      const channel = getSmartChannel(cleanedDescription);

      transactions.push({
        amount,
        type,
        description: cleanedDescription,
        date,
        account: "Tài khoản BIDV",
        purpose,
        category,
        member,
        channel,
      });
    }
  }

  return transactions.length > 0 ? transactions : null;
};

export const parseMbSms = async (
  smsText: string,
  userId?: string
): Promise<Transaction[] | null> => {
  const regex =
    /BIEN DONG SO DU\s*TK \d+:\s*([+-])(\d+).*?\s*luc\s*(\d{2}:\d{2})\s*ngay\s*(\d{2}\/\d{2}\/\d{4}).*?Noi dung: (.*?)$/g;
  const transactions: Transaction[] = [];
  let match;

  while ((match = regex.exec(smsText)) !== null) {
    const type = match[1] === "+" ? "Thu" : "Chi";
    const amount = parseFloat(match[2].replace(/,/g, ""));
    const dateStr = match[4];
    const [day, month, year] = dateStr.split("/");
    const fullYear = year.length === 2 ? `20${year}` : year;
    const date = `${fullYear}-${month}-${day}`;
    const description = match[5].trim();

    const { purpose, category, member } = await getSmartCategory(
      description,
      type,
      amount,
      userId
    );
    const channel = getSmartChannel(description);

    transactions.push({
      amount,
      type,
      description,
      date,
      account: "Tài khoản ngân hàng",
      purpose,
      category,
      member,
      channel,
    });
  }
  return transactions.length > 0 ? transactions : null;
};

export const parseWithGemini = async (
  smsText: string,
  userId?: string
): Promise<Transaction[] | null> => {
  if (!model || !apiKey) {
    console.error(
      "Gemini API is not available. Ensure VITE_GEMINI_API_KEY is set."
    );
    return null;
  }

  const prompt = `
    Parse the following bank SMS and extract transaction details in JSON format:
    - amount: number (in VND, remove commas)
    - date: string (format: YYYY-MM-DD)
    - type: "Thu" or "Chi"
    - description: string
    - bank: string (e.g., "Vietcombank", "Vietinbank")
    - channel: string (e.g., "Online", "Siêu thị", "Chuyển khoản")
    SMS: "${smsText}"
    Return an array of transactions in JSON format. Example:
    [
      {
        "amount": 500000,
        "date": "2025-08-23",
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
    const transactions: Transaction[] = jsonMatch
      ? JSON.parse(jsonMatch[1])
      : JSON.parse(responseText);

    for (const tx of transactions) {
      const { purpose, category, member } = await getSmartCategory(
        tx.description,
        tx.type,
        tx.amount,
        userId
      );
      tx.purpose = purpose;
      tx.category = category;
      tx.member = member;
      tx.account = "Tài khoản ngân hàng";
      tx.channel = getSmartChannel(tx.description);
    }

    return transactions.length > 0 ? transactions : null;
  } catch (error) {
    console.error("Error parsing SMS with Gemini API:", error);
    return null;
  }
};

export const getSmartCategory = async (
  description: string,
  type: "Thu" | "Chi",
  amount: number,
  userId?: string
): Promise<{ purpose: string; category: string; member: string }> => {
  const lowerDesc = normalizeString(description);

  if (userId) {
    const userRules = await getCategoryRules(userId);
    if (userRules[lowerDesc]) {
      return {
        purpose: userRules[lowerDesc].purpose,
        category: userRules[lowerDesc].category,
        member: userRules[lowerDesc].member || "Chồng",
      };
    }
  }

  for (const keyword in KEYWORD_MAP) {
    if (lowerDesc.includes(keyword)) {
      const { purpose, category, member } = KEYWORD_MAP[keyword];
      return { purpose, category, member: member || "Chồng" };
    }
  }

  const defaultCategory = CATEGORIES_BY_PURPOSE[PURPOSES[0]][0];
  let purpose = PURPOSES[0];
  let category = defaultCategory;
  let member = "Chồng";

  if (type === "Thu") {
    purpose = "Kinh doanh";
    if (amount < 3000000) {
      category = "Bán vật tư";
    } else if (amount < 10000000) {
      category = "Bảo dưỡng, sửa chữa máy";
    } else {
      category = "Bán máy";
    }
  } else {
    // type === "Chi"
    if (amount < 400000) {
      purpose = "Ăn uống";
      category = "Đồ ăn vặt";
    } else {
      purpose = "Kinh doanh";
      category = "Vật tư";
    }
  }

  return { purpose, category, member };
};

export const getSmartChannel = (description: string): string => {
  const lowerDesc = description.toLowerCase();

  if (
    lowerDesc.includes("thanh toan") ||
    lowerDesc.includes("shopee") ||
    lowerDesc.includes("lazada") ||
    lowerDesc.includes("shopeepay") ||
    lowerDesc.includes("qr pay")
  ) {
    return "Online";
  } else if (lowerDesc.includes("rut tien") || lowerDesc.includes("atm")) {
    return "Rút tiền";
  } else if (
    lowerDesc.includes("chợ") ||
    lowerDesc.includes("sieuthi") ||
    lowerDesc.includes("go market")
  ) {
    return "Siêu thị";
  } else if (lowerDesc.includes("phi thuong nien")) {
    return "Phí thẻ";
  } else {
    return "Chuyển khoản";
  }
};

export const parseSms = async (
  smsText: string,
  userId?: string
): Promise<Transaction[]> => {
  let allTransactions: Transaction[] = [];

  const parsers = [parseVcbSms, parseVtbSms, parseBidvSms, parseMbSms];

  for (const parser of parsers) {
    const results = await parser(smsText, userId);
    if (results) {
      allTransactions.push(...results);
    }
  }

  if (allTransactions.length === 0) {
    const aiResults = await parseWithGemini(smsText, userId);
    if (aiResults) {
      allTransactions.push(...aiResults);
    }
  }

  allTransactions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return allTransactions;
};
