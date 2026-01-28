import { refreshFeeds } from "@/lib/refresh";

async function main() {
  const res = await refreshFeeds();
  console.log(JSON.stringify({ ok: true, ...res }));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
