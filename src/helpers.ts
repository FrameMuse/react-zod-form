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

/**
 * - If all nodes are radio, this is a single key-value.
 * - If one node is checkbox, this is a array of values.
 */
function resolveRadioNodeList(list: RadioNodeList): string | string[] {
  let hasOnlyRadios = true
  const values: string[] = []

  for (const item of list) {
    if (item instanceof HTMLInputElement) {
      if (item.type !== "radio") hasOnlyRadios = false
      if (item.checked === false) continue
    }

    if ("value" in item === false) continue
    values.push(String(item.value))
  }

  if (hasOnlyRadios) return list.value

  return values
}

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
    const value = resolveRadioNodeList(field)

    if (value instanceof Array) {
      return value.map(stringToNumberOrBooleanIfNeeded)
    }

    return stringToNumberOrBooleanIfNeeded(value)
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

/**
 * https://stackoverflow.com/questions/38304401/javascript-check-if-dictionary/71975382#71975382
 */
export function isRecord(object: unknown): object is Record<keyof never, unknown> {
  return object instanceof Object && object.constructor === Object
}


export class ObjectNested {
  /**
   * @see https://stackoverflow.com/questions/18936915
   * @see https://stackoverflow.com/a/69890554/12468111
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static set(object: Record<keyof never, any>, key: string, value: unknown): void {
    const keys = key.split(".")

    const lastKey = keys.pop()
    if (lastKey == null) return

    const lastObject = keys.reduce((result, nextKey) => result[nextKey] ??= {}, object)
    lastObject[lastKey] = value
  }

  /**
   * @see https://dev.to/flexdinesh/accessing-nested-objects-in-javascript--9m4
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static get<T extends Record<keyof never, any>, K extends keyof T>(object: T, key: K): T[K] {
    const keys = String(key).split(".")
    const result = keys.reduce((result, nextKey) => result?.[nextKey], object)
    return result as T[K]
  }
}
