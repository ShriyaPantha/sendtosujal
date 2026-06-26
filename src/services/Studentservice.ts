// Studentservice.ts
import axiosInstance from '../api/axiosInstance'; // your configured axios instance

// ─── Types ────────────────────────────────────────────────────────────────

export interface UserOption {
  _id: string;
  fullName: string;
  email: string;
}

export interface StudentResponse {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    email: string;
    role: string;
  };
  schoolId: {
    _id: string;
    name: string;
    email: string;
  } | null;
  parentId?: {
    _id: string;
    fullName: string;
    email: string;
  } | null;
  createdBy: {
    _id: string;
    fullName: string;
    email: string;
  };
  admissionNumber?: string | null;
  rollNumber?: string | null;
  class: string;
  section: string;
  dob?: string | null;
  address?: string | null;
  phone?: string | null;
  status: 'Active' | 'On Leave' | 'Suspended';
  profileImage?: string;
  // Additional fields from frontend (may be computed or added later)
  attendanceOverall?: number;
  currentGpa?: number;
  completedCourses?: number;
  feePaidStatus?: string;
  performance?: Array<{ semester: string; gpa: number }>;
  logs?: Array<{ date: string; text: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudentPayload {
  userId: string;
  class: string;
  section: string;
  admissionNumber?: string;
  rollNumber?: string;
  parentId?: string;
  dob?: string;
  address?: string;
  phone?: string;
}

export interface UpdateStudentPayload {
  admissionNumber?: string;
  rollNumber?: string;
  class?: string;
  section?: string;
  parentId?: string;
  dob?: string;
  address?: string;
  phone?: string;
  status?: 'Active' | 'On Leave' | 'Suspended';
  profileImage?: string;
}

// ─── API Functions ──────────────────────────────────────────────────────

/**
 * Get all students for the admin's school.
 * Optional query parameters: class, section
 */
export const getAllStudents = async (
  params?: { class?: string; section?: string }
): Promise<StudentResponse[]> => {
  const response = await axiosInstance.get('/api/students', { params });
  return response.data.data; // backend wraps in { success, count, data }
};

/**
 * Get a single student by ID (admin only).
 */
export const getStudentById = async (id: string): Promise<StudentResponse> => {
  const response = await axiosInstance.get(`/api/students/${id}`);
  return response.data.data;
};

/**
 * Create a new student (admin only).
 */
export const createStudent = async (
  payload: CreateStudentPayload
): Promise<StudentResponse> => {
  const response = await axiosInstance.post('/api/students', payload);
  return response.data.data;
};

/**
 * Update a student (admin only).
 */
export const updateStudent = async (
  id: string,
  payload: UpdateStudentPayload
): Promise<StudentResponse> => {
  const response = await axiosInstance.put(`/api/students/${id}`, payload);
  return response.data.data;
};

/**
 * Delete a student (admin only).
 */
export const deleteStudent = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/api/students/${id}`);
};

/**
 * Get available users (not yet linked to any student) for the admin's school.
 */
export const getAvailableUsers = async (): Promise<UserOption[]> => {
  const response = await axiosInstance.get('/api/students/available-users');
  return response.data.data; // backend returns { success, data }
};

/**
 * Get the logged‑in student's own profile (for student role).
 */
export const getMyProfile = async (): Promise<StudentResponse> => {
  const response = await axiosInstance.get('/api/students/me');
  return response.data.data;
};