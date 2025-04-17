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
        ? new Date(date.year, date.month - 1, date.date)
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

    // Separate contact ID and owner ID from attendees
    const contactOwnerId = attendees.find((id) => id != contactId);

    // Build associations to attach the contact ID and deal ID.
    const associations = [
      {
        to: { id: contactId },
        types: [
          {
            associationCategory: "HUBSPOT_DEFINED",
            associationTypeId: 200, // Association type for contact
          },
        ],
      },
    ];

    // Add deal association if dealId is provided
    if (dealId) {
      associations.push({
        to: { id: dealId },
        types: [
          {
            associationCategory: "HUBSPOT_DEFINED",
            associationTypeId: 212, // Association type for deal
          },
        ],
      });
    }

    // Build the meeting properties following the HubSpot meeting properties.
    const properties = {
      hs_timestamp: String(startTimestamp),
      hs_meeting_title: `Logged by ${user?.firstName} ${user?.lastName}`,
      hubspot_owner_id: contactOwnerId ? parseInt(contactOwnerId, 10) : null,
      hs_meeting_body: description || "",
      hs_internal_meeting_notes: "",
      hs_meeting_external_url: "",
      hs_meeting_location: "",
      hs_meeting_start_time: String(startTimestamp),
      hs_meeting_end_time: String(endTimestamp),
      hs_meeting_outcome: mappedOutcome,
    };

    // Prepare the payload for the API request
    const payload = {
      associations,
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

    // Delay the removal of unwanted associations by 30 seconds
    setTimeout(async () => {
      await removeUnwantedAssociations(meetingId, ACCESS_TOKEN, HUBSPOT_API_BASE, dealId, contactId);
    }, 60000); // 60 seconds delay

    return "Meeting successfully created!";
  } catch (error) {
    console.log("Error creating meeting:", error);
    throw new Error(
      error.response?.data?.message ||
      "Failed to create meeting. Please check data and try again."
    );
  }
}

// Helper function to remove unwanted associations
async function removeUnwantedAssociations(meetingId, ACCESS_TOKEN, HUBSPOT_API_BASE, dealId, contactId) {
  try {
    const typesToCheck = ['contacts', 'deals', 'companies'];

    for (const toType of typesToCheck) {
      const { data } = await axios.get(
        `${HUBSPOT_API_BASE}/crm/v3/objects/meetings/${meetingId}/associations/${toType}`,
        { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } }
      );

      for (const assoc of data.results) {
        const toObjectType = toType;
        const toObjectId = assoc.id;
        const associationType = assoc.type;
        // Example of filtering by string:

        if (toType == 'contacts' && toObjectId == contactId || toType == 'deals' && toObjectId == dealId) {
          console.log(`Skipping association: ${associationType}`);
          continue;
        } else {
          const response = await axios.delete(
            `${HUBSPOT_API_BASE}/crm/v3/objects/meetings/${meetingId}/associations/${toObjectType}/${toObjectId}/${associationType}`,
            { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } }
          );
        }
      }
    }
  } catch (err) {
    console.log('Error removing associations:', err);
  }
}
