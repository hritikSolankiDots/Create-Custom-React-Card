const axios = require("axios");

const generateUniqueId = () => {
  return `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
};

function toUTCMidnightTimestamp(dateStr) {
  const [month, day, year] = dateStr.split('/').map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  return utcDate.getTime();
}

const createLineItem = async (lineItemProperties, dealId, HUBSPOT_PRIVATE_APP_TOKEN) => {
  try {
    const response = await axios.post(
      "https://api.hubapi.com/crm/v3/objects/line_items",
      {
        properties: lineItemProperties,
        associations: [
          {
            to: { id: dealId },
            types: [
              { associationCategory: "HUBSPOT_DEFINED", associationTypeId: 20 },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${HUBSPOT_PRIVATE_APP_TOKEN}`,
        },
      }
    );

    return {
      success: true,
      message: `Line item '${lineItemProperties.name}' added to deal ${dealId}`,
      data: response.data,
    };
  } catch (error) {
    console.log("Error creating line item:", error);
    throw new Error("Failed to create line item");
  }
};

exports.main = async (context = {}) => {
  const {
    dealId,
    name,
    productType,

    // Flight fields
    flightNumber,
    airlineName,
    departureAirport,
    arrivalAirport,
    departureDateTime,
    arrivalDateTime,
    flightAdditionalNotes,
    seatType,
    adultCount,
    adultUnitPrice,
    childCount,
    childUnitPrice,
    infantCount,
    infantUnitPrice,

    // Hotel fields
    hotelName,
    hotelAddress,
    checkInDate,
    checkOutDate,
    roomType,
    amenities,
    roomCount,
    roomUnitPrice,

    // Transport fields
    transportType,
    pickupLocation,
    transportDropOff,
    vehicleDetails,
    estimatedTravelDuration,
    pickupDateTime,
    vehicleCount,
    vehicleUnitPrice,
  } = context.parameters;

  // Basic common validation
  if (!dealId || !name || !productType) {
    return {
      success: false,
      message: "Missing required common parameters (dealId, name, productType)",
    };
  }

  const HUBSPOT_PRIVATE_APP_TOKEN = process.env.PRIVATE_APP_ACCESS_TOKEN;

  // Additional validations per product type
  if (productType === "Flight") {
    if (adultCount < 1 && childCount < 1 && infantCount < 1) {
      return {
        success: false,
        message: "At least one passenger (Adult, Children, or Infant) is required.",
      };
    }
  } else if (productType === "Hotel") {
    if (
      isNaN(new Date(checkInDate?.formattedDate).getTime()) ||
      isNaN(new Date(checkOutDate?.formattedDate).getTime())
    ) {
      return {
        success: false,
        message: "Invalid check-in or check-out date.",
      };
    }
  } else if (productType === "Transport") {
    if (isNaN(new Date(pickupDateTime).getTime())) {
      return {
        success: false,
        message: "Invalid pickup date and time.",
      };
    }
  }

  // Handle Flight product type
  if (productType === "Flight") {
    const passengerTypes = [
      { type: "Adult", count: adultCount, unitPrice: adultUnitPrice },
      { type: "Children", count: childCount, unitPrice: childUnitPrice },
      { type: "Infant", count: infantCount, unitPrice: infantUnitPrice },
    ];

    const flightGroupId = generateUniqueId();

    for (const passenger of passengerTypes) {
      if (passenger.count > 0) {
        const lineItemProperties = {
          name: name,
          hs_product_type: productType,
          flight_number: flightNumber,
          airline_name: airlineName,
          departure_airport: departureAirport,
          arrival_airport: arrivalAirport,
          departure_date___time: departureDateTime,
          arrival_date___time: arrivalDateTime,
          additional_notes_flight: flightAdditionalNotes || "",
          seat_type: seatType,
          passenger_type: passenger.type,
          quantity: passenger.count,
          price: passenger.unitPrice,
          flight_group_id: flightGroupId,
        };

        await createLineItem(lineItemProperties, dealId, HUBSPOT_PRIVATE_APP_TOKEN);
      }
    }
  }

  // Handle Hotel product type
  if (productType === "Hotel") {
    if (roomCount > 0) {
      const lineItemProperties = {
        name: `${name} - ${roomType}`,
        hs_product_type: productType,
        hotel_name: hotelName,
        hotel_address: hotelAddress,
        check_in_date: checkInDate ? toUTCMidnightTimestamp(checkInDate?.formattedDate) : null,
        check_out_date: checkOutDate ? toUTCMidnightTimestamp(checkOutDate?.formattedDate) : null,
        room_type: roomType,
        quantity: roomCount,
        price: roomUnitPrice,
      };

      await createLineItem(lineItemProperties, dealId, HUBSPOT_PRIVATE_APP_TOKEN);
    }
  }

  // Handle Transport product type
  if (productType === "Transport") {
    if (vehicleCount > 0) {
      const lineItemProperties = {
        name: name,
        hs_product_type: productType,
        transport_type: transportType,
        pickup_location: pickupLocation,
        drop_off_location: transportDropOff,
        vehicle_type_details: vehicleDetails,
        estimated_travel_duration_minutes: estimatedTravelDuration,
        pickup_date___time: pickupDateTime,
        quantity: vehicleCount,
        price: vehicleUnitPrice,
      };

      await createLineItem(lineItemProperties, dealId, HUBSPOT_PRIVATE_APP_TOKEN);
    }
  }

  return {
    success: true,
    message: "Line items created successfully.",
  };
};