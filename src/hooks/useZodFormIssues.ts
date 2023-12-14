import { useEffect, useMemo, useState } from "react"
import { PartialDeep } from "type-fest"
import { ZodError, ZodIssue } from "zod"

import { ObjectNested } from "../helpers"
import { ShapeToFields } from "../types"
import { ZodFormAny } from "../ZodForm"

export interface UseZodFormIssuesOptions { }

export function useZodFormIssues<
  ZForm extends ZodFormAny,
  K extends keyof ZForm["shape"] & string
>(form: ZForm) {
  const [issues, setIssues] = useState<ZodIssue[]>([])

  useEffect(() => form.on("parsed", removeFieldIssues), [form])
  useEffect(() => form.on("parsedAll", clearIssues), [form])
  useEffect(() => form.on("error", reportError), [form])

  function getIssues(pathElement: K): ZodIssue[] {
    return issues.filter(issue => issue.path.includes(pathElement))
  }

  // function getIssue(pathElement: K): ZodIssue {
  //   return issues.filter(issue => issue.path.includes(pathElement))
  // }

  function addIssue(path: K[], message: string) {
    const issue: ZodIssue = { path, code: "custom", message }

    setIssues(issues => [...issues, issue])
  }

  function addIssues(path: K[], messages: string[]) {
    const issuesNew: ZodIssue[] = messages.map(message => ({ path, code: "custom", message }))

    setIssues(issues => [...issues, ...issuesNew])
  }

  function removeIssue(...path: K[]) {
    const pathString = path.toString()

    setIssues(issues => issues.filter(issue => issue.path.toString() !== pathString))
  }

  function reportError(error: ZodError) {
    setIssues(issues => [...issues, ...error.issues])
  }

  function removeFieldIssues(fieldName: string) {
    setIssues(issues => issues.filter(issue => issue.path.join(".") !== fieldName))
  }

  function clearIssues() {
    setIssues([])
  }

  const fieldIssues: NonNullable<PartialDeep<ShapeToFields<ZForm["shape"]>>> = useMemo(() => {
    const object: NonNullable<PartialDeep<ShapeToFields<ZForm["shape"]>>> = {} as never

    for (const issue of issues) {
      ObjectNested.set(object, issue.path.join("."), issue.message)
    }

    return object
  }, [form, issues])

  return {
    reportError,
    clearError: clearIssues,


    issues,
    fieldIssues,

    getIssues,
    setIssues,

    addIssue,
    removeIssue,

    addIssues,
  }
}

// export default useZodFormIssues
