import { apiSlice } from './apiSlice';

export const inventoryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: () => '/api/inventory/products',
      providesTags: ['Product', 'Inventory'],
    }),
    getSuppliers: builder.query({
      query: () => '/api/inventory/suppliers',
      providesTags: ['Supplier'],
    }),
    getPurchases: builder.query({
      query: () => '/api/inventory/purchases',
      providesTags: ['Purchase'],
    }),
    getCategories: builder.query({
      query: () => '/api/inventory/categories',
      providesTags: ['Category'],
    }),
    addProduct: builder.mutation({
      query: (data) => ({
        url: '/api/inventory/products',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),
    updateProduct: builder.mutation({
      query: (data) => ({
        url: `/api/inventory/products/${data.id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/api/inventory/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),
    addSupplier: builder.mutation({
      query: (data) => ({
        url: '/api/inventory/suppliers',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Supplier'],
    }),
    updateSupplier: builder.mutation({
      query: (data) => ({
        url: `/api/inventory/suppliers/${data.id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Supplier'],
    }),
    deleteSupplier: builder.mutation({
      query: (id) => ({
        url: `/api/inventory/suppliers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Supplier'],
    }),
    createPurchase: builder.mutation({
      query: (data) => ({
        url: '/api/inventory/purchases',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Purchase', 'Product', 'Inventory'],
    }),
    deletePurchase: builder.mutation({
      query: (id) => ({
        url: `/api/inventory/purchases/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Purchase'],
    }),
    updateStock: builder.mutation({
      query: (data) => ({
        url: `/api/inventory/products/${data.id}/stock`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Product', 'Inventory'],
    }),
    addCategory: builder.mutation({
      query: (data) => ({
        url: '/api/inventory/categories',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Category'],
    }),
    getInventoryMovements: builder.query({
      query: (productId) => productId ? `/api/inventory/movements/${productId}` : '/api/inventory/movements',
      providesTags: ['Inventory'],
    }),
    getWarehouses: builder.query({
      query: () => '/api/inventory/warehouses',
      providesTags: ['Warehouse'],
    }),
    createWarehouse: builder.mutation({
      query: (data) => ({
        url: '/api/inventory/warehouses',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Warehouse'],
    }),
    updateWarehouse: builder.mutation({
      query: (data) => ({
        url: `/api/inventory/warehouses/${data.id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Warehouse'],
    }),
    runProcurementAudit: builder.mutation({
      query: () => ({
        url: '/api/inventory/procurement/audit',
        method: 'POST',
      }),
      invalidatesTags: ['Product', 'Purchase'],
    }),
  }),
});



export const { 
  useGetProductsQuery, 
  useGetSuppliersQuery,
  useGetPurchasesQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useAddSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
  useCreatePurchaseMutation,
  useDeletePurchaseMutation,
  useUpdateStockMutation,
  useGetCategoriesQuery,
  useAddCategoryMutation,
  useGetInventoryMovementsQuery,
  useGetWarehousesQuery,
  useCreateWarehouseMutation,
  useUpdateWarehouseMutation,
  useRunProcurementAuditMutation,
} = inventoryApiSlice;


