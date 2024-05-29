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
import { isFormFieldElement, ObjectNested, transformFieldValue } from "./helpers"
import { FormFieldElement } from "./types"

class FormTools {
  static getFieldName(field: FormFieldElement): string {
    if (field instanceof RadioNodeList) {
      const firstItem = field[0]
      if ("name" in firstItem) return String(firstItem.name)

      throw new Error("Unacceptable RadioNodeList")
    }

    return field.name
  }
  static getCurrentFieldName(event: FormEvent<HTMLFormElement>) {
    const target = (event.target as unknown) ?? event.currentTarget

    if (!isFormFieldElement(target)) {
      throw new TypeError(NOT_FORM_FIELD_ELEMENT)
    }

    return this.getFieldName(target)
  }

  static getValue(event: FormEvent<HTMLFormElement>, fieldName: string, transform = true) {
    const target = event.currentTarget
    const elements = target.elements

    const field = elements.namedItem(fieldName)

    if (!isFormFieldElement(field)) {
      throw new TypeError(NOT_FORM_FIELD_ELEMENT)
    }

    const name = this.getFieldName(field)
    const value = transform ? transformFieldValue(field) : field.value

    return { name, value }
  }

  static getAllValues(event: FormEvent<HTMLFormElement>, fieldNames: (keyof never)[], transform = true) {
    const target = event.currentTarget
    const elements = target.elements

    const values: Record<string, unknown> = {}
    for (const fieldName of fieldNames) {
      const field = elements.namedItem(String(fieldName))
      if (!isFormFieldElement(field)) continue

      const name = this.getFieldName(field)
      const value = transform ? transformFieldValue(field) : field.value
      ObjectNested.set(values, name, value)
    }

    return values
  }
}

export default FormTools
