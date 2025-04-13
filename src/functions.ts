import { HmacSHA256, enc } from 'crypto-js';
import { GmailMessageSchema } from "./dataclass"

function hmac256Signature(message: string, secret: string): string {
  const hashedMessage = HmacSHA256(message, secret);
  const signature = enc.Base64.stringify(hashedMessage);

  return signature;
}

function extractFromHeader(headers: { name: string; value: string }[]): string {
  const fromHeader = headers.find(h => h.name.toLowerCase() === 'from');
  return fromHeader?.value || 'Unknown Sender';
}


function listMessages(userId: string, timeAfter: number, timeBefore: number): void {
  // Step 1: Rough query with day-level filtering to minimize results
  const afterDate = new Date(timeAfter).toISOString().slice(0, 10).replace(/-/g, '/'); // YYYY/MM/DD
  const beforeDate = new Date(timeBefore).toISOString().slice(0, 10).replace(/-/g, '/'); // YYYY/MM/DD
  const query = `after:${afterDate} before:${beforeDate}`;

  let pageToken: string | undefined = undefined;

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

    for (const msg of messages) {
      const rawMessage = Gmail.Users?.Messages?.get(userId, msg.id!);
      if (!rawMessage) continue;

      const parseResult = GmailMessageSchema.safeParse(rawMessage);
      if (!parseResult.success) {
        Logger.log(`Invalid message schema: ${parseResult.error}`);
        continue;
      }

      const message = parseResult.data;
      const internalDate = message.internalDate;
      if (internalDate >= timeAfter && internalDate <= timeBefore) {
        const from = extractFromHeader(message.payload.headers);
        Logger.log(`From: ${from}, ID: ${message.id}, Time: ${new Date(internalDate).toISOString()}, Snippet: ${message.snippet}`);
      }
    }


    pageToken = response?.nextPageToken;
  } while (pageToken);
}

export { listMessages, hmac256Signature };
