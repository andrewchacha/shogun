import {API_URL} from '@/constants/server';
import {type ApiRes, ApiStatus} from '@/utils/types/api';
import {getHeaders} from '@/utils/api/apiHeaders';
import {tryLoginCurrentUser} from '@/utils/api/authLogin';

export const apiGet = async <T>(url: string): Promise<ApiRes<T>> => {
    const endpoint = `${API_URL}${url}`;
    const response = await fetch(endpoint, {
        method: 'GET',
        headers: getHeaders(),
    });
    const res = await response.json();
    if (res.status === ApiStatus.Success) {
        return {data: res.data, status: res.status};
    }
    if (res.status === ApiStatus.ErrorAccessTokenExpired) {
        await tryLoginCurrentUser();
    }
    if (!res.ok) {
        throw res;
    }
    throw res;
};

export const apiPost = async <T>(url: string, body?: unknown): Promise<ApiRes<T>> => {
    const endpoint = `${API_URL}${url}`;
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body),
    });
    const res = await response.json();
    if (res.status === ApiStatus.Success) {
        return {data: res.data, status: res.status};
    }
    if (!res.ok) {
        throw res;
    }
    throw res;
};
