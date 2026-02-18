import ngrok from "@ngrok/ngrok";
import "dotenv/config";
import getTimestamp from "../utils/timestamp.js";

export const initiateSTKPush = async (req, res) => {
  try {
    const { amount, phone, Order_ID } = req.body;
    const url =
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
    const auth = "Bearer " + req.safaricom_access_token;

    const timestamp = getTimestamp();
    const password = Buffer.from(
      process.env.BUSINESS_SHORT_CODE + process.env.PASS_KEY + timestamp,
    ).toString("base64");

    // create callback URL via ngrok
    const listener = await ngrok.connect({
      addr: process.env.PORT,
      authtoken: process.env.NGROK_AUTHTOKEN,
    });
    const callback_url = listener.url();
    console.log("callback URL:", callback_url);

    // Build request body
    const body = {
      BusinessShortCode: process.env.BUSINESS_SHORT_CODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: process.env.BUSINESS_SHORT_CODE,
      PhoneNumber: phone,
      CallBackURL: `${callback_url}/api/stkPushCallback/${Order_ID}`,
      AccountReference: "Mordor",
      TransactionDesc: "Paid online",
    };

    // Send POST request using fetch
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP error! Status: ${response.status}, Response: ${errorText}`,
      );
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (e) {
    console.error("Error occurred ", e);
    res.status(503).json({
      message: "Service temporarily unavailable",
    });
  }
};

export const stkPushCallback = async (req, res) => {
  try {
    const { Order_ID } = req.params;

    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    } = req.body.Body.stkCallback;

    // Extract items from CallbackMetadata for processing
    const metadataItems = CallbackMetadata?.Item || [];
    if (metadataItems.length > 0) {
      const PhoneNumber = metadataItems
        .find((item) => item.Name === "PhoneNumber")
        ?.Value?.toString();
      const Amount = metadataItems
        .find((item) => item.Name === "Amount")
        ?.Value?.toString();
      const MpesaReceiptNumber = metadataItems
        .find((item) => item.Name === "MpesaReceiptNumber")
        ?.Value?.toString();
      const TransactionDate = metadataItems
        .find((item) => item.Name === "TransactionDate")
        ?.Value?.toString();
      console.log(
        `Payment successful: ${PhoneNumber}, ${Amount}, ${MpesaReceiptNumber}, ${TransactionDate}`,
      );
    } else {
      console.log(`Payment not completed: ${ResultDesc}`);
    }

    res.json(true);
  } catch (e) {
    console.error("STK Push callback processing error:", e);
    res.status(503).json({
      message: "Service temporarily unavailable, please retry",
    });
  }
};
