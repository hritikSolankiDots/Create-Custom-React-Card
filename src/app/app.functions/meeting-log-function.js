const axios = require('axios');


exports.main = async (context = {}) => {
  const HUBSPOT_API_BASE = 'https://api.hubapi.com';
  const ACCESS_TOKEN = process.env.PRIVATE_APP_ACCESS_TOKEN;
  const { action, text, ...params } = context.parameters;

  try {
    if (action === 'fetchContact') {

      const contact = await fetchContact(params.contactId, ACCESS_TOKEN, HUBSPOT_API_BASE);
      return contact;
    }

    if (action === 'logMeeting') {
      const message = await logMeeting(params, ACCESS_TOKEN, HUBSPOT_API_BASE);
      return message;
    }

    // Default echo fallback
    return `This is coming from a serverless function! You entered: ${text}`;
  } catch (error) {
    return `Error: ${error.message}`;
  }
};

// Fetch a contact by ID
async function fetchContact(contactId, ACCESS_TOKEN, HUBSPOT_API_BASE) {
  if (!contactId) throw new Error("Missing contactId");

  const headers = {
    Authorization: `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  };

  try {
    const url = `${HUBSPOT_API_BASE}/crm/v3/objects/contacts/${contactId}`;
    const params = {
      properties: ['firstname', 'lastname', 'email', 'phone'],
    };

    // Fetch main contact
    const contactRes = await axios.get(url, { headers, params });

    const contacts = [
      {
        objectId: contactRes.data.id,
        ...contactRes.data.properties,
        isMain: true, // ✅ Mark as main contact
      },
    ];

    // Fetch associated contact IDs
    const assocUrl = `${HUBSPOT_API_BASE}/crm/v4/objects/contacts/${contactId}/associations/contacts`;
    const assocRes = await axios.get(assocUrl, { headers });

    const associatedIds = assocRes.data.results.map(r => r.toObjectId);

    // Fetch associated contacts
    for (const assocId of associatedIds) {
      try {
        const assocContactUrl = `${HUBSPOT_API_BASE}/crm/v3/objects/contacts/${assocId}`;
        const assocRes = await axios.get(assocContactUrl, { headers, params });

        contacts.push({
          objectId: assocRes.data.id,
          ...assocRes.data.properties,
          isMain: false, // ✅ Mark as associated
        });
      } catch (err) {
        console.warn(`Failed to fetch associated contact ${assocId}:`, err.message);
      }
    }

    return contacts;

  } catch (error) {
    console.error("Error fetching contacts:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch contact and associations"
    );
  }
}


// Log a meeting engagement
async function logMeeting({ attendees, outcome, date, time, duration, description, contactId }, ACCESS_TOKEN, HUBSPOT_API_BASE) {
  const startTime = new Date(`${date}T${time}`).getTime();
  const endTime = startTime + parseInt(duration) * 60000;

  const url = `${HUBSPOT_API_BASE}/engagements/v1/engagements`;

  const payload = {
    engagement: {
      active: true,
      type: 'MEETING',
      timestamp: startTime,
    },
    associations: {
      contactIds: [contactId],
    },
    metadata: {
      startTime,
      endTime,
      title: `Meeting with ${attendees}`,
    },
    body: description,
  };

  await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  return 'Meeting successfully logged!';
}
