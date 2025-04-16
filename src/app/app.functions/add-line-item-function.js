const axios = require("axios");

function toUTCMidnightTimestamp(dateStr) {
  const [month, day, year] = dateStr.split('/').map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  return utcDate.getTime();
}
exports.main = async (context = {}) => {
  const {
    dealId,
    name,
    sku,
    price,
    quantity,
    productType,

    // Flight fields
    flightNumber,
    airlineName,
    departureAirport,
    arrivalAirport,
    departureDate, 
    arrivalDate, 
    departureTime, 
    arrivalTime, 
    flightAdditionalNotes,
    seatType,
    passengerType,
    departureDateTime, 
    arrivalDateTime,

    // Hotel fields
    hotelName,
    hotelAddress,
    checkInDate, 
    checkOutDate, 
    roomType,
    amenities,
   

    // Transport fields
    transportType,
    pickupLocation,
    transportDropOff,
    vehicleDetails,
    estimatedTravelDuration,
    pickupDate, // expected in YYYY-MM-DD
    pickupTime, // expected in HH:MM (24-hour)
    pickupDateTime, // combined value from frontend (optional)
  } = context.parameters;

  // Basic common validation
  if (!dealId || !name || !price || !quantity || !productType) {
    return {
      success: false,
      message:
        "Missing required common parameters (dealId, name, price, quantity, productType)",
    };
  }

  // Additional validations per product type
  if (productType === "Flight") {
    if (
      !flightNumber ||
      !airlineName ||
      !departureAirport ||
      !arrivalAirport ||
      !departureDate ||
      !arrivalDate ||
      !departureTime ||
      !arrivalTime ||
      !seatType ||
      !passengerType
    ) {
      return {
        success: false,
        message:
          "Missing required flight parameters (flightNumber, airlineName, departureAirport, arrivalAirport, departureDate, arrivalDate, departureTime, arrivalTime, seatType, passengerType)",
      };
    }
    // Optional: If dates are equal, ensure departureTime is before arrivalTime
    if (departureDate === arrivalDate) {
      const depDateTime = new Date(`${departureDate}T${departureTime}`);
      const arrDateTime = new Date(`${arrivalDate}T${arrivalTime}`);
      if (depDateTime >= arrDateTime) {
        return {
          success: false,
          message:
            "For flights on the same day, departure time must be earlier than arrival time.",
        };
      }
    }
  } else if (productType === "Hotel") {
    if (
      !hotelName ||
      !hotelAddress ||
      !checkInDate ||
      !checkOutDate ||
      !roomType
    ) {
      return {
        success: false,
        message:
          "Missing required hotel parameters (hotelName, hotelAddress, checkInDate, checkOutDate, roomType)",
      };
    }
    // Optional: check that checkOutDate is not before checkInDate
    if (new Date(checkOutDate) < new Date(checkInDate)) {
      return {
        success: false,
        message: "Check-out date must be after check-in date.",
      };
    }
  } else if (productType === "Transport") {
    if (
      !transportType ||
      !pickupLocation ||
      !transportDropOff ||
      !vehicleDetails ||
      !estimatedTravelDuration ||
      !pickupDate ||
      !pickupTime
    ) {
      return {
        success: false,
        message:
          "Missing required transport parameters (transportType, pickupLocation, transportDropOff, vehicleDetails, estimatedTravelDuration, pickupDate, pickupTime)",
      };
    }
  } else {
    return {
      success: false,
      message: "Invalid product type provided.",
    };
  }

  // Build the properties object to send to HubSpot.
  // Note: Adjust property names below to match your HubSpot custom property schema.
  const properties = {
    name,
    sku,
    price: parseFloat(price),
    quantity: parseInt(quantity, 10),
    hs_product_type: productType,
  };

  // Append Flight-specific properties
  if (productType === "Flight") {
    Object.assign(properties, {
      flight_number: flightNumber,
      airline_name: airlineName,
      departure_airport: departureAirport,
      arrival_airport: arrivalAirport,
      additional_notes_flight: flightAdditionalNotes || "",
      seat_type: seatType,
      passenger_type: passengerType,
      departure_date___time: departureDateTime,
      arrival_date___time: arrivalDateTime,
    });
  }

  const allowedAmenities = ["breakfast", "Wi-Fi", "parking"];
  const validAmenities = Array.isArray(amenities)
    ? amenities.filter(a => allowedAmenities.includes(a))
    : allowedAmenities.includes(amenities) ? [amenities] : [];
  // Append Hotel-specific properties
  if (productType === "Hotel") {
    Object.assign(properties, {
      hotel_name: hotelName,
      hotel_address: hotelAddress,
      check_in_date: checkInDate ? toUTCMidnightTimestamp(checkInDate?.formattedDate) : null,
      check_out_date: checkOutDate ? toUTCMidnightTimestamp(checkOutDate?.formattedDate) : null,
      room_type: roomType,
      additional_amenities: validAmenities.join(";"),
   
    });
  }

  // Append Transport-specific properties
  if (productType === "Transport") {
    Object.assign(properties, {
      transport_type: transportType,
      pickup_location: pickupLocation,
      drop_off_location: transportDropOff,
      vehicle_type_details: vehicleDetails,
      estimated_travel_duration_minutes: estimatedTravelDuration,
      pickup_date___time: pickupDateTime,
    });
  }
 

  const HUBSPOT_PRIVATE_APP_TOKEN = process.env.PRIVATE_APP_ACCESS_TOKEN;

  try {
    const response = await axios.post(
      "https://api.hubapi.com/crm/v3/objects/line_items",
      {
        properties,
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
      message: `Line item '${name}' added to deal ${dealId}`,
      data: response.data,
    };
  } catch (error) {
    console.log(
      error,
      "Error adding line item:",
    );
    return {
      success: false,
      message: "Failed to add line item",
      error: error.response?.data || error.message,
    };
  }
};
