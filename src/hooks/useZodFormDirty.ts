import { useRef, useState } from "react"

import ZodForm from "../ZodForm"

export function useZodFormDirty<O extends Record<K, unknown>, K extends string>(_zodForm: ZodForm<O>, initialData: Partial<O>) {
  const dataRef = useRef<Partial<O>>(initialData)
  const [defaultData, setDefaultData] = useState<Partial<O>>(initialData)

  const [isDirty, setIsDirty] = useState(false)

  function observe(dataNew: Partial<O>) {
    dataRef.current = { ...dataRef.current, ...dataNew }

    setIsDirty(checkIfDirty())
  }

  /**
   * Rewrite default
   */
  function setDefault(data: Partial<O>) {
    setDefaultData(data)
  }
  function checkIfDirty(): boolean {
    return JSON.stringify(dataRef.current) !== JSON.stringify(defaultData)
  }

  return {
    observe,
    setDefault,
    checkIfDirty,

    isDirty
  }
}
