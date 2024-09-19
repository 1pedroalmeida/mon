//TODO accounts
//TODO automatic transactions
//TODO savings

import {
  decode,
  encode,
  formatDate,
  getBalance,
  getFileData,
  printBannerMsg,
} from "./utils.ts";

const appdata = Deno.env.get("LOCALAPPDATA");
const folder = appdata + "\\mon\\";
const filePath = folder + ".mon";

try {
  Deno.statSync(filePath);
} catch (_err) {
  try {
    Deno.statSync(folder);
  } catch (_err) {
    await Deno.mkdir(folder);
  }

  await Deno.create(filePath);
  Deno.writeTextFileSync(filePath, "");
}

let data = getFileData(filePath);
let balance = getBalance(data);

if (isNaN(balance)) {
  Deno.stdout.writeSync(
    encode("\u001b[31merror\u001b[0m: .mon file is corrupted"),
  );
  Deno.exit(1);
}

printBannerMsg(balance);

while (true) {
  const date = new Date();
  const buf = new Uint8Array(1024);

  Deno.stdout.writeSync(encode("> "));

  const n = await Deno.stdin.read(buf);

  if (n !== null) {
    const input = decode(buf.subarray(0, n)).replace("\n", "").replace(
      "\r",
      "",
    );

    if (["history", "h"].includes(input)) {
      Deno.stdout.writeSync(encode(getFileData(filePath)));
      continue;
    }

    if (["clear", "c"].includes(input)) {
      Deno.writeTextFileSync(filePath, `[${formatDate(date)}]${balance}\n`);
      printBannerMsg(balance, "History has been cleared");
      continue;
    }

    if (["reset", "R"].includes(input)) {
      Deno.writeTextFileSync(filePath, "");
      printBannerMsg(0, "Account balance has been reset");
      continue;
    }

    if (["quit", "q"].includes(input)) {
      Deno.stdout.writeSync(encode("\u001bc"));

      Deno.exit(0);
    }

    if (isNaN(Number(input))) {
      Deno.stdout.writeSync(
        encode(`\u001b[31merror\u001b[0m: '${input}' is not a number\n`),
      );
      continue;
    }

    if (Number(input) == 0) {
      continue;
    }

    Deno.writeTextFileSync(
      filePath,
      `[${formatDate(date)}]${decode(buf.subarray(0, n))}`,
      { append: true },
    );

    data = getFileData(filePath);
    balance = getBalance(data);

    printBannerMsg(
      balance,
      Number(input) > 0
        ? `Added +${input}€ to the balance`
        : `Removed ${input}€ from the balance`,
    );
  }
}
