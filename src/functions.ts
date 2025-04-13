function listMessages(userId: string, timeAfter: number, timeBefore: number) {
  // Step 1: Rough query with day-level filtering to minimize results
  const afterDate = new Date(timeAfter).toISOString().slice(0, 10).replace(/-/g, "/"); // YYYY/MM/DD
  const beforeDate = new Date(timeBefore).toISOString().slice(0, 10).replace(/-/g, "/"); // YYYY/MM/DD
  const query = `after:${afterDate} before:${beforeDate}`;

  let pageToken: string | undefined = undefined;

  do {
    const response: GoogleAppsScript.Gmail.Schema.ListMessagesResponse | undefined = Gmail.Users?.Messages?.list(userId, {
      q: query,
      pageToken,
    });

    if (!response) {
      Logger.log("No email")
    }

    const messages = response?.messages || [];

    for (const msg of messages) {
      const fullMessage = Gmail.Users?.Messages?.get(userId, msg.id!);
      const internalDate = parseInt(fullMessage?.internalDate || "0", 10);

      if (internalDate >= timeAfter && internalDate <= timeBefore) {
        Logger.log(`Message ID: ${msg.id}, Timestamp: ${new Date(internalDate).toISOString()}`);
        const message = Gmail.Users?.Messages?.get(userId, msg.id!);
        Logger.log(`Message ID: ${msg.id}, Snippet: ${message?.snippet}`);
      }
    }

    pageToken = response?.nextPageToken;
  } while (pageToken);
}


export { listMessages };
