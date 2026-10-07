export interface EndpointProps {
    endpoint: string;
    auth: boolean;
    headers: {
        [key: string]: string;
    }
}

export const endpoints = {
    createUser: (): EndpointProps => ({
        endpoint: `/user`,
        auth: false,
        headers: {
            'Content-Type': 'application/json'
        }
    }),
    login: (): EndpointProps => ({
        endpoint: `/auth/signin`,
        auth: false,
        headers: {
            'Content-Type': 'application/json'
        }
    }),
    me: (): EndpointProps => ({
        endpoint: `/user/me`,
        auth: true,
        headers: {
            'Content-Type': 'application/json'
        }
    }),
    updateUser: (): EndpointProps => ({
        endpoint: `/user`,
        auth: true,
        headers: {
            'Content-Type': 'application/json'
        }
    })
};