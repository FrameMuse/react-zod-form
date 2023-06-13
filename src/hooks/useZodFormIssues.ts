import { useEffect, useMemo, useState } from "react"
import { ZodError, ZodIssue } from "zod"
import ZodForm from "../ZodForm"

export interface UseZodFormIssuesOptions { }

export function useZodFormIssues<
  O extends Record<keyof never, unknown>,
  K extends (keyof O & string)
>(form: ZodForm<O>, options?: UseZodFormIssuesOptions) {
  const [issues, setIssues] = useState<ZodIssue[]>([])

  useEffect(() => form.on("parsed", clearError), [form])
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

  function reportError(error: ZodError<O>) {
    setIssues(error.issues)
  }

  function clearError() {
    setIssues([])
  }

  const fieldIssues: Partial<Record<K, string>> = useMemo(() => {
    return form.fieldNames.reduce((result, nextFieldName) => ({
      ...result,
      [nextFieldName]: getIssues(nextFieldName as K).at(0)?.message
    }), {} as Partial<Record<K, string>>)
  }, [form, getIssues])

  return {
    reportError,
    clearError,


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
