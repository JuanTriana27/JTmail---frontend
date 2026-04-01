import axiosClient from './axiosClient';
import type { CreateUserRequest, UserResponse } from '../types/user.types';

export const registerUser = async (data: CreateUserRequest): Promise<UserResponse> => {
    const response = await axiosClient.post<UserResponse>('/users', data);
    return response.data;
};

export const getAllUsers = async (): Promise<UserResponse[]> => {
    const response = await axiosClient.get<UserResponse[]>('/users');
    return response.data;
};