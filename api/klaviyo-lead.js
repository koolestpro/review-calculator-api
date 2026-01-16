export default async function handler(req, res) {
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

    const KLAVIYO_KEY = process.env.KLAVIYO_PRIVATE_KEY;

    /* 1️⃣ CREATE / UPDATE PROFILE */
    await fetch("https://a.klaviyo.com/api/profiles/", {
      method: "POST",
      headers: {
        "Authorization": `Klaviyo-API-Key ${KLAVIYO_KEY}`,
        "Content-Type": "application/json",
        "revision": "2023-10-15"
      },
      body: JSON.stringify({
        data: {
          type: "profile",
          attributes: {
            email,
            properties: {
              current_score: currentScore,
              total_reviews: totalReviews,
              target_score: targetScore,
              reviews_needed: reviewsNeeded,
              source: "Google Review Calculator",
              page_url: pageUrl
            }
          }
        }
      })
    });

    /* 2️⃣ SEND EVENT (TRIGGERS EMAIL) */
    await fetch("https://a.klaviyo.com/api/events/", {
      method: "POST",
      headers: {
        "Authorization": `Klaviyo-API-Key ${KLAVIYO_KEY}`,
        "Content-Type": "application/json",
        "revision": "2023-10-15"
      },
      body: JSON.stringify({
        data: {
          type: "event",
          attributes: {
            profile: {
              email
            },
            metric: {
              name: "Review Calculator Submitted"
            },
            properties: {
              current_score: currentScore,
              total_reviews: totalReviews,
              target_score: targetScore,
              reviews_needed: reviewsNeeded,
              page_url: pageUrl
            }
          }
        }
      })
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Klaviyo submission failed" });
  }
}
