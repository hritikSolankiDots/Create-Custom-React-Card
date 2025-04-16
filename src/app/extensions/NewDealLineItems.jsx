import React, { useState } from "react";
import {
  Button,
  Divider,
  Form,
  Input,
  NumberInput,
  Flex,
  hubspot,
  Select,
  DateInput,
  MultiSelect,
} from "@hubspot/ui-extensions";

const validateTime = (timeStr) => {
  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return regex.test(timeStr);
};

const combineDateTime = (date, time) => {
  if (!date || !date.formattedDate || !time) return null;
  // Split the formatted date ("MM/DD/YYYY") into parts
  const [month, day, year] = date.formattedDate.split("/");
  // Create ISO date string in the format "YYYY-MM-DD"
  const isoDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  const combinedString = `${isoDate}T${time}`;
  return new Date(combinedString);
};

hubspot.extend(({ context, runServerlessFunction, actions }) => (
  <AddProductUI
    context={context}
    runServerless={runServerlessFunction}
    sendAlert={actions.addAlert}
  />
));

const AddProductUI = ({ context, runServerless, sendAlert }) => {
  const [formValues, setFormValues] = useState({
    name: "",
    price: 0,
    quantity: 1,
    productType: "",

    // Flight fields
    flightNumber: "",
    airlineName: "",
    departureAirport: "",
    arrivalAirport: "",
    departureDate: null,
    arrivalDate: null,
    departureTime: "",
    arrivalTime: "",
    flightAdditionalNotes: "",
    seatType: "",
    passengerType: "",

    // Hotel fields
    hotelName: "",
    hotelAddress: "",
    checkInDate: null,
    checkOutDate: null,
    roomType: "",
    amenities: null,

    // Transport fields
    transportType: "",
    pickupLocation: "",
    transportDropOff: "",
    vehicleDetails: "",
    estimatedTravelDuration: "",
    pickupDate: null,
    pickupTime: "",
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let newErrors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to midnight

    // Validate common fields
    if (!formValues.name) newErrors.name = "Product name is required";
    if (!formValues.price && formValues.price !== 0)
      newErrors.price = "Price is required";
    if (!formValues.quantity && formValues.quantity !== 0)
      newErrors.quantity = "Quantity is required";
    if (!formValues.productType)
      newErrors.productType = "Product type is required";

    // Validate Flight fields if productType is Flight
    if (formValues.productType === "Flight") {
      if (!formValues.flightNumber)
        newErrors.flightNumber = "Flight number is required";
      if (!formValues.airlineName)
        newErrors.airlineName = "Airline name is required";
      if (!formValues.departureAirport)
        newErrors.departureAirport = "Departure airport is required";
      if (!formValues.arrivalAirport)
        newErrors.arrivalAirport = "Arrival airport is required";

      if (!formValues.departureDate) {
        newErrors.departureDate = "Departure date is required";
      } else {
        const depDate = new Date(formValues.departureDate?.formattedDate);
        if (depDate < today)
          newErrors.departureDate =
            "Departure date must be today or in the future";
      }
      if (!formValues.arrivalDate) {
        newErrors.arrivalDate = "Arrival date is required";
      } else {
        const arrDate = new Date(formValues.arrivalDate?.formattedDate);
        const depDate = new Date(formValues.departureDate?.formattedDate);

        if (arrDate < today) {
          newErrors.arrivalDate = "Arrival date must be today or in the future";
        } else if (arrDate < depDate) {
          newErrors.arrivalDate = "Arrival date must be after departure date";
        }
      }

      if (!formValues.departureTime) {
        newErrors.departureTime = "Departure time is required";
      } else if (!validateTime(formValues.departureTime)) {
        newErrors.departureTime =
          "Invalid time format. Use HH:MM (24-hour format)";
      }
      if (!formValues.arrivalTime) {
        newErrors.arrivalTime = "Arrival time is required";
      } else if (!validateTime(formValues.arrivalTime)) {
        newErrors.arrivalTime =
          "Invalid time format. Use HH:MM (24-hour format)";
      }
      if (!formValues.seatType) newErrors.seatType = "Seat type is required";
      if (!formValues.passengerType)
        newErrors.passengerType = "Passenger type is required";

      // If departure and arrival are on the same day, check that departure time is earlier
      if (
        formValues.departureDate &&
        formValues.arrivalDate &&
        formValues.departureDate?.formattedDate ===
          formValues.arrivalDate?.formattedDate &&
        validateTime(formValues.departureTime) &&
        validateTime(formValues.arrivalTime)
      ) {
        const depDateTime = combineDateTime(
          formValues.departureDate,
          formValues.departureTime
        );
        const arrDateTime = combineDateTime(
          formValues.arrivalDate,
          formValues.arrivalTime
        );
        if (depDateTime >= arrDateTime) {
          newErrors.arrivalTime =
            "Arrival time must be later than departure time on the same day";
        }
      }
    }

    // Validate Hotel fields if productType is Hotel
    if (formValues.productType === "Hotel") {
      if (!formValues.hotelName) newErrors.hotelName = "Hotel name is required";
      if (!formValues.hotelAddress)
        newErrors.hotelAddress = "Hotel address is required";
      if (!formValues.checkInDate) {
        newErrors.checkInDate = "Check-in date is required";
      } else {
        const checkIn = new Date(formValues.checkInDate?.formattedDate);
        if (checkIn < today)
          newErrors.checkInDate =
            "Check-in date must be today or in the future";
      }
      if (!formValues.checkOutDate) {
        newErrors.checkOutDate = "Check-out date is required";
      } else {
        const checkOut = new Date(formValues.checkOutDate?.formattedDate);
        const checkIn = new Date(formValues.checkInDate?.formattedDate);
        if (checkOut < today) {
          newErrors.checkOutDate =
            "Check-out date must be today or in the future";
        } else if (checkOut < checkIn) {
          newErrors.checkOutDate = "Check-out date must be after check-in date";
        }
      }
      if (!formValues.roomType) newErrors.roomType = "Room type is required";
      // You can add extra validations to ensure check-out is after check-in if needed.
    }

    // Validate Transport fields if productType is Transport
    if (formValues.productType === "Transport") {
      if (!formValues.transportType)
        newErrors.transportType = "Transport type is required";
      if (!formValues.pickupLocation)
        newErrors.pickupLocation = "Pick-up location is required";
      if (!formValues.transportDropOff)
        newErrors.transportDropOff = "Drop-off location is required";
      if (!formValues.estimatedTravelDuration)
        newErrors.estimatedTravelDuration =
          "Estimated travel duration is required";
      if (isNaN(parseInt(formValues.estimatedTravelDuration, 10)))
        newErrors.estimatedTravelDuration =
          "Travel duration must be a valid number";
      if (!formValues.pickupDate) {
        newErrors.pickupDate = "Pick-up date is required";
      } else {
        const pickup = new Date(formValues.pickupDate?.formattedDate);
        if (pickup < today)
          newErrors.pickupDate = "Pick-up date must be today or in the future";
      }
      if (!formValues.pickupTime) {
        newErrors.pickupTime = "Pickup time is required";
      } else if (!validateTime(formValues.pickupTime)) {
        newErrors.pickupTime =
          "Invalid time format. Use HH:MM (24-hour format)";
      }
      if (!formValues.vehicleDetails)
        newErrors.vehicleDetails = "Vehicle details are required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Combine dates and times only for product types that require them.
    let departureDateTime, arrivalDateTime, pickupDateTime;
    if (formValues.productType === "Flight") {
      departureDateTime = combineDateTime(
        formValues.departureDate,
        formValues.departureTime
      );
      arrivalDateTime = combineDateTime(
        formValues.arrivalDate,
        formValues.arrivalTime
      );
    }
    if (formValues.productType === "Transport") {
      pickupDateTime = combineDateTime(
        formValues.pickupDate,
        formValues.pickupTime
      );
    }

    const { response } = await runServerless({
      name: "addLineItem",
      parameters: {
        dealId: context?.crm?.objectId,
        departureDateTime,
        arrivalDateTime,
        pickupDateTime,
        ...formValues,
      },
    });

    if (response.success) {
      sendAlert({ message: "Product added successfully!", type: "success" });
      setFormValues({
        name: "",
        price: 0,
        quantity: 1,
        productType: "",

        // Flight fields
        flightNumber: "",
        airlineName: "",
        departureAirport: "",
        arrivalAirport: "",
        departureDate: null,
        arrivalDate: null,
        departureTime: "",
        arrivalTime: "",
        seatType: "",
        passengerType: "",
        flightAdditionalNotes: "",

        // Hotel fields
        hotelName: "",
        hotelAddress: "",
        checkInDate: null,
        checkOutDate: null,
        roomType: "",
        amenities: null,

        // Transport fields
        transportType: "",
        pickupLocation: "",
        transportDropOff: "",
        vehicleDetails: "",
        estimatedTravelDuration: "",
        pickupDate: null,
        pickupTime: "",
      });
    } else {
      sendAlert({ message: "Failed to add product", type: "danger" });
    }
  };

  const productTypeLabels = {
    Flight: {
      name: "Travel Journey (e.g., Delhi to Dubai Flight)",
      price: "Flight Ticket Price (Single Person)",
      quantity: "Number of Passengers",
    },
    Hotel: {
      name: "Booking Details (e.g., 2 days, 3 nights)",
      price: "Total Cost per Room",
      quantity: "Number of Rooms",
    },
    Transport: {
      name: "Transport Summary (short description)",
      price: "Total Service Price",
      quantity: "Number of Vehicles",
    },
  };

  return (
    <>
      <Form>
        <Flex direction="column" gap="small">
          <Select
            label="Product Type"
            id="productType"
            options={[
              { label: "Flight", value: "Flight" },
              { label: "Hotel", value: "Hotel" },
              { label: "Transport", value: "Transport" },
            ]}
            value={formValues.productType}
            error={!!errors.productType}
            validationMessage={errors.productType}
            onChange={(e) => setFormValues({ ...formValues, productType: e })}
          />

          {/* Common Fields */}
          {formValues.productType && (
            <>
              <Input
                label={
                  productTypeLabels[formValues.productType]
                    ? productTypeLabels[formValues.productType].name
                    : "Line Item Name"
                }
                id="name"
                placeholder="Enter line item name"
                type="text"
                value={formValues.name}
                error={!!errors.name}
                validationMessage={errors.name}
                onChange={(e) => setFormValues({ ...formValues, name: e })}
              />

              <NumberInput
                label={
                  productTypeLabels[formValues.productType]
                    ? productTypeLabels[formValues.productType].price
                    : "Price (USD)"
                }
                id="price"
                placeholder="Enter price"
                type="number"
                value={formValues.price}
                error={!!errors.price}
                validationMessage={errors.price}
                onChange={(e) => setFormValues({ ...formValues, price: e })}
              />

              <NumberInput
                label={
                  productTypeLabels[formValues.productType]
                    ? productTypeLabels[formValues.productType].quantity
                    : "Quantity"
                }
                id="quantity"
                placeholder="Enter quantity"
                type="number"
                value={formValues.quantity}
                error={!!errors.quantity}
                validationMessage={errors.quantity}
                onChange={(e) => setFormValues({ ...formValues, quantity: e })}
              />
            </>
          )}

          {/* Flight Fields */}
          {formValues.productType === "Flight" && (
            <>
              <Select
                label="Passenger Type"
                id="passengerType"
                options={[
                  { label: "Adult", value: "Adult" },
                  { label: "Children", value: "Children" },
                  { label: "Infant", value: "Infant" },
                ]}
                value={formValues.passengerType}
                error={!!errors.passengerType}
                validationMessage={errors.passengerType}
                onChange={(e) =>
                  setFormValues({ ...formValues, passengerType: e })
                }
              />
              <Select
                label="Seat Type"
                id="seatType"
                options={[
                  { label: "Economy", value: "Economy" },
                  { label: "Business", value: "Business" },
                  { label: "First Class", value: "First Class" },
                ]}
                value={formValues.seatType}
                error={!!errors.seatType}
                validationMessage={errors.seatType}
                onChange={(e) => setFormValues({ ...formValues, seatType: e })}
              />
              <Input
                label="Flight Number"
                id="flightNumber"
                placeholder="Enter flight number (e.g., 20BCA)"
                type="text"
                value={formValues.flightNumber}
                error={!!errors.flightNumber}
                validationMessage={errors.flightNumber}
                onChange={(e) =>
                  setFormValues({ ...formValues, flightNumber: e })
                }
              />
              <Input
                label="Airline Name"
                id="airlineName"
                placeholder="Enter airline name"
                type="text"
                value={formValues.airlineName}
                error={!!errors.airlineName}
                validationMessage={errors.airlineName}
                onChange={(e) =>
                  setFormValues({ ...formValues, airlineName: e })
                }
              />

              <Input
                label="Departure Airport"
                id="departureAirport"
                placeholder="Enter departure airport"
                type="text"
                value={formValues.departureAirport}
                error={!!errors.departureAirport}
                validationMessage={errors.departureAirport}
                onChange={(e) =>
                  setFormValues({ ...formValues, departureAirport: e })
                }
              />
              <Input
                label="Arrival Airport"
                id="arrivalAirport"
                placeholder="Enter arrival airport"
                type="text"
                value={formValues.arrivalAirport}
                error={!!errors.arrivalAirport}
                validationMessage={errors.arrivalAirport}
                onChange={(e) =>
                  setFormValues({ ...formValues, arrivalAirport: e })
                }
              />
              <DateInput
                label="Departure Date"
                id="departureDate"
                placeholder="YYYY-MM-DD"
                type="date"
                value={formValues.departureDate}
                error={!!errors.departureDate}
                validationMessage={errors.departureDate}
                onChange={(e) =>
                  setFormValues({ ...formValues, departureDate: e })
                }
              />
              <Input
                label="Departure Time"
                id="departureTime"
                placeholder="HH:MM"
                type="text"
                value={formValues.departureTime}
                error={!!errors.departureTime}
                validationMessage={errors.departureTime}
                onChange={(e) =>
                  setFormValues({ ...formValues, departureTime: e })
                }
              />
              <DateInput
                label="Arrival Date"
                id="arrivalDate"
                placeholder="YYYY-MM-DD"
                type="date"
                value={formValues.arrivalDate}
                error={!!errors.arrivalDate}
                validationMessage={errors.arrivalDate}
                onChange={(e) =>
                  setFormValues({ ...formValues, arrivalDate: e })
                }
              />
              <Input
                label="Arrival Time"
                id="arrivalTime"
                placeholder="HH:MM"
                type="text"
                value={formValues.arrivalTime}
                error={!!errors.arrivalTime}
                validationMessage={errors.arrivalTime}
                onChange={(e) =>
                  setFormValues({ ...formValues, arrivalTime: e })
                }
              />
              <Input
                label="Additional Notes"
                id="flightAdditionalNotes"
                placeholder="Enter any additional flight notes"
                type="text"
                value={formValues.flightAdditionalNotes}
                onChange={(e) =>
                  setFormValues({ ...formValues, flightAdditionalNotes: e })
                }
              />
            </>
          )}

          {/* Hotel Fields */}
          {formValues.productType === "Hotel" && (
            <>
              <Input
                label="Hotel Name"
                id="hotelName"
                placeholder="Enter hotel name"
                type="text"
                value={formValues.hotelName}
                error={!!errors.hotelName}
                validationMessage={errors.hotelName}
                onChange={(e) => setFormValues({ ...formValues, hotelName: e })}
              />
              <Input
                label="Hotel Address"
                id="hotelAddress"
                placeholder="Enter hotel address"
                type="text"
                value={formValues.hotelAddress}
                error={!!errors.hotelAddress}
                validationMessage={errors.hotelAddress}
                onChange={(e) =>
                  setFormValues({ ...formValues, hotelAddress: e })
                }
              />
              <DateInput
                label="Check-In Date"
                id="checkInDate"
                placeholder="YYYY-MM-DD"
                type="date"
                value={formValues.checkInDate}
                error={!!errors.checkInDate}
                validationMessage={errors.checkInDate}
                onChange={(e) =>
                  setFormValues({ ...formValues, checkInDate: e })
                }
              />
              <DateInput
                label="Check-Out Date"
                id="checkOutDate"
                placeholder="YYYY-MM-DD"
                type="date"
                value={formValues.checkOutDate}
                error={!!errors.checkOutDate}
                validationMessage={errors.checkOutDate}
                onChange={(e) =>
                  setFormValues({ ...formValues, checkOutDate: e })
                }
              />
              <Select
                label="Room Type"
                id="roomType"
                options={[
                  { label: "Standard", value: "Standard" },
                  { label: "Deluxe", value: "Deluxe" },
                  { label: "Suite", value: "Suite" },
                ]}
                value={formValues.roomType}
                error={!!errors.roomType}
                validationMessage={errors.roomType}
                onChange={(e) => setFormValues({ ...formValues, roomType: e })}
              />
              <MultiSelect
                id="amenities"
                label="Amenities"
                name="amenities"
                value={formValues.amenities}
                onChange={(e) => setFormValues({ ...formValues, amenities: e })}
                options={[
                  { label: "breakfast", value: "breakfast" },
                  { label: "Wi-Fi", value: "Wi-Fi" },
                  { label: "parking", value: "parking" },
                ]}
              />
            </>
          )}

          {/* Transport Fields */}
          {formValues.productType === "Transport" && (
            <>
              <Input
                label="Pick-up Location"
                id="pickupLocation"
                placeholder="Enter pick-up location"
                type="text"
                value={formValues.pickupLocation}
                error={!!errors.pickupLocation}
                validationMessage={errors.pickupLocation}
                onChange={(e) =>
                  setFormValues({ ...formValues, pickupLocation: e })
                }
              />
              <Input
                label="Drop-off Location"
                id="transportDropOff"
                placeholder="Enter drop-off location"
                type="text"
                value={formValues.transportDropOff}
                error={!!errors.transportDropOff}
                validationMessage={errors.transportDropOff}
                onChange={(e) =>
                  setFormValues({ ...formValues, transportDropOff: e })
                }
              />
              <Select
                label="Transport Type"
                id="transportType"
                options={[
                  { label: "Taxi", value: "Taxi" },
                  { label: "Shuttle", value: "Shuttle" },
                  { label: "Private Car", value: "Private Car" },
                  { label: "Bus", value: "Bus" },
                ]}
                value={formValues.transportType}
                error={!!errors.transportType}
                validationMessage={errors.transportType}
                onChange={(e) =>
                  setFormValues({ ...formValues, transportType: e })
                }
              />
              <Input
                label="Estimated Travel Duration In Minutes"
                id="estimatedTravelDuration"
                placeholder="Enter Duration In Minutes"
                type="text"
                value={formValues.estimatedTravelDuration}
                error={!!errors.estimatedTravelDuration}
                validationMessage={errors.estimatedTravelDuration}
                onChange={(e) =>
                  setFormValues({ ...formValues, estimatedTravelDuration: e })
                }
              />
              <DateInput
                label="Pick-up Date"
                id="pickupDate"
                placeholder="YYYY-MM-DD"
                type="date"
                value={formValues.pickupDate}
                error={!!errors.pickupDate}
                validationMessage={errors.pickupDate}
                onChange={(e) =>
                  setFormValues({ ...formValues, pickupDate: e })
                }
              />
              <Input
                label="Pick-up Time"
                id="pickupTime"
                placeholder="Enter pickup time (HH:MM)"
                type="text"
                value={formValues.pickupTime}
                error={!!errors.pickupTime}
                validationMessage={errors.pickupTime}
                onChange={(e) =>
                  setFormValues({ ...formValues, pickupTime: e })
                }
              />
              <Input
                label="Vehicle Details"
                id="vehicleDetails"
                placeholder="Enter vehicle details"
                type="text"
                value={formValues.vehicleDetails}
                error={!!errors.vehicleDetails}
                validationMessage={errors.vehicleDetails}
                onChange={(e) =>
                  setFormValues({ ...formValues, vehicleDetails: e })
                }
              />
            </>
          )}

          <Button type="submit" onClick={handleSubmit} variant="primary">
            Add Product
          </Button>
        </Flex>
      </Form>
      <Divider />
    </>
  );
};

export default AddProductUI;
