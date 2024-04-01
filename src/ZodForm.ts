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
import { z } from "zod"

import { UnreachableCodeError } from "./errors"
import EventEmitter from "./eventemitter"
import FormTools from "./FormTools"
import { ObjectNested } from "./helpers"
import { Leaves, ShapeToFields, ZodFormEvents, ZodFormOptions } from "./types"

function getDeepSchema(schema: z.AnyZodObject, path: string[]): z.ZodTypeAny {
  const currentPath = path.shift()
  if (currentPath == null) throw new UnreachableCodeError(["currentPath", currentPath])

  const nextSchema = schema.shape[currentPath]
  if (nextSchema instanceof z.ZodObject) {
    return getDeepSchema(nextSchema, path)
  }

  return nextSchema
}

/**
 * A general view of a form.
 */
class ZodForm<Shape extends z.ZodRawShape, FormObject extends z.ZodObject<Shape>> {
  private events: EventEmitter<ZodFormEvents> = new EventEmitter

  public readonly object: FormObject
  public readonly fields: ShapeToFields<Shape>
  public readonly fieldNames: Leaves<FormObject["_type"]>[]


  public constructor(readonly shape: Shape, readonly options?: ZodFormOptions) {
    this.object = z.object(shape) as FormObject
    this.fieldNames = this.getShapeFlatKeys(shape) as Leaves<FormObject["_type"]>[]
    this.fields = this.shapeToFields()
  }

  // Parsers

  // private throwIfNameNotDefined(name: string) {
  //   name = String(name)

  //   if (this.fieldNames.includes(name as never)) return

  //   throw new z.ZodError([{
  //     code: z.ZodIssueCode.custom,
  //     fatal: false,
  //     path: [name],
  //     message: `${name} field is not defined in the schema`
  //   }])
  // }

  /**
   * @throws `ZodError`
   * @returns Field name and value
   */
  public parseCurrentField<Key extends keyof Shape & string>(event: FormEvent<HTMLFormElement>) {
    const fieldName = FormTools.getCurrentFieldName(event) as Key
    if (fieldName === "") return // Skipping unnamed fields.

    return this.parseField(event, fieldName)
  }

  public parseField<Key extends keyof Shape & string>(event: FormEvent<HTMLFormElement>, fieldName: Key) {
    const { name, value } = FormTools.getValue(event, fieldName, !this.options?.noTransform)

    try {
      if (!this.fieldNames.includes(fieldName as never)) return

      const parsedValue = getDeepSchema(this.object, fieldName.split(".")).parse(value, { path: [fieldName] })
      this.events.emit("parsed", fieldName as string)

      return { name, value: parsedValue }
    } catch (error) {
      this.emitError(error)
    }
  }

  private emitError(error: unknown) {
    if (this.events.listenersOf("error") === 0) throw error
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

  private shapeToFields(): ShapeToFields<Shape> {
    const object: ShapeToFields<Shape> = {} as never

    for (const fieldName of this.fieldNames) {
      ObjectNested.set(object, fieldName, fieldName)
    }

    return object
  }

  private getShapeFlatKeys(shape: Shape, previousPath?: string): string[] {
    return Object
      .entries(shape)
      .reduce((result, [fieldName, zodType]) => {
        const nestedFieldName = (previousPath ? (previousPath + ".") : "") + fieldName

        if (zodType instanceof z.ZodObject) {
          return [...result, ...this.getShapeFlatKeys(zodType.shape, nestedFieldName)]
        }

        return [...result, nestedFieldName]
      }, [] as string[])
  }

  /**
   * Subscribes to `event` with `listener`.
   *
   * @example
   * form.on("close", () => { })
   *
   * @returns `unsubscribe` method
   */
  public on<T extends keyof ZodFormEvents>(event: T, listener: ZodFormEvents[T]) {
    this.events.on(event, listener)

    return () => {
      this.events.off(event, listener)
    }
  }
}

export default ZodForm

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ZodFormAny = ZodForm<any, any>
