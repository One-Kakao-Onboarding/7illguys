"use client"

const API_KEY_STORAGE_KEY = "gemini_api_key"
const USER_NAME_STORAGE_KEY = "user_name"

export function saveApiKey(apiKey: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(API_KEY_STORAGE_KEY, apiKey)
  }
}

export function getApiKey(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(API_KEY_STORAGE_KEY)
  }
  return null
}

export function hasApiKey(): boolean {
  return !!getApiKey()
}

export function clearApiKey(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(API_KEY_STORAGE_KEY)
  }
}

export function saveUserName(userName: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_NAME_STORAGE_KEY, userName)
  }
}

export function getUserName(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(USER_NAME_STORAGE_KEY)
  }
  return null
}

export function clearUserName(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(USER_NAME_STORAGE_KEY)
  }
}
