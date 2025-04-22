const axios = require('axios');

function combineDateTime(dateValue, timeStr) {
  let dateObj;

  // If dateValue is a string, try to create a Date from it.
  if (typeof dateValue === 'string') {
    dateObj = new Date(dateValue);
    if (isNaN(dateObj.getTime())) {
      throw new Error(`Invalid date string provided: ${dateValue}`);
    }
  }
  // If dateValue is already a Date object, clone it.
  else if (dateValue instanceof Date) {
    dateObj = new Date(dateValue.getTime());
  } else {
    throw new Error(`Invalid date value. Received type ${typeof dateValue}`);
  }

  // Parse the time string which should be in "HH:mm" format.
  if (typeof timeStr !== 'string') {
    throw new Error(`Invalid time format. Expected string, received ${typeof timeStr}`);
  }

  const timeParts = timeStr.split(":");
  if (timeParts.length !== 2) {
    throw new Error(`Time string is not in the expected "HH:mm" format: ${timeStr}`);
  }

  const [hours, minutes] = timeParts.map(Number);
  if (isNaN(hours) || isNaN(minutes)) {
    throw new Error(`Invalid numeric time values extracted from: ${timeStr}`);
  }

  dateObj.setHours(hours, minutes, 0, 0);
  return dateObj;
}


// Main function to handle incoming requests
exports.main = async (context = {}) => {
  const HUBSPOT_API_BASE = 'https://api.hubapi.com';
  const ACCESS_TOKEN = process.env.PRIVATE_APP_ACCESS_TOKEN;
  const { user, action, text, ...params } = await context?.parameters;

  try {
    if (action === 'fetchContact') {
      const contact = await fetchContactAndOwner(params.contactId, ACCESS_TOKEN, HUBSPOT_API_BASE);
      return contact;
    }

    if (action === 'fetchDeals') {
      const deals = await fetchDealsForContact(params.contactId, ACCESS_TOKEN, HUBSPOT_API_BASE);
      return deals;
    }

    if (action === 'logMeeting') {
      const message = await logMeeting(params, ACCESS_TOKEN, HUBSPOT_API_BASE, user);
      return message;
    }

    // Default echo fallback
    return `This is coming from a serverless function! You entered: ${text}`;
  } catch (error) {
    return `Error: ${error.message}`;
  }
};

// Fetch contact and owner details
async function fetchContactAndOwner(contactId, ACCESS_TOKEN, HUBSPOT_API_BASE) {
  if (!contactId) throw new Error("Missing contactId");
  const headers = {
    Authorization: `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  };

  try {
    // 1. Fetch the contact
    const contactUrl = `${HUBSPOT_API_BASE}/crm/v3/objects/contacts/${contactId}?properties=firstname,lastname,email,phone,hubspot_owner_id&archived=false`;
    const contactRes = await axios.get(contactUrl, { headers });
    const contact = contactRes.data;


    const formatted = [
      {
        id: contact.id,
        label: `${contact.properties.firstname || ''} ${contact.properties.lastname || ''}`.trim(),
        name: `${contact.properties.firstname || ''} ${contact.properties.lastname || ''}`.trim(),
        email: contact.properties.email,
        phone: contact.properties.phone,
        type: 'contact',
      },
    ];

    // 2. Extract the owner ID (if any)
    const ownerId = contact.properties.hubspot_owner_id;

    if (ownerId) {
      try {
        // 3. Fetch owner details
        const ownerUrl = `${HUBSPOT_API_BASE}/crm/v3/owners/${ownerId}`;
        const ownerRes = await axios.get(ownerUrl, { headers });
        const owner = ownerRes.data;

        formatted.push({
          id: ownerId,
          label: `${owner.firstName || ''} ${owner.lastName || ''}`.trim(),
          name: `${owner.firstName || ''} ${owner.lastName || ''}`.trim(),
          email: owner.email,
          type: 'owner',
        });
      } catch (ownerErr) {
        console.warn(`Failed to fetch owner ${ownerId}:`, ownerErr.message);
      }
    }

    return formatted;
  } catch (error) {
    console.error("Error fetching contact and owner:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch contact and owner"
    );
  }
}

// Fetch deals associated with a contact
async function fetchDealsForContact(contactId, ACCESS_TOKEN, HUBSPOT_API_BASE) {
  if (!contactId) throw new Error("Missing contactId");

  const headers = {
    Authorization: `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  };

  try {
    const assocUrl = `${HUBSPOT_API_BASE}/crm/v4/objects/contacts/${contactId}/associations/deals`;
    const assocRes = await axios.get(assocUrl, { headers });

    const dealIds = assocRes.data.results.map((r) => r.toObjectId);

    const deals = [];

    for (const dealId of dealIds) {
      try {
        const dealUrl = `${HUBSPOT_API_BASE}/crm/v3/objects/deals/${dealId}?properties=dealname,dealstage,amount,closedate`;
        const dealRes = await axios.get(dealUrl, { headers });
        const { id, properties } = dealRes.data;
        deals.push({ dealId: id, dealname: properties.dealname });
      } catch (err) {
        console.warn(`Failed to fetch deal ${dealId}:`, err.message);
      }
    }

    return deals;
  } catch (error) {
    console.error("Error fetching deals for contact:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch deals for contact"
    );
  }
}

// Log a meeting engagement
async function logMeeting(
  { attendees, outcome, date, time, duration, description, contactId, dealId },
  ACCESS_TOKEN,
  HUBSPOT_API_BASE,
  user
) {
  try {
    // Combine date and time safely.
    const parsedDate =
      typeof date === "object" && date.year && date.month && date.date
        ? new Date(date.year, date.month, date.date)
        : date;

    const startDateTime = combineDateTime(parsedDate, time);
    const startTimestamp = startDateTime.getTime();
    const endTimestamp = startTimestamp + parseInt(duration, 10) * 60000;

    const outcomeMap = {
      "Scheduled": "SCHEDULED",
      "Completed": "COMPLETED",
      "Rescheduled": "RESCHEDULED",
      "No Show": "NO_SHOW",
      "Canceled": "CANCELED",
    };

    const mappedOutcome = outcomeMap[outcome];
    if (!mappedOutcome) {
      throw new Error(`Invalid meeting outcome: ${outcome}`);
    }

    // Build the meeting properties
    const properties = {
      hs_timestamp: parsedDate,
      hs_meeting_title: `Logged by ${user?.firstName} ${user?.lastName}`,
      hubspot_owner_id: attendees.find((id) => id != contactId) || null,
      hs_meeting_body: description || "",
      hs_meeting_start_time: String(startTimestamp),
      hs_meeting_end_time: String(endTimestamp),
      hs_meeting_outcome: mappedOutcome,
    };

    // Prepare the payload for the API request
    const payload = {
      properties,
    };

    // Call the HubSpot CRM v3 single meeting creation endpoint
    const response = await axios.post(
      `${HUBSPOT_API_BASE}/crm/v3/objects/meetings`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Get the created meeting ID
    const meetingId = response.data.id;

    // Associate the meeting with the contact
    await associateMeetingActivity(
      contactId,
      meetingId,
      "contact",
      "contact_to_meeting_event",
      ACCESS_TOKEN,
      HUBSPOT_API_BASE
    );

    // Associate the meeting with the deal (if dealId is provided)
    if (dealId) {
      await associateMeetingActivity(
        dealId,
        meetingId,
        "deal",
        "deal_to_meeting_event",
        ACCESS_TOKEN,
        HUBSPOT_API_BASE
      );
    }

    return "Meeting successfully logged and associated!";
  } catch (error) {
    console.log("Error logging meeting:", error);
    throw new Error(
      error.response?.data?.message ||
      "Failed to log meeting. Please check data and try again."
    );
  }
}

async function associateMeetingActivity(
  objectId,
  meetingId,
  objectType,
  assocDefinition,
  ACCESS_TOKEN,
  HUBSPOT_API_BASE
) {
  try {
    const config = {
      method: "put",
      url: `${HUBSPOT_API_BASE}/crm/v3/objects/${objectType}/${objectId}/associations/Meeting/${meetingId}/${assocDefinition}`,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${ACCESS_TOKEN}`,
      },
    };

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.log("Error associating meeting:", error);
    throw new Error(
      "Failed to associate meeting. Please check data and try again."
    );
  }
}