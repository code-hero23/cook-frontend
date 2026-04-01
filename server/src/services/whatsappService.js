const axios = require('axios');

/**
 * WhatsApp Service for Unified Cookscape
 * Integrated with Meta Graph API (WhatsApp Cloud API)
 */

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

/**
 * Sends the cookscape_review_request_media template to a customer
 * @param {string} phoneNumber - Customer phone number (with country code, no +)
 * @param {string} clientName - Customer name for the template parameter
 */
exports.sendReviewTemplate = async (phoneNumber, clientName) => {
    if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
        console.error('[WhatsApp] Missing credentials in .env');
        return { success: false, error: 'Missing credentials' };
    }

    // Clean phone number: remove +, spaces, dashes. Ensure it has 91 prefix if 10 digits
    let cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length === 10) {
        cleanPhone = '91' + cleanPhone;
    }

    const url = `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`;

    const data = {
        messaging_product: "whatsapp",
        to: cleanPhone,
        type: "template",
        template: {
            name: "cookscape_review_request_media",
            language: {
                code: "en"
            },
            components: [
                {
                    type: "body",
                    parameters: [
                        {
                            type: "text",
                            text: clientName
                        }
                    ]
                }
            ]
        }
    };

    try {
        const response = await axios.post(url, data, {
            headers: {
                'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`[WhatsApp] Template sent to ${cleanPhone}:`, response.data);
        return { success: true, data: response.data };
    } catch (error) {
        console.error(`[WhatsApp] Error sending template to ${cleanPhone}:`, error.response?.data || error.message);
        return { success: false, error: error.response?.data || error.message };
    }
};
