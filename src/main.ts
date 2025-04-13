/* eslint-disable */
import { listMessages, hmac256Signature } from './functions';
const main = () => {
  const digestMessage = hmac256Signature('Hello', 'secret');
  Logger.log(`Hello World ${digestMessage}`);
  const userId = 'me';
  const timeAfter = new Date('2025-04-01T06:00:00Z').getTime();
  const timeBefore = new Date('2025-04-02T06:15:00Z').getTime();

  listMessages(userId, timeAfter, timeBefore);
};

(global as any).main = main;
