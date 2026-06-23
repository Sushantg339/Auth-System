import axios from "axios";

const getCookie = (name: string)=>{
    const value = `; ${document.cookie}`

    const parts = value.split(`; ${name}=`)

    if(parts.length === 2) return parts.pop()?.split(';').shift()

    return null;
}

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
});

api.interceptors.request.use((config)=>{
    const method = config.method?.toLowerCase();

    if(method == "post" || method === "put" || method === "patch" ||method == "delete"){
        const csrfToken = getCookie("csrfToken")

        if(csrfToken){
            config.headers = config.headers || {};
            config.headers.set("x-csrf-token", csrfToken);
        }
    }
    return config
}, (error)=> Promise.reject(error))


let isRefreshing = false;
let isCsrfRefreshing = false

type FailedRequest = {
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
};

let failedQueue: FailedRequest[] = [];
let csrfFailedQueue: FailedRequest[] = []

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token);
        }
    });

    failedQueue = [];
};

const processCsrfQueue = (error: any, token: string | null = null) => {
    csrfFailedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token);
        }
    });

    csrfFailedQueue = [];
};

api.interceptors.response.use((response)=>response, async(error)=>{
    const originalRequest = error.config
    if(
        error.response?.status === 403 &&
        !originalRequest._retry &&
        originalRequest.url !== "/user/refresh"
    ){
        const errorCode = error.response?.data?.code || ""

        if(errorCode.startsWith("CSRF_")){
            if(isCsrfRefreshing){
                return new Promise((resolve, reject)=>{
                    csrfFailedQueue.push({resolve, reject})
                }).then(()=> api(originalRequest))
            }

            originalRequest._retry = true
            isCsrfRefreshing = true

            try {
                await api.post('/user/refresh-csrf')
                processCsrfQueue(null)

                return api(originalRequest)
            } catch (error) {
                processCsrfQueue(error, null)
                console.log("Failed to refresh CSRF token", error)
                return Promise.reject(error)
            }finally{
                isCsrfRefreshing = false
            }
        }
        
        if(isRefreshing){
            return new Promise((resolve, reject)=>{
                failedQueue.push({resolve, reject})
            }).then(()=> api(originalRequest))
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
            await api.post('/user/refresh')
            processQueue(null)

            return api(originalRequest)
        } catch (error) {
            processQueue(error, null)
            return Promise.reject(error)
        }finally{
            isRefreshing = false
        }
    }

    return Promise.reject(error)
})

export default api;