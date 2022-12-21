import { useState } from "react"
import { ZodError, ZodIssue } from "zod"
import ZodForm from "../ZodForm"

export interface UseZodFormIssuesOptions { }

export function useZodFormIssues<O extends Record<K, unknown>, K extends string>({ fieldNames }: ZodForm<O>, options?: UseZodFormIssuesOptions) {
  const [issues, setIssues] = useState<ZodIssue[]>([])

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

  const fieldIssues: Record<K, string | undefined> = fieldNames.reduce((result, nextFieldName) => ({
    ...result,
    [nextFieldName]: getIssues(nextFieldName as K).at(0)?.message
  }), {} as Record<K, string | undefined>)

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