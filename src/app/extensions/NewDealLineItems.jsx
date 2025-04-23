import React, { useEffect, useState } from "react";
import {
  Button,
  Divider,
  Form,
  Flex,
  hubspot,
  Text,
  Heading,
} from "@hubspot/ui-extensions";
import CommonFields from "./components/CommonFields";
import FlightFields from "./components/FlightFields";
import HotelFields from "./components/HotelFields";
import TransportFields from "./components/TransportFields";
import LineItemsTable from "./components/LineItemsTable";

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
    adultCount: 1,
    adultUnitPrice: 0,
    childCount: 0,
    childUnitPrice: 0,
    infantCount: 0,
    infantUnitPrice: 0,

    // Hotel fields
    hotelName: "",
    hotelAddress: "",
    checkInDate: null,
    checkOutDate: null,
    roomType: "",
    amenities: null,
    roomCount: 1,
    roomUnitPrice: 0,

    // Transport fields
    transportType: "",
    pickupLocation: "",
    transportDropOff: "",
    vehicleDetails: "",
    estimatedTravelDuration: "",
    pickupDate: null,
    pickupTime: "",
    vehicleCount: 1,
    vehicleUnitPrice: 0,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingTable, setLoadingTable] = useState(false);
  const [lineItems, setLineItems] = useState([]); // State to store retrieved line items

  // Fetch line items associated with the deal
  // Fetch line items associated with the deal
  const fetchLineItems = async () => {
    setLoadingTable(true);
    try {
      const { response } = await runServerless({
        name: "getLineItems", // Name of the serverless function
        parameters: {
          dealId: context?.crm?.objectId, // Pass the deal ID from the context
        },
      });

      if (response.success) {
        setLineItems(response.data); // Store the grouped line items
      } else {
        sendAlert({ message: "Failed to retrieve line items", type: "danger" });
      }
    } catch (error) {
      console.error("Error fetching line items:", error);
      sendAlert({
        message: "An error occurred while fetching line items",
        type: "danger",
      });
    } finally {
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    fetchLineItems(); // Fetch line items when the component mounts
  }, []);

  const validateForm = () => {
    let newErrors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to midnight

    // Validate common fields
    if (!formValues.name) newErrors.name = "Product name is required";
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

      // Validate passenger counts and unit prices
      if (formValues.adultCount < 1)
        newErrors.adultCount = "At least one adult is required";
      if (formValues.adultUnitPrice < 0)
        newErrors.adultUnitPrice = "Adult unit price must be non-negative";
      if (formValues.childCount < 0)
        newErrors.childCount = "Child count cannot be negative";
      if (formValues.childUnitPrice < 0)
        newErrors.childUnitPrice = "Child unit price must be non-negative";
      if (formValues.infantCount < 0)
        newErrors.infantCount = "Infant count cannot be negative";
      if (formValues.infantUnitPrice < 0)
        newErrors.infantUnitPrice = "Infant unit price must be non-negative";
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

      // Validate room count and unit price
      if (formValues.roomCount < 1)
        newErrors.roomCount = "At least one room is required";
      if (formValues.roomUnitPrice < 0)
        newErrors.roomUnitPrice = "Room unit price must be non-negative";
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

      // Validate vehicle count and unit price
      if (formValues.vehicleCount < 1)
        newErrors.vehicleCount = "At least one vehicle is required";
      if (formValues.vehicleUnitPrice < 0)
        newErrors.vehicleUnitPrice = "Vehicle unit price must be non-negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
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
        name: "newAddLineItem",
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

        // Reset form values
        setFormValues({
          name: "",
          price: 0,

          // Reset Flight fields
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
          adultCount: 1,
          adultUnitPrice: 0,
          childCount: 0,
          childUnitPrice: 0,
          infantCount: 0,
          infantUnitPrice: 0,

          // Reset Hotel fields
          hotelName: "",
          hotelAddress: "",
          checkInDate: null,
          checkOutDate: null,
          roomType: "",
          amenities: null,
          roomCount: 1,
          roomUnitPrice: 0,

          // Reset Transport fields
          transportType: "",
          pickupLocation: "",
          transportDropOff: "",
          vehicleDetails: "",
          estimatedTravelDuration: "",
          pickupDate: null,
          pickupTime: "",
          vehicleCount: 1,
          vehicleUnitPrice: 0,
        });

        // Refresh the line items table
        fetchLineItems();
      } else {
        sendAlert({ message: "Failed to add product", type: "danger" });
      }
    } catch (error) {
      console.error("Error adding product:", error);
      sendAlert({
        message: "An unexpected error occurred while adding the product.",
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* {lineItems && Object.keys(lineItems).length > 0 && ( */}
      <>
        <Flex direction="column" gap="small">
          {loadingTable ? (
            <Text format={{ fontWeight: "bold" }}>Loading...</Text>
          ) : lineItems && Object.keys(lineItems).length > 0 ? (
            <LineItemsTable lineItems={lineItems} />
          ) : (
            <Text format={{ fontWeight: "bold" }}>No line items found</Text>
          )}
          <Divider />
          <Button
            onClick={fetchLineItems}
            variant="primary"
            disabled={loadingTable}
          >
            Refresh Line Items
          </Button>
        </Flex>
        <Divider distance="large" />
      </>
      {/* )} */}
      <Heading>Add Line Item</Heading>
      <Form>
        <Flex direction="column" gap="small">
          <CommonFields
            formValues={formValues}
            setFormValues={setFormValues}
            errors={errors}
          />
          {formValues.productType === "Flight" && (
            <FlightFields
              formValues={formValues}
              setFormValues={setFormValues}
              errors={errors}
            />
          )}
          {formValues.productType === "Hotel" && (
            <HotelFields
              formValues={formValues}
              setFormValues={setFormValues}
              errors={errors}
            />
          )}
          {formValues.productType === "Transport" && (
            <TransportFields
              formValues={formValues}
              setFormValues={setFormValues}
              errors={errors}
            />
          )}
          <Button
            type="submit"
            onClick={handleSubmit}
            variant="primary"
            disabled={loading}
          >
            Add Product
          </Button>
        </Flex>
      </Form>
      <Divider />
    </>
  );
};

export default AddProductUI;
