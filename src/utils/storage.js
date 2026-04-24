export const getLocal = (key) => {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
}
export const setLocal = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value))
}