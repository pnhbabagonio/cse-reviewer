const PREFIX = 'cse_'

export function getItem(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(PREFIX + key)
    return item ? JSON.parse(item) : defaultValue
  } catch (e) {
    return defaultValue
  }
}

export function setItem(key, value) {
  localStorage.setItem(PREFIX + key, JSON.stringify(value))
}

export function removeItem(key) {
  localStorage.removeItem(PREFIX + key)
}