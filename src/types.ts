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

import { z } from "zod"

export interface ZodFormOptions {
  /**
   * If true, no transformation will be applied.
   *
   * @default false
   */
  noTransform?: boolean
}

export interface ZodFormEvents {
  parsed: [string]
  parsedAll: []
  error: [z.ZodError]
}

export type FormFieldElement = HTMLInputElement | HTMLTextAreaElement | RadioNodeList
export type FormFieldValue = FormFieldValueBasic | FormFieldValueBasic[]
export type FormFieldValueBasic = string | number | boolean | File

/**
 * `type-fest` feature.
 */
export type Simplify<T> = { [KeyType in keyof T]: T[KeyType] } & {};
export type ShapeToFields<Shape extends z.ZodRawShape> = {
  [K in keyof Shape]: Simplify<Shape[K] extends z.AnyZodObject ? ShapeToFields<Shape[K]["shape"]> : string>
}
/**
 * @see https://stackoverflow.com/a/58436959/12468111
 * @see https://stackoverflow.com/questions/58434389/typescript-deep-keyof-of-a-nested-object
 */
export type Leaves<T> = T extends object ? { [K in keyof T]:
  `${Exclude<K, symbol>}${Leaves<T[K]> extends never ? "" : `.${Leaves<T[K]>}`}`
}[keyof T] : never
