const BASE_URL = "http://20.207.122.201/evaluation-service";

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJjaC5zYy51NGNzZTIzMTM5QGNoLnN0dWRlbnRzLmFtcml0LmVkdSIsImV4cCI6MTc3ODA1ODUyNSwiaWF0IjoxNzc4MDU3NjI1LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiNjBmZTJhYjUtZGYyYS00MmU4LTgzNjYtMTRmMDEzYTQ0ZDZlIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoicmFtYXN3YW15IG1vbmlzaGEiLCJzdWIiOiIwM2Q5ZDIzNi01ZWE4LTQxOTUtYjI4NC00ZTY3ZDFkZmVjYWYifSwiZW1haWwiOiJjaC5zYy51NGNzZTIzMTM5QGNoLnN0dWRlbnRzLmFtcml0LmVkdSIsIm5hbWUiOiJyYW1hc3dhbXkgbW9uaXNoYSIsInJvbGxObyI6ImNoLnNjLnU0Y3NlMjMxMzkiLCJhY2Nlc3NDb2RlIjoiUFRCTW1RIiwiY2xpZW50SUQiOiIwM2Q5ZDIzNi01ZWE4LTQxOTUtYjI4NC00ZTY3ZDFkZmVjYWYiLCJjbGllbnRTZWNyZXQiOiJnZEVCclJZcEhYdktDekR1In0.mz47XFxCPOkBaWbfcala7lLfEZJElfyKAUsxr6Qrpfw"; // (keep full token)

const TYPE_WEIGHT = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

function toMs(date) {
  return Date.parse(date) || 0;
}

function priorityScore(n) {
  const weight = TYPE_WEIGHT[n.type] || 0;
  return weight * 1e12 + toMs(n.createdAt);
}

async function fetchNotifications() {
  const url = `${BASE_URL}/notifications`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": TOKEN,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }

  return await res.json();
}

function getTop10(notifications) {
  return notifications
    .sort((a, b) => priorityScore(b) - priorityScore(a))
    .slice(0, 10);
}

async function main() {
  try {
    const data = await fetchNotifications();

    const notifications = Array.isArray(data)
      ? data
      : data.notifications || data.items || [];

    const top10 = getTop10(notifications);

    console.log("\n=== TOP 10 PRIORITY NOTIFICATIONS ===\n");

    top10.forEach((n, i) => {
      console.log(
        `${i + 1}. ${n.type} | ${n.createdAt} | ${n.id}`
      );
      console.log(`   ${n.title || ""}`);
    });

    console.log("\n=== END ===\n");

  } catch (err) {
    console.error("Error:", err.message);
  }
}

main();