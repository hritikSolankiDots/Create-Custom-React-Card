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
exports.main = async (context = {}) => {
  const HUBSPOT_API_BASE = 'https://api.hubapi.com';
  const ACCESS_TOKEN = process.env.PRIVATE_APP_ACCESS_TOKEN;
  const { user, action, text, ...params } = await context?.parameters;

  try {
    if (action === 'fetchContact') {
      const contact = await fetchContact(params.contactId, ACCESS_TOKEN, HUBSPOT_API_BASE);
      return contact;
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

async function logMeeting(
  { attendees, outcome, date, time, duration, description },
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


    // Build associations to attach all attendees (contact IDs).
    const associations = attendees.map((contactId) => ({
      to: { id: contactId },
      types: [
        {
          associationCategory: 'HUBSPOT_DEFINED',
          associationTypeId: 200,
        },
      ],
    }));

    // Build the meeting properties following the HubSpot meeting properties.
    const properties = {
      hs_timestamp: String(startTimestamp),
      hs_meeting_title: `Logged by ${user?.firstName} ${user?.lastName}`,
      hubspot_owner_id: "",
      hs_meeting_body: description || '',
      hs_internal_meeting_notes: "",
      hs_meeting_external_url: "",
      hs_meeting_location: "",
      hs_meeting_start_time: String(startTimestamp),
      hs_meeting_end_time: String(endTimestamp),
      hs_meeting_outcome: mappedOutcome,
      hs_attachment_ids: ""
    };

    // Create one meeting record with all associations.
    const inputs = [
      {
        associations,
        properties,
      },
    ];

    const payload = { inputs };

    // Call the HubSpot CRM v3 batch create endpoint.
    const response = await axios.post(
      `${HUBSPOT_API_BASE}/crm/v3/objects/meetings/batch/create`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return "Meetings successfully created!";
  } catch (error) {
    console.log("Error creating meeting(s):", error);
    throw new Error(
      error.response?.data?.message ||
      "Failed to create meeting(s). Please check data and try again."
    );
  }
}
