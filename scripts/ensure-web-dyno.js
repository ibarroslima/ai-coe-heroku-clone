const APP_NAME = process.env.APP_NAME || "";
const PLATFORM_API_TOKEN = process.env.PLATFORM_API_TOKEN || "";

async function herokuRequest(path, options = {}) {
  const response = await fetch(`https://api.heroku.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${PLATFORM_API_TOKEN}`,
      Accept: "application/vnd.heroku+json; version=3",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Heroku API ${response.status}: ${body}`);
  }
  return response.json();
}

async function ensureWebDyno() {
  if (!APP_NAME || !PLATFORM_API_TOKEN) {
    throw new Error("Missing APP_NAME or PLATFORM_API_TOKEN.");
  }

  const formation = await herokuRequest(`/apps/${APP_NAME}/formation`);
  const web = formation.find((item) => item.type === "web");
  if (!web) {
    throw new Error("No web process type found in app formation.");
  }

  if (Number(web.quantity) > 0) {
    console.log(`web dyno already running (quantity=${web.quantity}).`);
    return;
  }

  await herokuRequest(`/apps/${APP_NAME}/formation/web`, {
    method: "PATCH",
    body: JSON.stringify({ quantity: 1 }),
  });
  console.log("web dyno scaled to 1.");
}

ensureWebDyno().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
