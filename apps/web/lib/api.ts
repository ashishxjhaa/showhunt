import axios from 'axios'

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
})

/** Pulls the server error message out of an axios error, with a fallback. */
export function apiErrorMessage(err: unknown, fallback: string): string {
    return (err as { response?: { data?: { error?: string } } })?.response?.data?.error || fallback
}
