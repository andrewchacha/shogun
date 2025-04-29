import type {ApiError} from '@/utils/types/api';

export function isApiError(err: any): err is ApiError {
    return err && typeof err.status === 'number' && (typeof err.error === 'string' || err.error === undefined);
}
