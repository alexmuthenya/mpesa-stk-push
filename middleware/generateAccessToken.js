import "dotenv/config";

export const accessToken = async (req, res, next) => {
  try {
    const url =
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
    const auth = Buffer.from(
      `${process.env.SAFARICOM_CONSUMER_KEY}:${process.env.SAFARICOM_CONSUMER_SECRET}`,
    ).toString("base64");

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    req.safaricom_access_token = data.access_token;
    next();
  } catch (error) {
    console.error("Access token error:", error);
    res.status(401).send({
      message: "Something went wrong when trying to process your payment",
      error: error.message,
    });
  }
};
