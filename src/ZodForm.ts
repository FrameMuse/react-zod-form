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

import EventEmitter from "eventemitter3"
import { FormEvent } from "react"
import { z, ZodError } from "zod"

import FormTools from "./FormTools"
import { ZodFormEvents, ZodFormOptions } from "./types"

/**
 * A general view of a form.
 */
class ZodForm<Output, Shape extends z.ZodRawShape = {
  [K in keyof Output]: z.ZodType<Output[K], z.ZodTypeDef, unknown>
}> {
  private events: EventEmitter<ZodFormEvents> = new EventEmitter

  public readonly object: z.ZodObject<Shape>
  public readonly fields: Record<keyof Shape, string>
  public readonly fieldNames: (keyof Shape)[]


  public constructor(readonly shape: Shape, readonly options?: ZodFormOptions) {
    this.object = z.object(shape)
    this.fields = this.reduceFields(shape)
    this.fieldNames = Object.keys(shape)
  }

  // Parsers

  /**
   * @throws `ZodError`
   * @returns Field name and value
   */
  public parseCurrentField<Key extends keyof Output>(event: FormEvent<HTMLFormElement>, fieldName?: Key) {
    const { name, value } = FormTools.getCurrentValue(event, this.fieldNames, !this.options?.noTransform)

    // This shouldn't be under try-catch block because it's not a user error.
    this.validateCurrentFieldName(name, fieldName)

    try {
      const parsedValue = this.object.shape[name].parse(value, { path: [name] }) as Output[Key]
      this.events.emit("parsed", name)

      return { name, value: parsedValue }
    } catch (error) {
      this.emitError(error)
    }
  }

  public safeParseCurrentField<Key extends keyof Output>(event: FormEvent<HTMLFormElement>, fieldName?: Key) {
    const { name, value } = FormTools.getCurrentValue(event, this.fieldNames, !this.options?.noTransform)

    this.validateCurrentFieldName(name, fieldName)

    const parsedValue = this.object.shape[name].safeParse(value, { path: [name] })
    if (parsedValue.success) {
      this.events.emit("parsed", name)
    } else {
      this.events.emit("error", parsedValue.error)
    }

    return { name, value: parsedValue }
  }

  private validateCurrentFieldName(name: string, fieldName?: keyof never) {
    if (fieldName == null) return
    if (name === fieldName) return

    throw new ZodError([{
      fatal: true,
      code: "custom",
      path: [fieldName as string],
      message: "Given `fieldName` doesn't relate to the current field."
    }])
  }

  private emitError(error: unknown) {
    if (this.events.listenerCount("error") === 0) throw error
    if (!(error instanceof z.ZodError)) throw error

    this.events.emit("error", error)
  }


  /**
   * @throws `ZodError`
   * @returns Fields dictionary
   */
  public parseAllFields(event: FormEvent<HTMLFormElement>) {
    const values = FormTools.getAllValues(event, this.fieldNames, !this.options?.noTransform)

    try {
      const parsedValues = this.object.parse(values)
      this.events.emit("parsedAll")
      return parsedValues
    } catch (error) {
      this.emitError(error)
    }
  }

  public safeParseAllFields(event: FormEvent<HTMLFormElement>) {
    const values = FormTools.getAllValues(event, this.fieldNames, !this.options?.noTransform)

    const parsedValues = this.object.safeParse(values)
    if (parsedValues.success) {
      this.events.emit("parsedAll")
    } else {
      this.events.emit("error", parsedValues.error)
    }
    return parsedValues
  }

  // Helpers

  private reduceFields(shape: Shape): Record<keyof Shape, string> {
    const fieldNames = Object.keys(shape)
    const fields = fieldNames.reduce((result, nextName) => ({ ...result, [nextName]: nextName }), {} as Record<keyof Shape, string>)

    return fields
  }

  /**
   * Subscribes to `event` with `listener`.
   *
   * @example
   * form.on("close", () => { })
   *
   * @returns `unsubscribe` method
   */
  public on<T extends keyof ZodFormEvents>(event: T, listener: (...args: ZodFormEvents[T]) => void) {
    this.events.on(event, listener)

    return () => {
      this.events.off(event, listener)
    }
  }
}

export default ZodForm

// interface UseFieldsOptions {}

// interface UseFieldsReturn<T extends Record<K, FormFieldValue>, K extends string> {
//   /**
//    * Helps you specify the input name, so you don't mistype it and provides type safety.
//    */
//   fields: Record<K, string>
//   /**
//    * Array of field names
//    */
//   fieldNames: K[]

//   getCurrentField(event: FormEvent<HTMLFormElement>): ValuesOf<{ [K in keyof T]: { name: K, value: T[K] } }>
//   getAllFields(event: FormEvent<HTMLFormElement>): T

//   getFormData(event: FormEvent<HTMLFormElement>): FormData
// }

// function useFields<
//   T extends Record<K, FormFieldValue>,
//   K extends string = keyof T extends string ? keyof T : never
// >(fieldsEnum: Record<keyof T, number | string>): UseFieldsReturn<T, K> {
//   const fieldNames = Enum.keys(fieldsEnum) as K[]
//   const fields = fieldNames.reduce((result, nextName) => ({ ...result, [nextName]: nextName }), {} as Record<K, string>)


//   return {
//     fields,
//     fieldNames,

//     getCurrentField,
//     getAllFields,

//     getFormData
//   }
// }

// function getCurrentField<
//   T extends Record<K, FormFieldValue>,
//   K extends string = keyof T extends string ? keyof T : string
// >(event: FormEvent<HTMLFormElement>, fields?: Record<K, string | number>) {
//   const target = event.target as unknown
//   const fieldNames = (fields ? Object.keys(fields) : []) as K[]

//   if (!isFormFieldElement(target)) {
//     throw new TypeError("This target is not FormFieldElement (HTMLInputElement | HTMLTextAreaElement | RadioNodeList).")
//   }

//   if (target instanceof RadioNodeList) {
//     throw new Error("Not implemented!")
//   }

//   if (!fieldNames.includes(target.name as K)) {
//     throw new Error(`${target.name} field is probably not defined.`)
//   }

//   const name = target.name as K
//   const value = getFieldValue(target)

//   return { name, value }
// }

// function getAllFields<
//   T extends Record<K, FormFieldValue>,
//   K extends string = keyof T extends string ? keyof T : string
// >(event: FormEvent<HTMLFormElement>, fields?: Record<K, string | number>) {
//   const target = event.currentTarget
//   const fieldNames = (fields ? Object.keys(fields) : []) as K[]

//   checkIfAllFieldsDefined(fieldNames, target.elements)

//   return getFieldValues(target.elements, fieldNames) as T
// }

// function getFormData(event: FormEvent<HTMLFormElement>): FormData {
//   return new FormData(event.currentTarget)
// }
