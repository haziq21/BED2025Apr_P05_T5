const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

/**
 * Send a WhatsApp template message using the WhatsApp Business API
 * @param {string} to - The recipient's phone number 
 * @returns {Promise<Object>} 
 * @param {string} [medicationName]
 * @param {string} [time]
 */
export async function sendWhatsAppTemplate(to, medicationName, time) {
  const url = `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`;

  const data = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: "appointment_reminder",
      language: { code: "en_US" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: medicationName },
            { type: "text", text: time },
          ],
        },
      ],
    },
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    return json;
  } catch (err) {
    console.error("Failed to send WhatsApp message:", err);
    throw err;
  }
}

