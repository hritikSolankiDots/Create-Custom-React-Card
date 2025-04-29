import React from "react";
import {
  Input,
  NumberInput,
  DateInput,
  Flex,
  MultiSelect,
  Select,
} from "@hubspot/ui-extensions";

const HotelFields = ({ formValues, setFormValues, errors }) => {
  return (
    <>
      <Input
        label="Hotel Name"
        id="hotelName"
        value={formValues.hotelName}
        error={!!errors.hotelName}
        validationMessage={errors.hotelName}
        placeholder="Enter hotel name"
        onChange={(e) => setFormValues({ ...formValues, hotelName: e })}
      />
      <Input
        label="Hotel Address"
        id="hotelAddress"
        value={formValues.hotelAddress}
        error={!!errors.hotelAddress}
        validationMessage={errors.hotelAddress}
        placeholder="Enter hotel address"
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
      <Flex direction="row" gap="small" justify="between">
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
          placeholder="Select room type"
          onChange={(e) => setFormValues({ ...formValues, roomType: e })}
        />
        <NumberInput
          label="Number of Guests"
          id="numberOfGuests"
          value={formValues.numberOfGuests}
          error={!!errors.numberOfGuests}
          validationMessage={errors.numberOfGuests}
          placeholder="Enter number of guests"
          onChange={(e) => setFormValues({ ...formValues, numberOfGuests: e })}
        />
      </Flex>
      <MultiSelect
        label="Amenities"
        id="amenities"
        options={[
          { label: "WiFi", value: "WiFi" },
          { label: "Breakfast", value: "Breakfast" },
          { label: "Parking", value: "Parking" },
        ]}
        value={formValues.amenities}
        placeholder="Select amenities"
        onChange={(e) => setFormValues({ ...formValues, amenities: e })}
      />
      <Flex direction="row" gap="small" justify="between">
        <NumberInput
          label="Number of Rooms"
          id="roomCount"
          value={formValues.roomCount}
          error={!!errors.roomCount}
          validationMessage={errors.roomCount}
          placeholder="Enter number of rooms"
          onChange={(e) => setFormValues({ ...formValues, roomCount: e })}
        />
        <NumberInput
          label="Room Unit Price"
          id="roomUnitPrice"
          value={formValues.roomUnitPrice}
          error={!!errors.roomUnitPrice}
          validationMessage={errors.roomUnitPrice}
          placeholder="Enter room unit price"
          onChange={(e) => setFormValues({ ...formValues, roomUnitPrice: e })}
        />
      </Flex>
    </>
  );
};

export default HotelFields;
