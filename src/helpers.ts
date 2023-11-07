/*

MIT License

Copyright (c) 2022 FrameMuse

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

*/

import { UnreachableCodeError } from "./errors"
import { FormFieldElement, FormFieldValue } from "./types"

export function transformFieldValue(field: FormFieldElement): FormFieldValue {
  if (field instanceof HTMLInputElement) {
    if (isBooleanString(field.value)) {
      return field.value.toLowerCase() === "true"
    }

    if (field.type === "radio" || field.type === "checkbox") {
      if (field.value === "ok") {
        return field.checked
      }

      return stringToNumberOrBooleanIfNeeded(field.value)
    }

    if (field.files) {
      const files = [...field.files]
      // Multiple files
      if (field.multiple) {
        return files
      }
      // One file
      const file = files[0]
      return file
    }
  }

  if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
    if (field.value.length === 0) return ""

    return stringToNumberOrBooleanIfNeeded(field.value)
  }

  if (field instanceof RadioNodeList) {
    const radios = [...field] as HTMLInputElement[]
    const checks = radios.filter(radio => radio.checked).map(radio => radio.value)

    return checks.map(stringToNumberOrBooleanIfNeeded)
  }

  throw new UnreachableCodeError([field, typeof field])
}

/**
 * Transforms `false` and `true` to `boolean`.
 *
 * @example
 * "true" | "false"
 */
export function isBooleanString(value: string): boolean {
  return ["true", "false"].includes(value.toLowerCase())
}

export function isStringNumber(value: string): boolean {
  return !isNaN(Number(value))
}

export function isFormFieldElement(value: unknown): value is FormFieldElement {
  if (value instanceof HTMLInputElement) return true
  if (value instanceof HTMLTextAreaElement) return true
  if (value instanceof RadioNodeList) return true

  return false
}




export function stringToNumberOrBooleanIfNeeded(value: string): string | number | boolean {
  if (isStringNumber(value)) {
    return Number(value)
  }

  if (isBooleanString(value)) {
    return value.toLowerCase() === "true"
  }

  return value
}
