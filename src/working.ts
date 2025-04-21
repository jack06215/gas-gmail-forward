import dayjs from "dayjs";

function main() {
  const now = dayjs();
  const createdBefore = now
  const createdAfter = now.subtract(1, "day");
  console.log(`Hello ${createdAfter.format("YYYY/MM/DD")} ~ ${createdBefore.format("YYYY/MM/DD")}`);
}

main();
