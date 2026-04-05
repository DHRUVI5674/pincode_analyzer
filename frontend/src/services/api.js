const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Request interceptor - add logging
const request = async (url, options = {}) => {
  try {
    console.log(`[API Request] ${options.method || 'GET'} ${url}`);
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`[API Error] ${response.status}:`, errorData);
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log(`[API Response] ${url}:`, data);
    return data;
  } catch (error) {
    console.error(`[API Exception] ${url}:`, error.message);
    throw error;
  }
};

// STATES API
export const getStates = async () => {
  try {
    console.log('Fetching all states...');
    const response = await request(`${API_BASE_URL}/states`);
    console.log(`Successfully fetched ${response.length} states:`, response);
    return response;
  } catch (error) {
    console.error('Error fetching states:', error);
    throw error;
  }
};

// DISTRICTS API
export const getDistricts = async (state) => {
  try {
    if (!state) {
      return [];
    }

    console.log(`Fetching districts for state: ${state}`);
    const url = `${API_BASE_URL}/states/${encodeURIComponent(state)}/districts`;
    const response = await request(url);
    console.log(`Found ${response.length} districts for state ${state}`);
    return response;
  } catch (error) {
    console.error(`Error fetching districts for ${state}:`, error);
    throw error;
  }
};

// TALUKS API
export const getTaluks = async (state, district) => {
  try {
    if (!state || !district) {
      return [];
    }

    console.log(`Fetching taluks for state: ${state}, district: ${district}`);
    const url = `${API_BASE_URL}/states/${encodeURIComponent(state)}/districts/${encodeURIComponent(district)}/taluks`;
    const response = await request(url);
    console.log(`Found ${response.length} taluks`);
    return response;
  } catch (error) {
    console.error(`Error fetching taluks for ${state}/${district}:`, error);
    throw error;
  }
};

// PIN CODES API WITH PAGINATION
export const getPincodes = async (filters = {}, page = 1, limit = 20) => {
  try {
    const params = new URLSearchParams({
      page,
      limit,
      ...(filters.state && { state: filters.state }),
      ...(filters.district && { district: filters.district }),
      ...(filters.taluk && { taluk: filters.taluk }),
    });

    console.log('Fetching PIN codes with filters:', { filters, page, limit });
    const url = `${API_BASE_URL}/pincodes?${params.toString()}`;
    const response = await request(url);
    console.log(`Fetched ${response.data.length} PIN codes (Page ${response.page} of ${response.totalPages})`);
    return response;
  } catch (error) {
    console.error('Error fetching PIN codes:', error);
    throw error;
  }
};

// SEARCH API
export const searchPincodes = async (query) => {
  try {
    if (!query || query.length < 2) {
      return [];
    }
    console.log(`Searching for: ${query}`);
    const url = `${API_BASE_URL}/search?q=${encodeURIComponent(query)}`;
    const response = await request(url);
    console.log(`Found ${response.length} results for "${query}"`);
    return response;
  } catch (error) {
    console.error('Error searching PIN codes:', error);
    throw error;
  }
};

// GET PINCODE DETAILS
export const getPincodeDetails = async (pincode) => {
  try {
    if (!pincode) {
      throw new Error('Pincode parameter is required');
    }
    console.log(`Fetching details for pincode: ${pincode}`);
    const url = `${API_BASE_URL}/pincode/${pincode}`;
    const response = await request(url);
    return response;
  } catch (error) {
    console.error(`Error fetching pincode ${pincode}:`, error);
    throw error;
  }
};

// BULK SEARCH API
export const bulkSearchPincodes = async (pincodes) => {
  try {
    console.log(`Performing bulk search for ${pincodes.length} pincodes`);
    const url = `${API_BASE_URL}/bulk-search`;
    const response = await request(url, {
      method: 'POST',
      body: JSON.stringify({ pincodes }),
    });
    return response;
  } catch (error) {
    console.error('Error in bulk search:', error);
    throw error;
  }
};

// AUTOCOMPLETE API
export const autocompleteSearch = async (query) => {
  try {
    if (!query || query.length < 1) {
      return [];
    }
    console.log(`Autocomplete search for: ${query}`);
    const url = `${API_BASE_URL}/autocomplete?q=${encodeURIComponent(query)}`;
    const response = await request(url);
    return response;
  } catch (error) {
    console.error('Error in autocomplete:', error);
    throw error;
  }
};

// EXPORT API FUNCTIONS AS DEFAULT
export default {
  getStates,
  getDistricts,
  getTaluks,
  getPincodes,
  searchPincodes,
  getPincodeDetails,
  bulkSearchPincodes,
  autocompleteSearch,
};
