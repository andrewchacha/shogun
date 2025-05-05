import {API_URL} from '@/constants/server';
import {getHeaders} from '@/utils/api/apiHeaders';
import {uploadFiles, readFile} from '@dr.pogodin/react-native-fs';
import {ApiRes} from '@/utils/types/api';

export type fileUploadOptions = {
    uri: string;
    mimeType: string;
};

export const apiUploadThumbnail = async ({uri, mimeType}: fileUploadOptions): Promise<ApiRes<{uri: string}>> => {
    const endpoint = `${API_URL}/user/thumbnail`;

    const headers = getHeaders(false);
    const d = await readFile(uri, 'base64');

    const buf = Buffer.from(d, 'base64');
    const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
            ...headers,
            'Content-Type': mimeType,
        },
        body: buf,
    });
    return await res.json();
};
