import React from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Heading,
  Text,
  Divider,
  Icon,
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  Flex,
} from "@hubspot/ui-extensions";

const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return "N/A"; // Handle null or undefined values
  const date = new Date(dateTimeStr);
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const LineItemsTable = ({ lineItems, handleDeleteLineItem, actions }) => {
  const renderDeleteButton = (item, isFlightGroup = false) => {
    // Create modal ID
    const modalId = `delete-modal-${
      isFlightGroup ? item[0].flight_group_id : item.hs_object_id
    }`;

    return (
      <Button
        variant="destructive"
        size="sm"
        overlay={
          <Modal
            id={modalId}
            title="Confirm Delete"
            variant="danger"
            width="md"
          >
            <ModalBody>
              {isFlightGroup ? (
                <>
                  <Text>
                    Are you sure you want to delete this flight group?
                  </Text>
                  <Text format={{ fontWeight: "bold" }}>{item[0].name}</Text>
                  <Divider />
                  <Text>This will delete the following bookings:</Text>
                  {item.map((flight) => (
                    <Text key={flight.hs_object_id}>
                      • {flight.passenger_type} - {flight.quantity} x $
                      {flight.price}
                    </Text>
                  ))}
                </>
              ) : (
                <>
                  <Text>
                    Are you sure you want to delete this {item.hs_product_type}{" "}
                    line item?
                  </Text>
                  <Text format={{ fontWeight: "bold" }}>{item.name}</Text>
                </>
              )}
            </ModalBody>
            <ModalFooter>
              <Flex justify="end" gap="small">
                <Button
                  variant="secondary"
                  onClick={() => actions.closeOverlay(modalId)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDeleteLineItem(isFlightGroup ? item : [item]);
                    actions.closeOverlay(modalId);
                  }}
                >
                  Delete
                </Button>
              </Flex>
            </ModalFooter>
          </Modal>
        }
      >
        <Icon name="delete" />
      </Button>
    );
  };

  // Render rows for Flight items
  const passengerTypeOrder = {
    Adult: 1,
    Children: 2,
    Infant: 3,
  };

  // Update the renderFlightRows function
  const renderFlightRows = (flights) => {
    // Sort flights based on passenger type
    const sortedFlights = [...flights].sort(
      (a, b) =>
        passengerTypeOrder[a.passenger_type] -
        passengerTypeOrder[b.passenger_type]
    );

    return sortedFlights.map((item, index) => (
      <TableRow key={item.hs_object_id || index}>
        <TableCell width="min">{item.flight_number}</TableCell>
        <TableCell width="min">{item.departure_airport}</TableCell>
        <TableCell width="min">{item.arrival_airport}</TableCell>
        <TableCell width="min">
          {formatDateTime(item.departure_date___time)}
        </TableCell>
        <TableCell width="min">
          {formatDateTime(item.arrival_date___time)}
        </TableCell>
        <TableCell width="min">{item.passenger_type}</TableCell>
        <TableCell width="min">{item.quantity}</TableCell>
        <TableCell width="min">{item.price}</TableCell>
        <TableCell width="min">{item.amount}</TableCell>
      </TableRow>
    ));
  };

  // Render rows for Hotel items
  const renderHotelRows = (hotels) => {
    return hotels.map((item, index) => (
      <TableRow key={item.hs_object_id || index}>
        <TableCell width="min">{item.name}</TableCell>
        <TableCell width="min">{item.hotel_name}</TableCell>
        <TableCell width="min">{item.room_type}</TableCell>
        <TableCell width="min">{item.number_of_guests}</TableCell>
        <TableCell width="min">
          {item.additional_amenities?.split(";").join(", ")}
        </TableCell>
        <TableCell width="min">{item.check_in_date}</TableCell>
        <TableCell width="min">{item.check_out_date}</TableCell>
        <TableCell width="min">{item.quantity}</TableCell>
        <TableCell width="min">{item.price}</TableCell>
        <TableCell width="min">{item.amount}</TableCell>
        <TableCell width="min">{renderDeleteButton(item)}</TableCell>
      </TableRow>
    ));
  };

  // Render rows for Transport items
  const renderTransportRows = (transports) => {
    return transports.map((item, index) => (
      <TableRow key={item.hs_object_id || index}>
        <TableCell width="min">{item.name}</TableCell>
        <TableCell width="min">{item.transport_type}</TableCell>
        <TableCell width="min">{item.pickup_location}</TableCell>
        <TableCell width="min">{item.drop_off_location}</TableCell>
        <TableCell width="min">{item.number_of_passengers_transport}</TableCell>
        <TableCell width="min">
          {formatDateTime(item.pickup_date___time)}
        </TableCell>
        <TableCell width="min">
          {item.estimated_travel_duration_minutes}
        </TableCell>
        <TableCell width="min">{item.quantity}</TableCell>
        <TableCell width="min">{item.price}</TableCell>
        <TableCell width="min">{item.amount}</TableCell>
        <TableCell width="min">{renderDeleteButton(item)}</TableCell>
      </TableRow>
    ));
  };

  // Render grouped flight rows
  const renderFlightGroups = (flightGroups) => {
    return Object.entries(flightGroups).map(([groupId, flights]) => (
      <React.Fragment key={groupId}>
        <TableRow>
          <TableCell width="min">
            <Text format={{ fontWeight: "bold" }}>{flights[0].name}</Text>
          </TableCell>
          <TableCell width="min">
            <Text>{renderDeleteButton(flights, true)}</Text>
          </TableCell>
          <TableCell width="min"></TableCell>
          <TableCell width="min"></TableCell>
          <TableCell width="min"></TableCell>
          <TableCell width="min"></TableCell>
          <TableCell width="min"></TableCell>
          <TableCell width="min"></TableCell>
        </TableRow>
        {renderFlightRows(flights)}
      </React.Fragment>
    ));
  };

  return (
    <>
      {/* Flight Table */}
      {lineItems.Flight && (
        <>
          <Heading>Flights</Heading>
          <Table bordered={true} inline={true}>
            <TableHead>
              <TableRow>
                {/* <TableHeader width="min">Name</TableHeader> */}
                <TableHeader width="min">Flight Number</TableHeader>
                <TableHeader width="min">Departure Airport</TableHeader>
                <TableHeader width="min">Arrival Airport</TableHeader>
                <TableHeader width="min">Departure Date/Time</TableHeader>
                <TableHeader width="min">Arrival Date/Time</TableHeader>
                <TableHeader width="min">Passenger Type</TableHeader>
                <TableHeader width="min">Quantity</TableHeader>
                <TableHeader width="min">Unit Price</TableHeader>
                <TableHeader width="min">Amount</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>{renderFlightGroups(lineItems.Flight)}</TableBody>
          </Table>
          <Divider distance="large" />
        </>
      )}

      {/* Hotel Table */}
      {lineItems.Hotel && (
        <>
          <Heading>Hotels</Heading>
          <Table bordered={true} inline={true}>
            <TableHead>
              <TableRow>
                <TableHeader width="min">Name</TableHeader>
                <TableHeader width="min">Hotel Name</TableHeader>
                <TableHeader width="min">Room Type</TableHeader>
                <TableHeader width="min">Number of Guests</TableHeader>
                <TableHeader width="min">Amenities</TableHeader>
                <TableHeader width="min">Check-In Date</TableHeader>
                <TableHeader width="min">Check-Out Date</TableHeader>
                <TableHeader width="min">Quantity</TableHeader>
                <TableHeader width="min">Unit Price</TableHeader>
                <TableHeader width="min">Amount</TableHeader>
                <TableHeader width="min">Action</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>{renderHotelRows(lineItems.Hotel)}</TableBody>
          </Table>
          <Divider distance="large" />
        </>
      )}

      {/* Transport Table */}
      {lineItems.Transport && (
        <>
          <Heading>Transport</Heading>
          <Table bordered={true} inline={true}>
            <TableHead>
              <TableRow>
                <TableHeader width="min">Name</TableHeader>
                <TableHeader width="min">Transport Type</TableHeader>
                <TableHeader width="min">Pickup Location</TableHeader>
                <TableHeader width="min">Drop-Off Location</TableHeader>
                <TableHeader width="min">Number of Passengers</TableHeader>
                <TableHeader width="min">Pickup Time</TableHeader>
                <TableHeader width="min">Travel Duration (mins)</TableHeader>
                <TableHeader width="min">Quantity</TableHeader>
                <TableHeader width="min">Unit Price</TableHeader>
                <TableHeader width="min">Amount</TableHeader>
                <TableHeader width="min">Action</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>{renderTransportRows(lineItems.Transport)}</TableBody>
          </Table>
        </>
      )}
    </>
  );
};

export default LineItemsTable;
