import { enqueueSnackbar } from "notistack";

export default async function myFetch(resource: RequestInfo, options: RequestInit = {}): Promise<Response> {
    try {
        try {
            return await fetch(resource, { ...options, credentials: "include" });
        } catch (error : any) {
            enqueueSnackbar(error.message, { variant: "error" })
            return Promise.reject(error.message)
        }
    } catch (error : any) {
        console.log(error)
        enqueueSnackbar("Something went wrong with the server", { variant: "error" })
        return Promise.reject(error.message)
    }
}