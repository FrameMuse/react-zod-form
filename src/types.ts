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

export interface ZodFormOptions {
  /**
   * If true, no transfomation will be applied.
   * 
   * @default false
   */
  noTransform?: boolean
}

export type FormFieldElement = HTMLInputElement | HTMLTextAreaElement | RadioNodeList
export type FormFieldValue = FormFieldValueBasic | FormFieldValueBasic[]
export type FormFieldValueBasic = string | number | boolean | File
