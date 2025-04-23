import React from "react";
import {
  Input,
  NumberInput,
  Select,
  DateInput,
  Flex,
} from "@hubspot/ui-extensions";

const FlightFields = ({ formValues, setFormValues, errors }) => {
  return (
    <>
      <Input
        label="Flight Number"
        id="flightNumber"
        placeholder="Enter flight number"
        type="text"
        value={formValues.flightNumber}
        error={!!errors.flightNumber}
        validationMessage={errors.flightNumber}
        onChange={(e) => setFormValues({ ...formValues, flightNumber: e })}
      />
      <Input
        label="Airline Name"
        id="airlineName"
        placeholder="Enter airline name"
        type="text"
        value={formValues.airlineName}
        error={!!errors.airlineName}
        validationMessage={errors.airlineName}
        onChange={(e) => setFormValues({ ...formValues, airlineName: e })}
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
        label="Departure Airport"
        id="departureAirport"
        placeholder="Enter departure airport"
        type="text"
        value={formValues.departureAirport}
        error={!!errors.departureAirport}
        validationMessage={errors.departureAirport}
        onChange={(e) => setFormValues({ ...formValues, departureAirport: e })}
      />
      <Input
        label="Arrival Airport"
        id="arrivalAirport"
        placeholder="Enter arrival airport"
        type="text"
        value={formValues.arrivalAirport}
        error={!!errors.arrivalAirport}
        validationMessage={errors.arrivalAirport}
        onChange={(e) => setFormValues({ ...formValues, arrivalAirport: e })}
      />
      <Flex direction="row" gap="small" justify="between">
        <DateInput
          label="Departure Date"
          id="departureDate"
          placeholder="YYYY-MM-DD"
          value={formValues.departureDate}
          error={!!errors.departureDate}
          validationMessage={errors.departureDate}
          onChange={(e) => setFormValues({ ...formValues, departureDate: e })}
        />
        <Input
          label="Departure Time"
          id="departureTime"
          placeholder="HH:MM"
          value={formValues.departureTime}
          error={!!errors.departureTime}
          validationMessage={errors.departureTime}
          onChange={(e) => setFormValues({ ...formValues, departureTime: e })}
        />
      </Flex>
      <Flex direction="row" gap="small" justify="between">
        <DateInput
          label="Arrival Date"
          id="arrivalDate"
          placeholder="YYYY-MM-DD"
          value={formValues.arrivalDate}
          error={!!errors.arrivalDate}
          validationMessage={errors.arrivalDate}
          onChange={(e) => setFormValues({ ...formValues, arrivalDate: e })}
        />
        <Input
          label="Arrival Time"
          id="arrivalTime"
          placeholder="HH:MM"
          value={formValues.arrivalTime}
          error={!!errors.arrivalTime}
          validationMessage={errors.arrivalTime}
          onChange={(e) => setFormValues({ ...formValues, arrivalTime: e })}
        />
      </Flex>
      <Flex direction="row" gap="small" justify="between">
        <NumberInput
          label="Number of Adults"
          id="adultCount"
          value={formValues.adultCount}
          error={!!errors.adultCount}
          validationMessage={errors.adultCount}
          onChange={(e) => setFormValues({ ...formValues, adultCount: e })}
        />
        <NumberInput
          label="Adult Unit Price"
          id="adultUnitPrice"
          value={formValues.adultUnitPrice}
          error={!!errors.adultUnitPrice}
          validationMessage={errors.adultUnitPrice}
          onChange={(e) => setFormValues({ ...formValues, adultUnitPrice: e })}
        />
      </Flex>

      <Flex direction="row" gap="small" justify="between">
        <NumberInput
          label="Number of Children"
          id="childCount"
          placeholder="Enter number of children"
          type="number"
          min={0}
          value={formValues.childCount || 0}
          error={!!errors.childCount}
          validationMessage={errors.childCount}
          onChange={(e) => setFormValues({ ...formValues, childCount: e })}
        />
        <NumberInput
          label="Child Unit Price"
          id="childUnitPrice"
          placeholder="Enter price per child"
          type="number"
          min={0}
          value={formValues.childUnitPrice || 0}
          error={!!errors.childUnitPrice}
          validationMessage={errors.childUnitPrice}
          onChange={(e) => setFormValues({ ...formValues, childUnitPrice: e })}
        />
      </Flex>
      <Flex direction="row" gap="small" justify="between">
        <NumberInput
          label="Number of Infants"
          id="infantCount"
          placeholder="Enter number of infants"
          type="number"
          min={0}
          value={formValues.infantCount || 0}
          error={!!errors.infantCount}
          validationMessage={errors.infantCount}
          onChange={(e) => setFormValues({ ...formValues, infantCount: e })}
        />
        <NumberInput
          label="Infant Unit Price"
          id="infantUnitPrice"
          placeholder="Enter price per infant"
          type="number"
          min={0}
          value={formValues.infantUnitPrice || 0}
          error={!!errors.infantUnitPrice}
          validationMessage={errors.infantUnitPrice}
          onChange={(e) => setFormValues({ ...formValues, infantUnitPrice: e })}
        />
      </Flex>

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
  );
};

export default FlightFields;
