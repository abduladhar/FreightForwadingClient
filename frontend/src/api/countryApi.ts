import { httpClient } from "@/api/httpClient";
import type { ApiResponse, PagedResponse } from "@/api/apiResponse";

export interface CountryDto {
  id: string;
  serialNo: number;
  name: string;
  countryCode: string;
  isoCode: string;
  mobileCode: string;
  isActive: boolean;
}

export interface CountryRequest {
  name: string;
  countryCode: string;
  isoCode: string;
  mobileCode: string;
  isActive: boolean;
}

export interface CountrySearchParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  name?: string;
  countryCode?: string;
  isoCode?: string;
  mobileCode?: string;
  isActive?: boolean;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export async function searchCountries(params: CountrySearchParams) {
  const response = await httpClient.get<ApiResponse<PagedResponse<CountryDto>>>("/api/countries/search-countries", {
    params: {
      pageNumber: params.pageNumber,
      pageSize: params.pageSize,
      search: params.search?.trim() || undefined,
      name: params.name?.trim() || undefined,
      countryCode: params.countryCode?.trim() || undefined,
      isoCode: params.isoCode?.trim() || undefined,
      mobileCode: params.mobileCode?.trim() || undefined,
      isActive: params.isActive,
      sortBy: params.sortBy ?? "SerialNo",
      sortDirection: params.sortDirection ?? "desc"
    }
  });
  return response.data.data;
}

export async function getCountryByGuid(id: string) {
  const response = await httpClient.get<ApiResponse<CountryDto>>(`/api/countries/get-country-by-guid/${id}`);
  return response.data.data;
}

export async function createCountry(request: CountryRequest) {
  const response = await httpClient.post<ApiResponse<CountryDto>>("/api/countries/create-country", request);
  return response.data.data;
}

export async function updateCountry(id: string, request: CountryRequest) {
  const response = await httpClient.put<ApiResponse<CountryDto>>(`/api/countries/update-country/${id}`, request);
  return response.data.data;
}

export async function deleteCountry(id: string) {
  await httpClient.delete(`/api/countries/delete-country/${id}`);
}

export async function getActiveCountriesForDropdown(search?: string) {
  const response = await httpClient.get<ApiResponse<CountryDto[]>>("/api/countries/active-dropdown", { params: { search } });
  return response.data.data;
}
