import React from "react";
import {
  Input,
  NumberInput,
  DateInput,
  Flex,
  Select,
} from "@hubspot/ui-extensions";

const TransportFields = ({ formValues, setFormValues, errors }) => {
  return (
    <>
      <Input
        label="Pick-up Location"
        id="pickupLocation"
        value={formValues.pickupLocation}
        error={!!errors.pickupLocation}
        validationMessage={errors.pickupLocation}
        placeholder="Enter pick-up location"
        onChange={(e) => setFormValues({ ...formValues, pickupLocation: e })}
      />
      <Input
        label="Drop-off Location"
        id="transportDropOff"
        value={formValues.transportDropOff}
        error={!!errors.transportDropOff}
        validationMessage={errors.transportDropOff}
        placeholder="Enter drop-off location"
        onChange={(e) => setFormValues({ ...formValues, transportDropOff: e })}
      />
      <Select
        label="Transport Type"
        id="transportType"
        options={[
          { label: "Taxi", value: "Taxi" },
          { label: "Shuttle", value: "Shuttle" },
          { label: "Private Car", value: "Private Car" },
        ]}
        value={formValues.transportType}
        error={!!errors.transportType}
        validationMessage={errors.transportType}
        placeholder="Select transport type"
        onChange={(e) => setFormValues({ ...formValues, transportType: e })}
      />
      <Flex direction="row" gap="small" justify="between">
        <NumberInput
          label="Number of Passengers"
          id="passengerCount"
          placeholder="Enter number of passengers"
          value={formValues.passengerCount}
          error={!!errors.passengerCount}
          validationMessage={errors.passengerCount}
          onChange={(e) => setFormValues({ ...formValues, passengerCount: e })}
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
      </Flex>
      <Flex direction="row" gap="small" justify="between">
        <DateInput
          label="Pick-up Date"
          id="pickupDate"
          placeholder="Enter pick-up date"
          value={formValues.pickupDate}
          error={!!errors.pickupDate}
          validationMessage={errors.pickupDate}
          onChange={(e) => setFormValues({ ...formValues, pickupDate: e })}
        />
        <Input
          label="Pick-up Time"
          id="pickupTime"
          placeholder="HH:MM"
          value={formValues.pickupTime}
          error={!!errors.pickupTime}
          validationMessage={errors.pickupTime}
          onChange={(e) => setFormValues({ ...formValues, pickupTime: e })}
        />
      </Flex>
      <Input
        label="Vehicle Details"
        id="vehicleDetails"
        placeholder="Enter vehicle details"
        value={formValues.vehicleDetails}
        error={!!errors.vehicleDetails}
        validationMessage={errors.vehicleDetails}
        onChange={(e) => setFormValues({ ...formValues, vehicleDetails: e })}
      />
      <Flex direction="row" gap="small" justify="between">
        <NumberInput
          label="Number of Vehicles"
          id="vehicleCount"
          placeholder="Enter number of vehicles"
          value={formValues.vehicleCount}
          error={!!errors.vehicleCount}
          validationMessage={errors.vehicleCount}
          onChange={(e) => setFormValues({ ...formValues, vehicleCount: e })}
        />
        <NumberInput
          label="Vehicle Unit Price"
          id="vehicleUnitPrice"
          placeholder="Enter vehicle unit price"
          value={formValues.vehicleUnitPrice}
          error={!!errors.vehicleUnitPrice}
          validationMessage={errors.vehicleUnitPrice}
          onChange={(e) =>
            setFormValues({ ...formValues, vehicleUnitPrice: e })
          }
        />
      </Flex>
    </>
  );
};

export default TransportFields;
