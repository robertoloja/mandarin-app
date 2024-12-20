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
    segment: async function () {
        const sentence = '這句話要長得多，所以一旦機器學習模型已經初始化，我就可以知道這個翻譯實際上需要多長時間。'
        const response = await api.post(`/segment?data=${sentence}`)
        return response.data
    }
}
