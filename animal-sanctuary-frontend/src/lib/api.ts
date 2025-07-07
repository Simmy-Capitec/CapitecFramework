import axios, { AxiosResponse } from 'axios';

// ===================================================================
// API CLIENT CONFIGURATION
// ===================================================================

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000'),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Handle authentication errors
      console.error('Authentication required');
    } else if (error.response?.status === 403) {
      // Handle authorization errors
      console.error('Access forbidden');
    } else if (error.response?.status === 500) {
      // Handle server errors
      console.error('Server error occurred');
    }
    
    return Promise.reject(error);
  }
);

// ===================================================================
// TYPESCRIPT TYPES
// ===================================================================

export interface Animal {
  animal_id: number;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight_kg: number;
  gender: 'Male' | 'Female';
  color: string;
  arrival_date: string;
  adoption_status: 'Available' | 'Pending' | 'Adopted' | 'Medical Hold' | 'Not Available';
  adoption_fee: number;
  dietary_requirements?: string;
  behavioral_notes?: string;
  special_needs?: string;
  photos?: string;
  microchip_number?: string;
  habitat_name?: string;
  habitat_type?: string;
  habitat_capacity?: number;
  habitat_occupancy?: number;
  days_in_sanctuary?: number;
  medical_records_count?: number;
  application_count?: number;
  status_description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnimalWithDetails extends Animal {
  medical_history: MedicalRecord[];
  adoption_applications: AdoptionApplication[];
}

export interface MedicalRecord {
  record_id: number;
  animal_id: number;
  visit_date: string;
  visit_type: string;
  diagnosis?: string;
  treatment?: string;
  medication?: string;
  next_visit_date?: string;
  cost?: number;
  notes?: string;
  veterinarian_name?: string;
}

export interface AdoptionApplication {
  application_id: number;
  animal_id: number;
  adopter_id: number;
  application_date: string;
  status: 'Submitted' | 'Under Review' | 'Interview Scheduled' | 'Approved' | 'Rejected' | 'Completed';
  adopter_name?: string;
  adopter_email?: string;
  adopter_phone?: string;
}

export interface Adopter {
  adopter_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  housing_type: string;
  yard_fenced: boolean;
  other_pets: string;
  experience_level: string;
  references?: string;
  emergency_contact?: string;
  employment_status: string;
  annual_income?: number;
  created_at: string;
  updated_at: string;
}

export interface Habitat {
  habitat_id: number;
  habitat_name: string;
  habitat_type: string;
  capacity: number;
  current_occupancy: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Staff {
  staff_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  hire_date: string;
  salary?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnimalFilters {
  status?: string;
  species?: string;
  habitat?: number;
  available_only?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginationResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    current_page: number;
    per_page: number;
    total_records: number;
    total_pages: number;
    has_next_page: boolean;
    has_prev_page: boolean;
  };
  filters_applied?: AnimalFilters;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface AnimalStats {
  by_status: Record<string, number>;
  by_species: Array<{ species: string; count: number }>;
  averages: {
    avg_age: number;
    avg_weight: number;
    total_animals: number;
  };
  recent_arrivals: number;
}

// ===================================================================
// API FUNCTIONS
// ===================================================================

// Health Check
export const checkApiHealth = async (): Promise<ApiResponse<any>> => {
  const response: AxiosResponse<ApiResponse<any>> = await api.get('/health');
  return response.data;
};

// Animals API
export const getAnimals = async (filters?: AnimalFilters): Promise<PaginationResponse<Animal>> => {
  const response: AxiosResponse<PaginationResponse<Animal>> = await api.get('/animals', {
    params: filters,
  });
  return response.data;
};

export const getAnimal = async (id: number): Promise<ApiResponse<AnimalWithDetails>> => {
  const response: AxiosResponse<ApiResponse<AnimalWithDetails>> = await api.get(`/animals/${id}`);
  return response.data;
};

export const searchAnimals = async (term: string): Promise<ApiResponse<Animal[]> & { search_term: string; results_count: number }> => {
  const response = await api.get(`/animals/search/${encodeURIComponent(term)}`);
  return response.data;
};

export const createAnimal = async (animalData: Partial<Animal>): Promise<ApiResponse<Animal>> => {
  const response: AxiosResponse<ApiResponse<Animal>> = await api.post('/animals', animalData);
  return response.data;
};

export const updateAnimal = async (id: number, animalData: Partial<Animal>): Promise<ApiResponse<Animal>> => {
  const response: AxiosResponse<ApiResponse<Animal>> = await api.put(`/animals/${id}`, animalData);
  return response.data;
};

export const deleteAnimal = async (id: number): Promise<ApiResponse<{ animal_id: number; name: string; deleted_at: string }>> => {
  const response: AxiosResponse<ApiResponse<{ animal_id: number; name: string; deleted_at: string }>> = await api.delete(`/animals/${id}`);
  return response.data;
};

export const getAnimalStats = async (): Promise<ApiResponse<AnimalStats>> => {
  const response: AxiosResponse<ApiResponse<AnimalStats>> = await api.get('/animals/stats/summary');
  return response.data;
};

// Adopters API
export const getAdopters = async (): Promise<ApiResponse<Adopter[]>> => {
  const response: AxiosResponse<ApiResponse<Adopter[]>> = await api.get('/adopters');
  return response.data;
};

export const getAdopter = async (id: number): Promise<ApiResponse<Adopter>> => {
  const response: AxiosResponse<ApiResponse<Adopter>> = await api.get(`/adopters/${id}`);
  return response.data;
};

export const createAdopter = async (adopterData: Partial<Adopter>): Promise<ApiResponse<Adopter>> => {
  const response: AxiosResponse<ApiResponse<Adopter>> = await api.post('/adopters', adopterData);
  return response.data;
};

// Applications API
export const getApplications = async (): Promise<ApiResponse<AdoptionApplication[]>> => {
  const response: AxiosResponse<ApiResponse<AdoptionApplication[]>> = await api.get('/applications');
  return response.data;
};

export const createApplication = async (applicationData: {
  animal_id: number;
  adopter_id: number;
  questionnaire_responses?: Record<string, any>;
}): Promise<ApiResponse<AdoptionApplication>> => {
  const response: AxiosResponse<ApiResponse<AdoptionApplication>> = await api.post('/applications', applicationData);
  return response.data;
};

export const updateApplicationStatus = async (
  id: number, 
  status: AdoptionApplication['status'],
  reviewNotes?: string
): Promise<ApiResponse<AdoptionApplication>> => {
  const response: AxiosResponse<ApiResponse<AdoptionApplication>> = await api.put(`/applications/${id}/status`, {
    status,
    review_notes: reviewNotes,
  });
  return response.data;
};

// Habitats API
export const getHabitats = async (): Promise<ApiResponse<Habitat[]>> => {
  const response: AxiosResponse<ApiResponse<Habitat[]>> = await api.get('/habitats');
  return response.data;
};

// Staff API
export const getStaff = async (): Promise<ApiResponse<Staff[]>> => {
  const response: AxiosResponse<ApiResponse<Staff[]>> = await api.get('/staff');
  return response.data;
};

// Medical Records API
export const getMedicalRecords = async (animalId: number): Promise<ApiResponse<MedicalRecord[]>> => {
  const response: AxiosResponse<ApiResponse<MedicalRecord[]>> = await api.get(`/medical/animal/${animalId}`);
  return response.data;
};

export const createMedicalRecord = async (recordData: Partial<MedicalRecord>): Promise<ApiResponse<MedicalRecord>> => {
  const response: AxiosResponse<ApiResponse<MedicalRecord>> = await api.post('/medical', recordData);
  return response.data;
};

export default api;