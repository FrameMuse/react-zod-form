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
import ZodForm from "./ZodForm"
import { toBoolean } from "./transforms"
import { useZodFormIssues } from "./hooks"

interface User {
  id: number
  firstName: string
  lastName: string
  userName: string
  email: string

  isBitch: boolean
}

const form = new ZodForm<Omit<User, "id">>(z.object({
  firstName: z.string().min(3, "Enter at least 3 chars"),
  lastName: z.string().min(3, "Enter at least 3 chars"),
  userName: z.string().min(3, "Enter at least 3 chars"),
  email: z.string().email("Enter correct email, e.g. email@example.com"),
  isBitch: z.string().transform(toBoolean)
}))

export type GeneralInfoFormFields = z.infer<typeof form.object>

interface GeneralInfoFormProps {
  defaultValue: User
  onSubmit?(value: GeneralInfoFormFields): void
}

function GeneralInfoForm(props: GeneralInfoFormProps) {
  const { fieldIssues } = useZodFormIssues(form)
  fieldIssues.email

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()


    const fields = form.safeParseAllFields(event)
    // if (field.success) {
    //   console.log(field)
    // } else {
    //   console.log(field.error)
    // }


    // const fields = form.safeParseAllFields(event)
    // if (fields.success) {
    //   console.log(fields.data)
    // } else {
    //   console.log(fields.error.formErrors.fieldErrors)
    // }

    // console.log(fields)


    // const formData = getFormData(event)
    // console.log(formData)
  }

  return (
    <div className="general-info">
      <h5>General Information </h5>
      <div className="general-info__info">
        <form className="general-info__inputs" onSubmit={onSubmit}>
          <input required autoComplete="given-name" defaultValue={props.defaultValue.firstName} name={form.fields.firstName}>First Name</input>
          <input required autoComplete="family-name" defaultValue={props.defaultValue.lastName} name={form.fields.lastName}>Last Name</input>
          <input required type="email" disabled defaultValue={props.defaultValue.email} name={form.fields.email}>Current Email</input>
          <input autoComplete="nickname" defaultValue={props.defaultValue.userName} name={form.fields.userName}>User Name</input>
          <button type="submit">Save</button>
        </form>
      </div>
    </div>
  )
}

export default GeneralInfoForm
