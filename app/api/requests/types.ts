
export enum EbaseUrls {
    MOOD_BE = "https://mobgc8hyw7.execute-api.us-east-1.amazonaws.com/dev/api/v1/movie-mood",
    // ISHANGO_BE = "http://localhost:3001/api/v1",
}

export interface RequestParams {
    path: string;
    auth: boolean;
    headers: {
        [key: string]: string;
    }
    data?: any;
    timeout?: number;
}