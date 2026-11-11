import "react-datepicker/dist/react-datepicker.css";

import styles from "./WorkingHoursPicker.module.scss";

import React, { useState } from "react";
import DatePicker from "react-datepicker";
import HoursInput from "./HoursInput";

interface Props {
  startTime: string;
  endTime: string;
  setStartTime: (startTime: string) => void;
  setEndTime: (endTime: string) => void;
}

const getDefaultTime = (hours: number, minutes: number): Date => {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const formatTimeToString = (date: Date | null): string => {
  if (!date) return "";
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

const parseTimeStringToDate = (timeString: string | null): Date => {
  const date = new Date();
  if (!timeString) return date;

  const [hours, minutes] = timeString.split(":").map(Number);
  date.setHours(hours || 0, minutes || 0, 0, 0);
  return date;
};

export const WorkingHoursPicker: React.FC<Props> = ({
  startTime,
  endTime,
  setStartTime,
  setEndTime,
}) => {
  return (
    <div className={styles.WorkingHoursPicker}>
      <legend className={styles.WorkingHoursPicker__title}>
        Working hours
      </legend>
      <div className={styles.WorkingHoursPicker__hours}>
        <div>
          <DatePicker
            selected={parseTimeStringToDate(startTime)}
            onChange={(date: Date | null) =>
              setStartTime(formatTimeToString(date))
            }
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeCaption="Open at"
            minTime={new Date(new Date().setHours(0, 0))}
            maxTime={parseTimeStringToDate(endTime) || undefined}
            timeFormat="HH:mm"
            dateFormat="HH:mm"
            className="time-picker-input"
            customInput={<HoursInput placeholder="Select Open time" />}
          />
        </div>
        <span>-</span>

        <div>
          <DatePicker
            selected={parseTimeStringToDate(endTime)}
            onChange={(date: Date | null) =>
              setEndTime(formatTimeToString(date))
            }
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            minTime={parseTimeStringToDate(startTime) || undefined}
            maxTime={new Date(new Date().setHours(23, 45))}
            timeCaption="Close at"
            dateFormat="HH:mm"
            timeFormat="HH:mm"
            placeholderText="Select close time"
            className="time-picker-input"
            customInput={<HoursInput placeholder="Select close time" />}
          />
        </div>
      </div>
    </div>
  );
};

export default WorkingHoursPicker;
