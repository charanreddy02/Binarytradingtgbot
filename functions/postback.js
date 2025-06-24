let verifiedUserIds = [];

exports.handler = async (event) => {
  const { status, uid, payout } = event.queryStringParameters;

  if (status === "true" && uid) {
    verifiedUserIds.push(uid);

    return {
      statusCode: 200,
      body: `✅ UID ${uid} verified successfully with payout $${payout || 0}`,
    };
  }

  return {
    statusCode: 400,
    body: "❌ Invalid or missing data.",
  };
};

// You can export verifiedUserIds for checking in your bot logic
module.exports.verifiedUserIds = verifiedUserIds;
