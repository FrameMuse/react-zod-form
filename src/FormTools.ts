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

import { FormEvent } from "react"

import { NOT_FORM_FIELD_ELEMENT } from "./errors"
import { isFormFieldElement, transformFieldValue } from "./helpers"
import { FormFieldValue } from "./types"

class FormTools {
  static getValue(event: FormEvent<HTMLFormElement>, fieldName: keyof never, transform = true) {
    const target = event.currentTarget
    const elements = target.elements

    const field = elements.namedItem(String(fieldName))

    if (!isFormFieldElement(field)) {
      throw new TypeError(NOT_FORM_FIELD_ELEMENT)
    }

    if (field instanceof RadioNodeList) {
      throw new Error("Not implemented!")
    }

    const name = field.name
    const value = transform ? transformFieldValue(field) : field.value

    return { name, value }
  }

  static getCurrentValue(event: FormEvent<HTMLFormElement>, transform = true) {
    const target = event.target as unknown

    if (!isFormFieldElement(target)) {
      throw new TypeError(NOT_FORM_FIELD_ELEMENT)
    }

    if (target instanceof RadioNodeList) {
      throw new Error("Not implemented!")
    }

    const name = target.name
    const value = transform ? transformFieldValue(target) : target.value

    return { name, value }
  }

  static getAllValues(event: FormEvent<HTMLFormElement>, fieldNames: (keyof never)[], transform = true) {
    const target = event.currentTarget
    const elements = target.elements

    const values: Record<string, FormFieldValue> = {}
    for (const fieldName of fieldNames) {
      const field = elements.namedItem(String(fieldName))
      if (!isFormFieldElement(field)) continue

      if (field instanceof RadioNodeList) {
        throw new Error("Not implemented!")
      }

      values[field.name] = transform ? transformFieldValue(field) : field.value
    }

    return values
  }
}

export default FormTools
