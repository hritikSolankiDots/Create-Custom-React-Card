import React from "react";
import { Input, NumberInput, DateInput, Flex, MultiSelect, Select } from "@hubspot/ui-extensions";

const HotelFields = ({ formValues, setFormValues, errors }) => {
  return (
    <>
      <Input
        label="Hotel Name"
        id="hotelName"
        value={formValues.hotelName}
        error={!!errors.hotelName}
        validationMessage={errors.hotelName}
        onChange={(e) => setFormValues({ ...formValues, hotelName: e })}
      />
      <Input
        label="Hotel Address"
        id="hotelAddress"
        value={formValues.hotelAddress}
        error={!!errors.hotelAddress}
        validationMessage={errors.hotelAddress}
        onChange={(e) => setFormValues({ ...formValues, hotelAddress: e })}
      />
      <Flex direction="row" gap="small" justify="between">
        <DateInput
          label="Check-In Date"
          id="checkInDate"
          value={formValues.checkInDate}
          error={!!errors.checkInDate}
          validationMessage={errors.checkInDate}
          onChange={(e) => setFormValues({ ...formValues, checkInDate: e })}
        />
        <DateInput
          label="Check-Out Date"
          id="checkOutDate"
          value={formValues.checkOutDate}
          error={!!errors.checkOutDate}
          validationMessage={errors.checkOutDate}
          onChange={(e) => setFormValues({ ...formValues, checkOutDate: e })}
        />
      </Flex>
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
        label="Amenities"
        id="amenities"
        options={[
          { label: "WiFi", value: "WiFi" },
          { label: "Breakfast", value: "Breakfast" },
          { label: "Parking", value: "Parking" },
        ]}
        value={formValues.amenities}
        onChange={(e) => setFormValues({ ...formValues, amenities: e })}
      />
      <Flex direction="row" gap="small" justify="between">
        <NumberInput
          label="Number of Rooms"
          id="roomCount"
          value={formValues.roomCount}
          error={!!errors.roomCount}
          validationMessage={errors.roomCount}
          onChange={(e) => setFormValues({ ...formValues, roomCount: e })}
        />
        <NumberInput
          label="Room Unit Price"
          id="roomUnitPrice"
          value={formValues.roomUnitPrice}
          error={!!errors.roomUnitPrice}
          validationMessage={errors.roomUnitPrice}
          onChange={(e) => setFormValues({ ...formValues, roomUnitPrice: e })}
        />
      </Flex>
    </>
  );
};

export default HotelFields;