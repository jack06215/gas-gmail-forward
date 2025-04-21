/* eslint-disable */
import { listMessages, hmac256Signature, listSMBCTransactions } from './functions';
import dayjs from "./lib/dayjs";
const main = () => {
  const digestMessage = hmac256Signature('Hello', 'secret');
  Logger.log(`Hello World ${digestMessage}`);
  const userId = 'me';
  const now = dayjs().toISOString();
  const timeAfter = dayjs(now).subtract(1, "day").set("hour", 0).set("minute", 0).set("second", 0);
  const timeBefore = dayjs(now)
  console.log(`${timeAfter} ~ ${timeBefore}`)
  const res = listSMBCTransactions(userId, timeAfter, timeBefore);
  console.log(JSON.stringify(res, null, 4));
};

(global as any).main = main;
