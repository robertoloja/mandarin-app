import axios from "axios"

const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8000/api'
  : 'https://mandobot.pythonanywhere.com/api'

const api = axios.create({
  baseURL: API_BASE_URL,
})

const errorHandler = (error: { response: { status: any }; code: string }) => {
  const statusCode = error.response?.status

  if (statusCode && statusCode !== 401) {
    console.error(error)
  }
  return Promise.reject(error)
}

api.interceptors.response.use(undefined, (error) => {
  return errorHandler(error)
})

export const MandoBotAPI = {
  segment: async function (sentence: string) {
    const response = await api.post(`/segment?data=${sentence}`)
    return response.data
  },
  sse: function (
    taskId: string,
    onMessage: (data: any) => void, 
    onError?: (error: any) => void
  ) {
    const eventSource = new EventSource(`${API_BASE_URL}/segment?taskId=${taskId}`)

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        onMessage(data)
      } catch (e) {
        console.error('Failed to parse SSE message', e)
      }
    }
    eventSource.onerror = (error) => {
      if (onError) onError(error);
      else console.error("SSE Connection error:", error)
    }
    return eventSource
  }
}