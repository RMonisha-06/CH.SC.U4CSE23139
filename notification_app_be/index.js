const BASE_URL = "http://20.207.122.201/evaluation-service";

const RAW_TOKEN = process.env.NOTIF_ACCESS_TOKEN || "";
const TOKEN = RAW_TOKEN.startsWith("Bearer ")
  ? RAW_TOKEN
  : (RAW_TOKEN ? `Bearer ${RAW_TOKEN}` : "");

const TYPE_WEIGHT = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

function toMs(date) {
  const t = Date.parse(date);
  return Number.isFinite(t) ? t : 0;
}

function getType(n) {
  return n.type || n.notificationType;
}

function priorityScore(n) {
  const type = getType(n);
  const weight = TYPE_WEIGHT[type] || 0;
  return weight * 1e12 + toMs(n.createdAt);
}

async function fetchNotifications() {
  const url = `${BASE_URL}/notifications`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      ...(TOKEN ? { Authorization: TOKEN } : {}),
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API Error: ${res.status} ${res.statusText} ${text}`);
  }

  return await res.json();
}

function extractNotifications(data) {
  if (Array.isArray(data)) return data;
  return data?.notifications || data?.items || data?.data || [];
}

function getTop10(notifications) {
  return [...notifications]
    .filter(Boolean)
    .sort((a, b) => priorityScore(b) - priorityScore(a))
    .slice(0, 10);
}

async function main() {
  try {
    if (!TOKEN) {
      console.warn(
        "WARN: NOTIF_ACCESS_TOKEN is not set. If your API requires auth, set it before running."
      );
    }

    const data = await fetchNotifications();
    const notifications = extractNotifications(data);

    const top10 = getTop10(notifications);

    console.log("\n=== TOP 10 PRIORITY NOTIFICATIONS (unread or returned set) ===\n");

    top10.forEach((n, i) => {
      const type = getType(n);
      console.log(`${i + 1}. ${type || "UNKNOWN"} | createdAt=${n.createdAt} | id=${n.id || n.notificationId || "-"}`);
      if (n.title) console.log(`    title: ${n.title}`);
      if (n.message) console.log(`    message: ${n.message}`);
    });

    console.log("\n=== END ===\n");
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

main();

