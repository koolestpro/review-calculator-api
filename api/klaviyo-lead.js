export default async function handler(req, res) {
  // ✅ CORS HEADERS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ❌ Block non-POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      email,
      current_score,
      total_reviews,
      target_score,
      reviews_needed
    } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // 🔑 SEND TO KLAVIYO
    const response = await fetch("https://a.klaviyo.com/api/events/", {
      method: "POST",
      headers: {
        "Authorization": `Klaviyo-API-Key ${process.env.KLAVIYO_PRIVATE_KEY}`,
        "Content-Type": "application/json",
        "revision": "2023-02-22"
      },
      body: JSON.stringify({
        data: {
          type: "event",
          attributes: {
            metric: {
              data: {
                type: "metric",
                attributes: {
                  name: "Review Calculator Submitted"
                }
              }
            },
            profile: {
              data: {
                type: "profile",
                attributes: {
                  email: email
                }
              }
            },
            properties: {
              current_score,
              total_reviews,
              target_score,
              reviews_needed,
              page: req.headers.origin || "unknown"
            }
          }
        }
      })
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
