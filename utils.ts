const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function encode(x: string) {
  return encoder.encode(x);
}
export function decode(x: BufferSource) {
  return decoder.decode(x);
}

export function getFileData(file: string | URL) {
  return Deno.readTextFileSync(file);
}

export function formatDate(date: Date) {
  return date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() +
    "." + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}

export function getBalance(data: string) {
  return Math.round(
    (data.split("\n").map((x) => {
      const substring = x.substring(x.indexOf("]")).replace("]", "").replace(
        "\r",
        "",
      );
      return Number(substring);
    }).reduce((a, b) => {
      return a + b;
    }, 0) + Number.EPSILON) * 100,
  ) / 100;
}

export function printBannerMsg(balance: number, message?: string) {
  Deno.stdout.writeSync(encode("\u001bc"));
  Deno.stdout.writeSync(
    encode(
      ` ------------------------------ MON v0.0.3 ------------------------------ \n`,
    ),
  );
  Deno.stdout.writeSync(
    encode(
      "  Quick help: \u001b[32m<h>\u001b[0m:History \u001b[32m<c>\u001b[0m: Clear history \u001b[32m<R>\u001b[0m:Reset balance \u001b[32m<q>\u001b[0m:Quit\n",
    ),
  );
  Deno.stdout.writeSync(encode(`  Balance: ${balance}€\n`));

  if (message) {
    Deno.stdout.writeSync(encode(`  \u001b[34mInfo\u001b[0m: ${message}\n`));
  }

  Deno.stdout.writeSync(
    encode(
      " ------------------------------------------------------------------------ \n",
    ),
  );
}
