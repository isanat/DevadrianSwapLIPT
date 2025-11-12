"use client"

import * as React from "react"

export function useLocalStorage<T>(key: string, defaultState: T) {
  const [value, setValue] = React.useState<T>(defaultState)

  React.useEffect(() => {
    const item = localStorage.getItem(key)

    if (item) {
      try {
        setValue(JSON.parse(item))
      } catch (error) {
        setValue(defaultState)
      }
    }
  }, [key, defaultState])

  const setLocalStorage = (newValue: T | ((value: T) => T)) => {
    const valueToStore = newValue instanceof Function ? newValue(value) : newValue
    setValue(valueToStore)
    localStorage.setItem(key, JSON.stringify(valueToStore))
  }

  return [value, setLocalStorage] as const
}
