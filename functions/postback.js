const fs = require("fs");
const path = require("path");

// Path to store verified trader IDs
const filePath = path.join(__dirname, "verified-ids.json");

// Load IDs from file or create if it doesn't exist
const loadIds = () => {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch {
    fs.writeFileSync(filePath, JSON.stringify([]));
    return [];
  }
};

// Save updated ID list
const saveIds = (ids) => {
  fs.writeFileSync(filePath, JSON.stringify(ids, null, 2));
};

// Netlify Function handler
exports.handler = async (event) => {
  const { trader_id, status } = event.queryStringParameters || {};

  if (trader_id && status === "true") {
    const ids = loadIds();

    // Add only if not already in list
    if (!ids.includes(trader_id)) {
      ids.push(trader_id);
      saveIds(ids);
      console.log(`✅ Verified ID saved: ${trader_id}`);
    } else {
      console.log(`ℹ️ ID ${trader_id} already exists.`);
    }

    return {
      statusCode: 200,
      body: "✅ Postback received and processed.",
    };
  }

  // If missing or invalid data
  return {
    statusCode: 400,
    body: "❌ Invalid postback data.",
  };
};
