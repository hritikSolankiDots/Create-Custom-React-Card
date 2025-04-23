import React from "react";
import { Input, Select } from "@hubspot/ui-extensions";

const CommonFields = ({ formValues, setFormValues, errors }) => {
  const productTypeLabels = {
    Flight: "Travel Journey (e.g., Delhi to Dubai Flight)",
    Hotel: "Booking Details (e.g., 2 days, 3 nights)",
    Transport: "Transport Summary (short description)",
  };

  return (
    <>
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
      {formValues.productType && (
        <Input
          label={productTypeLabels[formValues.productType]}
          id="name"
          placeholder="Enter line item name"
          type="text"
          value={formValues.name}
          error={!!errors.name}
          validationMessage={errors.name}
          onChange={(e) => setFormValues({ ...formValues, name: e })}
        />
      )}
    </>
  );
};

export default CommonFields;