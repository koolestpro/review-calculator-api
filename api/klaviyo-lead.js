export default async function handler(req, res) {
  // Allow CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, revision");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      email,
      currentScore,
      totalReviews,
      targetScore,
      reviewsNeeded,
      pageUrl
    } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const klaviyoRes = await fetch("https://a.klaviyo.com/api/events/", {
      method: "POST",
      headers: {
        "Authorization": `Klaviyo-API-Key ${process.env.KLAVIYO_PRIVATE_KEY}`,
        "Content-Type": "application/json",
        "revision": "2024-10-15" // ✅ FIX
      },
      body: JSON.stringify({
        data: {
          type: "event",
          attributes: {
            metric: {
              data: {
                type: "metric",
                attributes: {
                  name: "Review Calculator Submitted" // ✅ ACTIVE METRIC
                }
              }
            },
            profile: {
              data: {
                type: "profile",
                attributes: {
                  email
                }
              }
            },
            properties: {
              currentScore,
              totalReviews,
              targetScore,
              reviewsNeeded,
              pageUrl
            }
          }
        }
      })
    });

    const text = await klaviyoRes.text();

    if (!klaviyoRes.ok) {
      console.error("Klaviyo error:", text);
      return res.status(400).json({ error: "Klaviyo request failed" });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
