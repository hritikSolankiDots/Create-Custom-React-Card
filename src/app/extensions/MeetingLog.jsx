import React, { useEffect, useState } from "react";
import {
  Button,
  Flex,
  Input,
  Select,
  TextArea,
  MultiSelect,
  hubspot,
  DateInput,
} from "@hubspot/ui-extensions";

const generateDurationOptions = () => {
  const options = [];
  for (let mins = 15; mins <= 480; mins += 15) {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;

    let label = "";
    if (hours) label += `${hours} Hour${hours > 1 ? "s" : ""}`;
    if (minutes) label += ` ${minutes} Minute${minutes > 1 ? "s" : ""}`;

    options.push({ value: String(mins), label: label.trim() });
  }
  return options;
};

const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const value = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;

      const hour12 = hour % 12 === 0 ? 12 : hour % 12;
      const ampm = hour < 12 ? "AM" : "PM";
      const label = `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`;

      options.push({ value, label });
    }
  }
  return options;
};

const getCurrentTime = () => {
  const now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();

  minutes = Math.ceil(minutes / 15) * 15;

  if (minutes === 60) {
    minutes = 0;
    hours += 1;
  }

  if (hours === 24) hours = 0; // wrap around if past midnight

  const hh = hours.toString().padStart(2, "0");
  const mm = minutes.toString().padStart(2, "0");

  return `${hh}:${mm}`;
};

// Initialize the extension
hubspot.extend(({ context, runServerlessFunction, actions }) => (
  <MeetingLog
    context={context}
    runServerless={runServerlessFunction}
    sendAlert={actions.addAlert}
  />
));

const MeetingLog = ({ context, runServerless, sendAlert }) => {
  const [formData, setFormData] = useState({
    attendees: [],
    outcome: "",
    date: null,
    time: getCurrentTime(),
    duration: "15",
    description: "",
  });

  const [contacts, setContacts] = useState([]);
  console.log(formData, "formData");
  const fetchContacts = async () => {
    const { response } = await runServerless({
      name: "MeetingLog",
      parameters: {
        action: "fetchContact",
        contactId: context.crm.objectId,
      },
    });
    setContacts(response);
    const main = response.find((c) => c.isMain);
    if (main) {
      setFormData((prev) => ({ ...prev, attendees: [main.objectId] }));
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogMeeting = async () => {
    try {
      const { response } = await runServerless({
        name: "MeetingLog",
        parameters: formData,
      });
      sendAlert({ message: response });
    } catch (error) {
      sendAlert({ message: `Error: ${error.message}`, type: "danger" });
    }
  };

  return (
    <Flex direction="column" wrap="wrap" gap="small" justify="between">
      <Flex direction="row" wrap="nowrap" gap="extra-small" justify="between">
        <MultiSelect
          value={formData.attendees}
          placeholder="Select Attendees"
          label="Attendees"
          name="attendees"
          required={true}
          onChange={(value) => handleChange("attendees", value)}
          options={contacts.map((contact) => ({
            label: `${contact.firstname} ${contact.lastname}`,
            value: contact.objectId,
          }))}
        />
        <Select
          label="Outcome"
          placeholder="Select meeting outcome"
          value={formData.outcome}
          onChange={(value) => handleChange("outcome", value)}
          options={[
            { value: "Completed", label: "Completed" },
            { value: "Scheduled", label: "Scheduled" },
            { value: "Rescheduled", label: "Rescheduled" },
            { value: "No Show", label: "No Show" },
            { value: "Canceled", label: "Canceled" },
          ]}
        />
      </Flex>

      <Flex direction="row" wrap="nowrap" gap="extra-small" justify="between">
        <DateInput
          label="Date"
          name="date"
          format="ll" // or use "YYYY-MM-DD" if you need to keep a standard format
          value={formData.date}
          onChange={(value) => handleChange("date", value)}
        />

        <Select
          label="Time"
          placeholder="Select time"
          value={formData.time}
          onChange={(value) => handleChange("time", value)}
          options={generateTimeOptions()}
        />
        <Select
          label="Duration"
          value={formData.duration}
          onChange={(value) => handleChange("duration", value)}
          options={generateDurationOptions()}
        />
      </Flex>

      <TextArea
        label="Meeting Log"
        name="meetingLog"
        placeholder="Start typing to log a meeting..."
        rows={5}
        onChange={(value) => handleChange("description", value)}
      />

      <Button variant="primary" onClick={handleLogMeeting}>
        Log meeting
      </Button>
    </Flex>
  );
};

export default MeetingLog;
