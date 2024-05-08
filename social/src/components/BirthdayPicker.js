import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { setDate } from '../features/registerSlice';

export default function BirthdayPicker() {
  const dispatch = useDispatch();
  const date = useSelector((state) => state.register.date);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>

        <DatePicker
          value={date}
          onChange={(newValue) => dispatch(setDate(newValue))}
        />

    </LocalizationProvider>
  );
}
