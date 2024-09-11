//TODO accounts
//TODO automatic transactions
//TODO savings

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

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function encode(x: string) {
  return encoder.encode(x);
}
function decode(x: BufferSource) {
  return decoder.decode(x);
}

function getFileData(file: string | URL) {
  return Deno.readTextFileSync(file);
}

function formatDate(date: Date) {
  return date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() +
    "." + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}

function getBalance(data: string) {
  return data.split("\n").map((x) =>
    Number(x.substring(x.indexOf("]")).replace("]", "").replace("\r", ""))
  ).reduce((a, b) => {
    return a + b;
  }, 0);
}

function printStartMsg(balance: number, change?: boolean, changes?: string) {
  Deno.stdout.writeSync(encode("\u001bc"));
  Deno.stdout.writeSync(encode(`=============== MON v0.0.1 ===============\n`));
  Deno.stdout.writeSync(
    encode(
      " Quick help: \u001b[32m<h>\u001b[0m:History \u001b[32m<c>\u001b[0m: Clear history \u001b[32m<q>\u001b[0m:Quit\n",
    ),
  );
  Deno.stdout.writeSync(encode(` Balance: ${balance}€\n`));

  if (change) {
    Deno.stdout.writeSync(encode(` Last change: ${changes}€\n`));
  }

  Deno.stdout.writeSync(encode("==========================================\n"));
}

let data = getFileData(filePath);
let balance = getBalance(data);

printStartMsg(balance);

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
      //TODO history
      Deno.stdout.writeSync(encode(getFileData(filePath)));
      continue;
    }

    if (["clear", "c"].includes(input)) {
      Deno.writeTextFileSync(filePath, `[${formatDate(date)}]${balance}\n`);
      Deno.stdout.writeSync(encode("History has been cleared\n"));
      continue;
    }

    if (["quit", "q"].includes(input)) {
      Deno.exit();
    }

    if (isNaN(Number(input))) {
      Deno.stdout.writeSync(encode("error: input is not a number\n"));
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

    printStartMsg(balance, true, Number(input) > 0 ? "+" + input : input);
  }
}
