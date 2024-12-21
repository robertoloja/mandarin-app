import { api } from "./configs/axiosClient"

export const MandoBotAPI = {
    segment: async function (sentence: string) {
        const response = await api.post(`/segment?data=${sentence}`)
        return response.data
    },
}
