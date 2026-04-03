import type { UserResponse } from '../types/user.types';
import axiosClient from './axiosClient';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
}

export const loginUser = async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosClient.post<LoginResponse>('/auth/login', data);
    return response.data;
};

export const getMe = async (): Promise<UserResponse> => {
    const response = await axiosClient.get<UserResponse>('/auth/me');
    return response.data;
};