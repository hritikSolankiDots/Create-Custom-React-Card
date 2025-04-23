const axios = require("axios");

const getLineItemDetails = async (lineItemId, HUBSPOT_PRIVATE_APP_TOKEN) => {
  try {
    // Specify the properties you want to retrieve
    const properties = [
      "name",
      "hs_product_type",
      "flight_number",
      "airline_name",
      "departure_airport",
      "arrival_airport",
      "departure_date___time",
      "arrival_date___time",
      "additional_notes_flight",
      "seat_type",
      "passenger_type",
      "quantity",
      "price",
      "hotel_name",
      "hotel_address",
      "check_in_date",
      "check_out_date",
      "room_type",
      "amount",
      "transport_type",
      "pickup_location",
      "drop_off_location",
      "vehicle_type_details",
      "estimated_travel_duration_minutes",
      "pickup_date___time",
      "createdate",
      "hs_lastmodifieddate",
      "hs_object_id",
      "hs_product_id",
      "flight_group_id"
    ];

    const response = await axios.get(
      `https://api.hubapi.com/crm/v3/objects/line_items/${lineItemId}`,
      {
        params: {
          properties: properties.join(","), // Include all desired properties
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${HUBSPOT_PRIVATE_APP_TOKEN}`,
        },
      }
    );
    return response.data.properties;
  } catch (error) {
    console.error(`Error fetching details for line item ${lineItemId}:`, error.response?.data || error.message);
    return null; // Return null if there's an error fetching a specific line item
  }
};

const getDealLineItems = async (dealId, HUBSPOT_PRIVATE_APP_TOKEN) => {
  try {
    // Fetch associated line item IDs
    const response = await axios.get(
      `https://api.hubapi.com/crm/v3/objects/deals/${dealId}/associations/line_items`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${HUBSPOT_PRIVATE_APP_TOKEN}`,
        },
      }
    );

    const lineItemIds = response.data.results.map((item) => item.id);

    // Fetch details for each line item
    const lineItemDetails = await Promise.all(
      lineItemIds.map((id) => getLineItemDetails(id, HUBSPOT_PRIVATE_APP_TOKEN))
    );

    // Filter out any null responses (in case of errors)
    const validLineItems = lineItemDetails.filter((item) => item !== null);

    // Group line items by hs_product_type
    const groupedLineItems = validLineItems.reduce((acc, item) => {
      const productType = item.hs_product_type || "Unknown"; // Default to "Unknown" if hs_product_type is missing

      if (productType === "Flight") {
        // Group flights by flight_group_id
        const flightGroupId = item.flight_group_id || "Unknown"; // Default to "Unknown" if flight_group_id is missing
        if (!acc[productType]) {
          acc[productType] = {};
        }
        if (!acc[productType][flightGroupId]) {
          acc[productType][flightGroupId] = [];
        }
        acc[productType][flightGroupId].push(item);
      } else {
        // Group other product types (Hotel, Transport, etc.)
        if (!acc[productType]) {
          acc[productType] = [];
        }
        acc[productType].push(item);
      }

      return acc;
    }, {});
    return {
      success: true,
      message: `Line items retrieved and grouped successfully for deal ${dealId}`,
      data: groupedLineItems, // Contains the grouped line items
    };
  } catch (error) {
    console.error("Error retrieving line items:", error.response?.data || error.message);
    return {
      success: false,
      message: "Failed to retrieve line items",
      error: error.response?.data || error.message,
    };
  }
};

exports.main = async (context = {}) => {
  const { dealId } = context.parameters;

  // Validate input
  if (!dealId) {
    return {
      success: false,
      message: "Missing required parameter: dealId",
    };
  }

  const HUBSPOT_PRIVATE_APP_TOKEN = process.env.PRIVATE_APP_ACCESS_TOKEN;

  // Call the function to get line items
  return await getDealLineItems(dealId, HUBSPOT_PRIVATE_APP_TOKEN);
};