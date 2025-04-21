import { z } from 'zod';
import dayjs from "./lib/dayjs";

interface GmailMessage {
  from: string
  time: dayjs.Dayjs
  snippet: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const GmailRawMessageSchema = z.object({
  id: z.string(),
  internalDate: z.string().transform(str => parseInt(str, 10)), // convert to number
  snippet: z.string().optional(),
  payload: z.object({
    headers: z.array(
      z.object({
        name: z.string(),
        value: z.string(),
      })
    ),
  }),
});

interface TransactionInfo {
  date: string;      // e.g. "2025/04/19 17:12:25"
  merchant: string;  // e.g. "LIFE CORPORATION"
  amount: number;    // e.g. 1283
}

function parseTransactionInfo(snippet: GmailMessage): TransactionInfo | null {
  // ◎ 利用日 : YYYY/MM/DD HH:mm:ss
  const dateRe = /◇利用日\s*[:：]\s*(\d{4}\/\d{2}\/\d{2}\s+\d{2}:\d{2}:\d{2})/;
  // ◎ 利用先 : up to the next ◇ or end
  const merchantRe = /◇利用先\s*[:：]\s*([^◇\r\n]+)/;
  // ◎ 利用金額 : digits + "円"
  const amountRe = /◇利用金額\s*[:：]\s*([\d,]+)円/;

  const dateMatch = snippet.snippet.match(dateRe);
  const merchantMatch = snippet.snippet.match(merchantRe);
  const amountMatch = snippet.snippet.match(amountRe);

  if (!dateMatch || !merchantMatch || !amountMatch) {
    // 出力できない場合は null を返す
    return null;
  }

  return {
    date: dateMatch[1].trim(),
    merchant: merchantMatch[1].trim(),
    amount: parseInt(amountMatch[1].replace(/,/g, ""), 10),
  };
}


export {
  GmailMessage,
  GmailRawMessageSchema,
  parseTransactionInfo,
  TransactionInfo,
};
