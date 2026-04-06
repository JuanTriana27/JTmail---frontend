import axiosClient from './axiosClient';

export interface InboxItem {
    idRecipient: string;
    emailId: string;
    subject: string;
    senderName: string;
    senderEmail: string;
    isRead: boolean;
    isStarred: boolean;
    isArchived: boolean;
    isTrashed: boolean;
    sentAt: string;
}

export interface EmailDetail {
    idEmail: string;
    threadId: string;
    senderId: string;
    senderName: string;
    subject: string;
    body: string;
    status: string;
    sentAt: string;
    createdAt: string;
}

export interface SendEmailRequest {
    to: string[];
    cc?: string[];
    subject: string;
    body: string;
    threadId?: string | null;
}

export const getInbox = async (userId: string): Promise<InboxItem[]> => {
    const response = await axiosClient.get<InboxItem[]>(`/emails/inbox/${userId}`);
    return response.data;
};

export const getEmailById = async (emailId: string): Promise<EmailDetail> => {
    const response = await axiosClient.get<EmailDetail>(`/emails/${emailId}`);
    return response.data;
};

export const sendEmail = async (senderId: string, data: SendEmailRequest): Promise<EmailDetail> => {
    const response = await axiosClient.post<EmailDetail>(`/emails/send/${senderId}`, data);
    return response.data;
};

export const markAsRead = async (recipientId: string): Promise<void> => {
    await axiosClient.patch(`/emails/read/${recipientId}`);
};

export const toggleStar = async (recipientId: string): Promise<void> => {
    await axiosClient.patch(`/emails/star/${recipientId}`);
};

export const moveToTrash = async (recipientId: string): Promise<void> => {
    await axiosClient.patch(`/emails/trash/${recipientId}`);
};

export const getStarred = async (userId: string): Promise<InboxItem[]> => {
    const response = await axiosClient.get<InboxItem[]>(`/emails/starred/${userId}`);
    return response.data;
};

export const getTrash = async (userId: string): Promise<InboxItem[]> => {
    const response = await axiosClient.get<InboxItem[]>(`/emails/trash/${userId}`);
    return response.data;
};

export const getDrafts = async (userId: string): Promise<EmailDetail[]> => {
    const response = await axiosClient.get<EmailDetail[]>(`/emails/drafts/${userId}`);
    return response.data;
};