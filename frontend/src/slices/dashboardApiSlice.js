import { apiSlice } from './apiSlice';

export const dashboardApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStats: builder.query({
      query: () => '/api/dashboard/stats',
      providesTags: ['Inventory', 'JobCard', 'Attendance', 'Payroll', 'Finance', 'Communication'],
    }),
    getRevenueChart: builder.query({
      query: () => '/api/dashboard/revenue-chart',
    }),
  }),
});

export const { useGetStatsQuery, useGetRevenueChartQuery } = dashboardApiSlice;
