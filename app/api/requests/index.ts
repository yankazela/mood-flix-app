import axios, { AxiosResponse } from "axios";
import { readBackendSession } from "@/lib/auth/backend-session";
import { EbaseUrls, RequestParams } from "./types";

const getErrorMessage = (error: any): string => {
    return (
        error?.response?.data?.errorMessage ||
        error?.response?.data?.message ||
        error?.message ||
        "An error occurred"
    );
};

const getTokens = () => {
    const session = readBackendSession();
    return {
        access: session?.auth.tokens.accessToken ?? null,
        refresh: session?.auth.tokens.refreshToken ?? null,
        id: session?.auth.tokens.idToken ?? null,
    };
}

export const getRequest = async <T>(
    params: RequestParams,
    baseUrl: EbaseUrls | string
): Promise<AxiosResponse<T>> => {
    const BASE_URL = baseUrl;

    if (params.auth) {
        const tokens = getTokens();
        if (tokens.id && tokens.refresh) {
            params.headers = {
                ...params.headers,
                Authorization: `Bearer ${tokens.id}`
            };
        } else {
            throw new Error("Unauthorized");
        }
    }

    return axios({
        method: "get",
        url: BASE_URL + params.path,
        headers: params.headers || {},
        timeout: params.timeout || 30000,
    }).then((response) => {
        return response;
    }).catch((error) => {
        console.log("error", params.path, error.response);

        throw new Error(getErrorMessage(error));
    });
};

export const postRequest = async <T>(
    params: RequestParams,
    baseUrl: EbaseUrls | string
): Promise<AxiosResponse<T>> => {
    const BASE_URL = baseUrl;

    if (params.auth) {
        const tokens = getTokens();
        if (tokens.id && tokens.refresh) {
            params.headers = {
                ...params.headers,
                Authorization: `Bearer ${tokens.id}`
            };
        } else {
            throw new Error("Unauthorized");
        }
    }

    return axios({
        method: "post",
        url: BASE_URL + params.path,
        headers: params.headers || {},
        data: params.data,
        timeout: params.timeout || 30000,
    }).then((response) => {
        return response;
    }).catch((error) => {
        console.log("error", params.path, error.response);

        throw new Error(getErrorMessage(error));
    });
};

export const putRequest = async <T>(
    params: RequestParams,
    baseUrl: EbaseUrls | string,
): Promise<AxiosResponse<T>> => {
    const BASE_URL = baseUrl;

    if (params.auth) {
        const tokens = getTokens();
        if (tokens.id && tokens.refresh) {
            params.headers = {
                ...params.headers,
                Authorization: `Bearer ${tokens.id}`
            };
        } else {
            throw new Error("Unauthorized");
        }
    }

    return axios({
        method: "put",
        url: BASE_URL + params.path,
        headers: params.headers || {},
        data: params.data,
        timeout: params.timeout || 30000,
    }).then((response) => {
        return response;
    }).catch((error) => {
        console.log("error", params.path, error);

        throw new Error(getErrorMessage(error));
    });
};

export const patchRequest = async <T>(
    params: RequestParams,
    baseUrl: EbaseUrls | string
): Promise<AxiosResponse<T>> => {
    const BASE_URL = baseUrl;

    if (params.auth) {
        const tokens = getTokens();
        if (tokens.id && tokens.refresh) {
            params.headers = {
                ...params.headers,
                Authorization: `Bearer ${tokens.id}`
            };
        } else {
            throw new Error("Unauthorized");
        }
    }

    return axios({
        method: "patch",
        url: BASE_URL + params.path,
        headers: params.headers || {},
        data: params.data,
        timeout: params.timeout || 30000,
    }).then((response) => {
        return response;
    }).catch((error) => {
        console.log("error", params.path, error);

        throw new Error(getErrorMessage(error));
    });
};