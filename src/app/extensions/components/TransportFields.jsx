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
        onChange={(e) => setFormValues({ ...formValues, pickupLocation: e })}
      />
      <Input
        label="Drop-off Location"
        id="transportDropOff"
        value={formValues.transportDropOff}
        error={!!errors.transportDropOff}
        validationMessage={errors.transportDropOff}
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
        onChange={(e) => setFormValues({ ...formValues, transportType: e })}
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
      <Flex direction="row" gap="small" justify="between">
        <DateInput
          label="Pick-up Date"
          id="pickupDate"
          value={formValues.pickupDate}
          error={!!errors.pickupDate}
          validationMessage={errors.pickupDate}
          onChange={(e) => setFormValues({ ...formValues, pickupDate: e })}
        />
        <Input
          label="Pick-up Time"
          id="pickupTime"
          value={formValues.pickupTime}
          error={!!errors.pickupTime}
          validationMessage={errors.pickupTime}
          onChange={(e) => setFormValues({ ...formValues, pickupTime: e })}
        />
      </Flex>
      <Input
        label="Vehicle Details"
        id="vehicleDetails"
        value={formValues.vehicleDetails}
        error={!!errors.vehicleDetails}
        validationMessage={errors.vehicleDetails}
        onChange={(e) => setFormValues({ ...formValues, vehicleDetails: e })}
      />
      <Flex direction="row" gap="small" justify="between">
        <NumberInput
          label="Number of Vehicles"
          id="vehicleCount"
          value={formValues.vehicleCount}
          error={!!errors.vehicleCount}
          validationMessage={errors.vehicleCount}
          onChange={(e) => setFormValues({ ...formValues, vehicleCount: e })}
        />
        <NumberInput
          label="Vehicle Unit Price"
          id="vehicleUnitPrice"
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
