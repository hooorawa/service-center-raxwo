import { fetchBaseQuery, createApi } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({ 
  baseUrl: '',
  prepareHeaders: (headers) => {
    return headers;
  },
  credentials: 'include',
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ['Admin', 'Customer', 'Vehicle', 'JobCard', 'Product', 'Appointment', 'Inventory', 'Attendance', 'Employee', 'Quotation', 'Invoice', 'Payment', 'Insurance', 'Warranty'],
  endpoints: (builder) => ({}),
});
