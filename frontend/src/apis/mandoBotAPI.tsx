import axios from "axios"
import { api } from "./configs/axiosClient"

export const MandoBotAPI = {
    getTexts: async function () {
        const response = await api.request({
            url: '/texts/',
            method: "GET",
        })
        return response.data
    },
    segment: async function (sentence: string) {
        const response = await api.post(`/segment?data=${sentence}`)
        return response.data
    }
}
