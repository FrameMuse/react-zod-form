import { useRef, useState } from "react"

import { ZodFormAny } from "../ZodForm"

export function useZodFormDirty<ZF extends ZodFormAny, O extends ZF["object"]["_type"]>(_zodForm: ZF, initialData: Partial<O>) {
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
