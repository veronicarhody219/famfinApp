// src/helpers/parsers.ts

import type { Transaction } from "../types";
import { CATEGORIES_BY_PURPOSE, KEYWORD_MAP, PURPOSES } from "./constants";

/**
 * Phân tích nội dung SMS của Vietcombank.
 * @param smsText Nội dung tin nhắn.
 * @returns Mảng các giao dịch đã parse hoặc null nếu không khớp.
 */
export const parseVcbSms = (smsText: string): Transaction[] | null => {
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
      if (descriptionMatch[1]) {
        cleanedDescription = descriptionMatch[1].trim();
      } else if (descriptionMatch[2]) {
        cleanedDescription = descriptionMatch[2].trim();
      } else if (descriptionMatch[3]) {
        cleanedDescription = descriptionMatch[3].trim();
      } else if (descriptionMatch[5]) {
        cleanedDescription = descriptionMatch[5].trim();
      } else if (descriptionMatch[4]) {
        cleanedDescription = descriptionMatch[4].trim();
      }
    }

    if (!cleanedDescription) {
      cleanedDescription = "Giao dịch không rõ";
    }

    const { purpose, category, member } = getSmartCategory(
      cleanedDescription,
      type,
      amount
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
      member: member || "Chồng",
      channel,
    });
  }

  return transactions.length > 0 ? transactions : null;
};

/**
 * Phân tích nội dung SMS của Vietinbank.
 * @param smsText Nội dung tin nhắn.
 * @returns Mảng các giao dịch đã parse hoặc null nếu không khớp.
 */
export const parseVtbSms = (smsText: string): Transaction[] | null => {
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

    const { purpose, category, member } = getSmartCategory(
      description,
      type,
      amount
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
      member: member || "Chồng",
      channel,
    });
  }
  return transactions.length > 0 ? transactions : null;
};

/**
 * Phân tích nội dung SMS của BIDV.
 * @param smsText Nội dung tin nhắn.
 * @returns Mảng các giao dịch đã parse hoặc null nếu không khớp.
 */
export const parseBidvSms = (smsText: string): Transaction[] | null => {
  const lines: string[] = smsText.split("\n");
  const transactions: Transaction[] = [];
  const regex =
    /tai BIDV\s*([+-])([\d,]+)VND(?:.*?)vao\s*(\d{2}:\d{2})\s*(\d{2}\/\d{2}\/\d{2,4}).*ND:\s*([\s\S]+)/;

  lines.forEach((line: string) => {
    if (line.trim() === "") return;
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
      patternsToRemove.forEach((pattern) => {
        cleanedDescription = cleanedDescription.replace(pattern, "").trim();
      });

      const { purpose, category, member } = getSmartCategory(
        cleanedDescription,
        type,
        amount
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
        member: member || "Chồng",
        channel,
      });
    }
  });

  return transactions.length > 0 ? transactions : null;
};

/**
 * Phân tích nội dung SMS của MB Bank.
 * @param smsText Nội dung tin nhắn.
 * @returns Mảng các giao dịch đã parse hoặc null nếu không khớp.
 */
export const parseMbSms = (smsText: string): Transaction[] | null => {
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

    const { purpose, category, member } = getSmartCategory(
      description,
      type,
      amount
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
      member: member || "Chồng",
      channel,
    });
  }
  return transactions.length > 0 ? transactions : null;
};

/**
 * Phân loại thông minh dựa trên mô tả, loại giao dịch và số tiền.
 * @param description Mô tả giao dịch.
 * @param type Loại giao dịch ("Thu" hoặc "Chi").
 * @param amount Số tiền giao dịch.
 * @returns {purpose, category, member}.
 */
export const getSmartCategory = (
  description: string,
  type: "Thu" | "Chi",
  amount: number
) => {
  const lowerDesc = description.toLowerCase();

  for (const keyword in KEYWORD_MAP) {
    if (lowerDesc.includes(keyword)) {
      const { purpose, category, member } = KEYWORD_MAP[keyword];
      return { purpose, category, member };
    }
  }

  const defaultCategory = CATEGORIES_BY_PURPOSE[PURPOSES[0]][0];
  const defaultMember = "Chồng";
  let purpose = PURPOSES[0];
  let category = defaultCategory;
  let member = defaultMember;

  if (type === "Thu") {
    purpose = "Kinh doanh";
    if (amount < 3000000) {
      category = "Bán vật tư";
    } else if (amount < 10000000) {
      category = "Bảo dưỡng, sửa chữa máy";
    } else {
      category = "Bán máy";
    }
    member = "Chồng";
  } else {
    // type === "Chi"
    if (amount < 400000) {
      purpose = "Ăn uống";
      category = "Đồ ăn vặt";
    } else {
      purpose = "Kinh doanh";
      category = "Vật tư";
    }
    member = "Chồng";
  }

  return { purpose, category, member };
};

/**
 * Phân tích kênh giao dịch dựa trên mô tả.
 * @param description Mô tả giao dịch.
 * @returns Kênh giao dịch.
 */
export const getSmartChannel = (description: string) => {
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

/**
 * Hàm chính để phân tích SMS, sử dụng các parser riêng lẻ.
 * @param smsText Nội dung tin nhắn SMS.
 * @returns Mảng các giao dịch đã được phân tích.
 */
export const parseSms = (smsText: string): Transaction[] => {
  let allTransactions: Transaction[] = [];

  const parsers = [parseVcbSms, parseVtbSms, parseBidvSms, parseMbSms];

  for (const parser of parsers) {
    const results = parser(smsText);
    if (results) {
      allTransactions.push(...results);
    }
  }

  allTransactions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return allTransactions;
};
// //2...............

// import type { Transaction } from "../types";
// import {
//   CATEGORIES_BY_PURPOSE,
//   KEYWORD_MAP,
//   PURPOSES,
//   TRANSACTION_TYPES,
//   CHANNELS,
//   MEMBERS,
//   ACCOUNTS,
// } from "./constants";

// export const parseVcbSms = (smsText: string): Transaction[] => {
//   const regex =
//     /SD TK \d+ ([-+])([\d,]+(?:\.\d+)?)VND luc (\d{2}-\d{2}-\d{4}) \d{2}:\d{2}:\d{2}\.?\s*SD \d{1,3}(?:,\d{3})*(?:\.\d+)?VND\. Ref ([^\.]+)\.(.+?)(?=SD TK \d+|$)/gs;
//   const transactions: Transaction[] = [];
//   const matches = [...smsText.matchAll(regex)];

//   for (const match of matches) {
//     const type = match[1] === "+" ? "Thu" : "Chi";
//     const amount = parseFloat(match[2].replace(/,/g, ""));
//     const dateStr = match[3];
//     const [day, month, year] = dateStr.split("-");
//     const date = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
//     const descriptionBlock = match[5].trim();
//     let cleanedDescription = descriptionBlock;

//     const descriptionRegex =
//       /(?:chuyen tien[^.]*|Thanh toan cho[^.]*|TOPUP Viettel[^.]*|[^.]*?)(?:\.CT tu|\.Vietcombank:|$)/i;
//     const descriptionMatch = descriptionBlock.match(descriptionRegex);
//     if (descriptionMatch) {
//       cleanedDescription = descriptionMatch[0]
//         .replace(/\.CT tu.*$|\.Vietcombank:.*$/, "")
//         .trim();
//     }

//     if (!cleanedDescription) {
//       cleanedDescription = "Giao dịch không rõ";
//     }

//     const { purpose, category, member } = getSmartCategory(
//       cleanedDescription,
//       type,
//       amount
//     );
//     const channel = getSmartChannel(cleanedDescription);

//     transactions.push({
//       amount,
//       type,
//       description: cleanedDescription,
//       date,
//       account: ACCOUNTS[1], // "Tài khoản ngân hàng"
//       purpose,
//       category,
//       member: member || MEMBERS[0], // "Chồng"
//       channel,
//       timestamp: new Date().toISOString(),
//     });
//   }

//   return transactions;
// };

// export const parseVtbSms = (smsText: string): Transaction[] => {
//   const regex =
//     /VietinBank:(\d{2}\/\d{2}\/\d{4}).*?GD:([+-])([\d,]+(?:\.\d+)?)VND.*?ND:(.+?)(?=VietinBank:|$)/g;
//   const transactions: Transaction[] = [];
//   let match;

//   while ((match = regex.exec(smsText)) !== null) {
//     const dateStr = match[1];
//     const [day, month, year] = dateStr.split("/");
//     const date = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
//     const type = match[2] === "+" ? "Thu" : "Chi";
//     const amount = parseFloat(match[3].replace(/,/g, ""));
//     const description = match[4].trim();

//     const { purpose, category, member } = getSmartCategory(
//       description,
//       type,
//       amount
//     );
//     const channel = getSmartChannel(description);

//     transactions.push({
//       amount,
//       type,
//       description,
//       date,
//       account: ACCOUNTS[1], // "Tài khoản ngân hàng"
//       purpose,
//       category,
//       member: member || MEMBERS[0], // "Chồng"
//       channel,
//       timestamp: new Date().toISOString(),
//     });
//   }
//   return transactions;
// };

// export const parseBidvSms = (smsText: string): Transaction[] => {
//   const regex =
//     /TK\d+ tai BIDV ([+-])([\d,]+(?:\.\d+)?)VND vao \d{2}:\d{2} (\d{2}\/\d{2}\/\d{2,4})\.? So du:\d{1,3}(?:,\d{3})*(?:\.\d+)?VND\. ND: (.+?)(?=TK\d+ tai BIDV|$)/g;
//   const transactions: Transaction[] = [];
//   let match;

//   while ((match = regex.exec(smsText)) !== null) {
//     const type = match[1] === "+" ? "Thu" : "Chi";
//     const amount = parseFloat(match[2].replace(/,/g, ""));
//     const dateStr = match[3];
//     const [day, month, year] = dateStr.split("/");
//     const fullYear = year.length === 2 ? `20${year}` : year;
//     const date = `${fullYear}-${month.padStart(2, "0")}-${day.padStart(
//       2,
//       "0"
//     )}`;
//     let cleanedDescription = match[4].trim();

//     const patternsToRemove = [
//       /MB-TKThe :[\d,]+, tai (Techcombank|Vietcombank)\.?/,
//       /O@L_.*?-BIDV D/,
//       /TKThe :[\d,]+, tai TCB\./,
//       /FT\d+/,
//       /REM Tfr Ac:[^ ]+/,
//     ];

//     patternsToRemove.forEach((pattern) => {
//       cleanedDescription = cleanedDescription.replace(pattern, "").trim();
//     });

//     const { purpose, category, member } = getSmartCategory(
//       cleanedDescription,
//       type,
//       amount
//     );
//     const channel = getSmartChannel(cleanedDescription);

//     transactions.push({
//       amount,
//       type,
//       description: cleanedDescription,
//       date,
//       account: ACCOUNTS[1], // "Tài khoản ngân hàng"
//       purpose,
//       category,
//       member: member || MEMBERS[0], // "Chồng"
//       channel,
//       timestamp: new Date().toISOString(),
//     });
//   }

//   return transactions;
// };

// export const parseMbSms = (smsText: string): Transaction[] => {
//   const regex =
//     /BIEN DONG SO DU\s*TK \d+:\s*([+-])(\d+(?:,\d+)?).*?\s*luc\s*(\d{2}:\d{2})\s*ngay\s*(\d{2}\/\d{2}\/\d{4}).*?Noi dung: (.+?)(?=BIEN DONG SO DU|$)/g;
//   const transactions: Transaction[] = [];
//   let match;

//   while ((match = regex.exec(smsText)) !== null) {
//     const type = match[1] === "+" ? "Thu" : "Chi";
//     const amount = parseFloat(match[2].replace(/,/g, ""));
//     const dateStr = match[4];
//     const [day, month, year] = dateStr.split("/");
//     const date = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
//     const description = match[5].trim();

//     const { purpose, category, member } = getSmartCategory(
//       description,
//       type,
//       amount
//     );
//     const channel = getSmartChannel(description);

//     transactions.push({
//       amount,
//       type,
//       description,
//       date,
//       account: ACCOUNTS[1], // "Tài khoản ngân hàng"
//       purpose,
//       category,
//       member: member || MEMBERS[0], // "Chồng"
//       channel,
//       timestamp: new Date().toISOString(),
//     });
//   }
//   return transactions;
// };

// export const getSmartCategory = (
//   description: string,
//   type: "Thu" | "Chi",
//   amount: number
// ): { purpose: string; category: string; member: string | undefined } => {
//   const lowerDesc = description.toLowerCase();

//   for (const [keyword, mapping] of Object.entries(KEYWORD_MAP)) {
//     if (lowerDesc.includes(keyword)) {
//       return {
//         purpose: mapping.purpose,
//         category: mapping.category,
//         member: mapping.member || MEMBERS[0],
//       };
//     }
//   }

//   let purpose = PURPOSES[0]; // "Sinh hoạt"
//   let category = CATEGORIES_BY_PURPOSE[PURPOSES[0]][0]; // Default category
//   let member = MEMBERS[0]; // "Chồng"

//   if (type === "Thu") {
//     purpose = "Thu nhập";
//     if (amount < 3000000) {
//       category = "Bán vật tư";
//     } else if (amount < 10000000) {
//       category = "Bảo dưỡng, sửa chữa máy";
//     } else {
//       category = "Bán máy";
//     }
//   } else {
//     purpose = "Sinh hoạt";
//     if (amount < 400000) {
//       category = "Đồ ăn vặt";
//     } else {
//       category = "Vật tư";
//     }
//   }

//   return { purpose, category, member };
// };

// export const getSmartChannel = (description: string): string => {
//   const lowerDesc = description.toLowerCase();

//   if (
//     lowerDesc.includes("thanh toan") ||
//     lowerDesc.includes("shopee") ||
//     lowerDesc.includes("lazada") ||
//     lowerDesc.includes("shopeepay") ||
//     lowerDesc.includes("qr pay") ||
//     lowerDesc.includes("zalopay")
//   ) {
//     return CHANNELS[4]; // "Online"
//   } else if (lowerDesc.includes("rut tien") || lowerDesc.includes("atm")) {
//     return CHANNELS[3]; // "Rút tiền"
//   } else if (
//     lowerDesc.includes("chợ") ||
//     lowerDesc.includes("sieuthi") ||
//     lowerDesc.includes("go market")
//   ) {
//     return CHANNELS[2]; // "Siêu thị"
//   } else if (lowerDesc.includes("phi thuong nien")) {
//     return CHANNELS[5]; // "Phí thẻ"
//   }
//   return CHANNELS[1]; // "Chuyển khoản"
// };

// export const parseSms = (smsText: string): Transaction[] => {
//   const lowerCaseSms = smsText.toLowerCase().replace(/\s+/g, " ").trim();
//   let allTransactions: Transaction[] = [];

//   const segments = lowerCaseSms.split(
//     /(?=sd tk \d+|vietinbank|tk\d+ tai bidv|bien dong so du)/
//   );
//   const parsers = [
//     { pattern: /sd tk \d+/, parser: parseVcbSms },
//     { pattern: /vietinbank/, parser: parseVtbSms },
//     { pattern: /tk\d+ tai bidv/, parser: parseBidvSms },
//     { pattern: /bien dong so du/, parser: parseMbSms },
//   ];

//   for (const segment of segments) {
//     if (segment.trim() === "") continue;
//     for (const { pattern, parser } of parsers) {
//       if (pattern.test(segment)) {
//         const results = parser(segment);
//         if (results) {
//           allTransactions.push(...results);
//         }
//         break;
//       }
//     }
//   }

//   if (allTransactions.length === 0) {
//     const amountMatch = lowerCaseSms.match(
//       /([+-]\d{1,3}(?:,\d{3})*(?:\.\d+)?)/
//     );
//     if (amountMatch) {
//       const amount = parseFloat(
//         amountMatch[0].replace(/[^0-9,-]/g, "").replace(",", ".")
//       );
//       const type = amountMatch[0].startsWith("+") ? "Thu" : "Chi";
//       const { purpose, category, member } = getSmartCategory(
//         lowerCaseSms,
//         type,
//         Math.abs(amount)
//       );
//       const channel = getSmartChannel(lowerCaseSms);

//       allTransactions.push({
//         amount: Math.abs(amount),
//         type,
//         description: smsText,
//         date: new Date().toISOString().slice(0, 10),
//         account: ACCOUNTS[1],
//         purpose,
//         category,
//         member: member || MEMBERS[0],
//         channel,
//         timestamp: new Date().toISOString(),
//       });
//     }
//   }

//   allTransactions.sort(
//     (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
//   );

//   if (allTransactions.length > 100) {
//     console.warn(
//       "Cảnh báo: Số lượng giao dịch vượt quá 100, chỉ lấy 100 giao dịch đầu."
//     );
//     allTransactions = allTransactions.slice(0, 100);
//   }

//   return allTransactions;
// };
