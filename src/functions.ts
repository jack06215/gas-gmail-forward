import { HmacSHA256, enc } from 'crypto-js';
import { GmailMessage, GmailRawMessageSchema, parseTransactionInfo, TransactionInfo } from "./dataclass"
import dayjs from "./lib/dayjs";

function hmac256Signature(message: string, secret: string): string {
  const hashedMessage = HmacSHA256(message, secret);
  const signature = enc.Base64.stringify(hashedMessage);

  return signature;
}

function extractSendFrom(headers: { name: string; value: string }[]): string {
  const fromHeader = headers.find(h => h.name.toLowerCase() === 'from');
  return fromHeader?.value || 'Unknown Sender';
}


function listMessages(
  userId: string,
  timeAfter: dayjs.Dayjs,
  timeBefore: dayjs.Dayjs,
  filter?: {
    from?: string,
    keyword?: string,
  }
): GmailMessage[] {
  const timeFormat = "YYYY/MM/DD";
  const parts = [
    `after:${timeAfter.format(timeFormat)}`,
    `before:${timeBefore.format(timeFormat)}`,
  ];
  if (filter?.from) parts.push(`from:${filter.from}`);

  const query = parts.join(" ");

  let pageToken: string | undefined = undefined;
  const res: GmailMessage[] = [];
  do {
    const response: GoogleAppsScript.Gmail.Schema.ListMessagesResponse | undefined = Gmail.Users?.Messages?.list(
      userId,
      {
        q: query,
        pageToken,
      },
    );

    if (!response) {
      Logger.log('No email');
    }

    const messages = response?.messages || [];
    console.warn(`Len: ${messages.length}`)
    for (const msg of messages) {
      const rawMessage = Gmail.Users?.Messages?.get(userId, msg.id!);
      if (!rawMessage) continue;

      const parseResult = GmailRawMessageSchema.safeParse(rawMessage);
      if (!parseResult.success) {
        Logger.log(`Invalid message schema: ${parseResult.error}`);
        continue;
      }

      const message = parseResult.data;
      const internalDate = dayjs(message.internalDate);
      const from = extractSendFrom(message.payload.headers);
      res.push({
        from: from,
        snippet: message.snippet ?? "",
        time: internalDate,
      })
    }


    pageToken = response?.nextPageToken;
  } while (pageToken);
  return res;
}

function listSMBCTransactions(
  userId: string,
  timeAfter: dayjs.Dayjs,
  timeBefore: dayjs.Dayjs,
): TransactionInfo[] {
  const messages = listMessages(userId, timeAfter, timeBefore, { from: "smbc-debit@smbc-card.com", });
  const transactions: TransactionInfo[] = [];
  for (const message of messages) {
    const parsedTransaction = parseTransactionInfo(message);
    if (parsedTransaction) {
      transactions.push(parsedTransaction);
    }
  }
  return transactions;
}

export { listMessages, hmac256Signature, listSMBCTransactions };
