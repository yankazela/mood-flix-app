import axios, { AxiosResponse } from "axios";
import { getValidIdToken, refreshSession } from "@/lib/auth/token-refresh";
import { EbaseUrls, RequestParams } from "./types";

/** An API failure, with the HTTP status when the server answered (absent for network errors). */
export class ApiError extends Error {
    status?: number;

    constructor(message: string, status?: number) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}

const getErrorMessage = (error: any): string => {
    return (
        error?.response?.data?.errorMessage ||
        error?.response?.data?.message ||
        error?.message ||
        "An error occurred"
    );
};

type Method = "get" | "post" | "put" | "patch" | "delete";

/**
 * Sends one request. Authenticated calls carry a fresh id token; a 401 triggers one token
 * refresh and a retry, so an expired token never surfaces as a failure to the person using the app.
 */
async function send<T>(method: Method, params: RequestParams, baseUrl: EbaseUrls | string, retried = false): Promise<AxiosResponse<T>> {
    const headers: Record<string, string> = { ...(params.headers || {}) };

    if (params.auth) {
        try {
            headers.Authorization = `Bearer ${await getValidIdToken()}`;
        } catch (error: any) {
            throw new ApiError(error?.message || "Unauthorized", 401);
        }
    }

    try {
        return await axios<T>({
            method,
            url: baseUrl + params.path,
            headers,
            data: params.data,
            timeout: params.timeout || 30000,
        });
    } catch (error: any) {
        const status: number | undefined = error?.response?.status;

        if (params.auth && status === 401 && !retried) {
            try {
                await refreshSession();
            } catch (refreshError: any) {
                throw new ApiError(refreshError?.message || "Unauthorized", 401);
            }
            return send<T>(method, params, baseUrl, true);
        }

        console.warn("API request failed", method.toUpperCase(), params.path, status ?? error?.message);

        throw new ApiError(getErrorMessage(error), status);
    }
}

export const getRequest = <T>(params: RequestParams, baseUrl: EbaseUrls | string) => send<T>("get", params, baseUrl);

export const postRequest = <T>(params: RequestParams, baseUrl: EbaseUrls | string) => send<T>("post", params, baseUrl);

export const putRequest = <T>(params: RequestParams, baseUrl: EbaseUrls | string) => send<T>("put", params, baseUrl);

export const patchRequest = <T>(params: RequestParams, baseUrl: EbaseUrls | string) => send<T>("patch", params, baseUrl);
