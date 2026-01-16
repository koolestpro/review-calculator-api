export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      email,
      current_score,
      total_reviews,
      target_score,
      reviews_needed,
      page
    } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const klaviyoResponse = await fetch(
      "https://a.klaviyo.com/api/profiles/",
      {
        method: "POST",
        headers: {
          "Authorization": `Klaviyo-API-Key ${process.env.KLAVIYO_PRIVATE_KEY}`,
          "Content-Type": "application/json",
          "revision": "2024-02-15"
        },
        body: JSON.stringify({
          data: {
            type: "profile",
            attributes: {
              email,
              current_score,
              total_reviews,
              target_score,
              reviews_needed,
              page,
              source: "Google Review Calculator"
            }
          }
        })
      }
    );

    if (!klaviyoResponse.ok) {
      const errorText = await klaviyoResponse.text();
      console.error(errorText);
      return res.status(500).json({ error: "Klaviyo API failed" });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}

