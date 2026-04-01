// Shapes de datos que vienen y van a la API de usuarios
export interface CreateUserRequest {
    email: string;
    fullName: string;
    password: string;
    avatarUrl?: string;
}

export interface UserResponse {
    idUser: string;
    email: string;
    fullName: string;
    avatarUrl: string | null;
    isActive: boolean;
    unreadCount: number;
    createdAt: string;
}

// Lo que el backend devuelve cuando hay un error de validación
export interface ErrorResponse {
    message: string;
    details: string[] | null;
    timestamp: string;
}