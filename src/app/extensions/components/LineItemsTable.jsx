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
} from "@hubspot/ui-extensions";

const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return "N/A"; // Handle null or undefined values
  const date = new Date(dateTimeStr);
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const LineItemsTable = ({ lineItems }) => {
  // Render rows for Flight items
  const renderFlightRows = (flights) => {
    return flights.map((item, index) => (
      <TableRow key={item.hs_object_id || index}>
        {/* <TableCell width="min">{item.name}</TableCell> */}
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
        <TableCell width="min">{item.check_in_date}</TableCell>
        <TableCell width="min">{item.check_out_date}</TableCell>
        <TableCell width="min">{item.quantity}</TableCell>
        <TableCell width="min">{item.price}</TableCell>
        <TableCell width="min">{item.amount}</TableCell>
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
        <TableCell width="min">
          {formatDateTime(item.pickup_date___time)}
        </TableCell>
        <TableCell width="min">
          {item.estimated_travel_duration_minutes}
        </TableCell>
        <TableCell width="min">{item.quantity}</TableCell>
        <TableCell width="min">{item.price}</TableCell>
        <TableCell width="min">{item.amount}</TableCell>
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
          <TableCell width="min"></TableCell>
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
                <TableHeader width="min">Check-In Date</TableHeader>
                <TableHeader width="min">Check-Out Date</TableHeader>
                <TableHeader width="min">Quantity</TableHeader>
                <TableHeader width="min">Unit Price</TableHeader>
                <TableHeader width="min">Amount</TableHeader>
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
                <TableHeader width="min">Pickup Time</TableHeader>
                <TableHeader width="min">Travel Duration (mins)</TableHeader>
                <TableHeader width="min">Quantity</TableHeader>
                <TableHeader width="min">Unit Price</TableHeader>
                <TableHeader width="min">Amount</TableHeader>
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
