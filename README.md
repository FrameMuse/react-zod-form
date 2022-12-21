# React Zod Form

Simple form handling with full validation control.

<!-- Form handling, relying on zod schemas.

This provides super mega simplicity in the code and gives the same amount of control over the forms. -->

## Navigation

- [React Zod Form](#react-zod-form)
  - [Navigation](#navigation)
  - [Install](#install)
    - [npm](#npm)
  - [Features](#features)
  - [Usage](#usage)
    - [Getting values](#getting-values)
    - [Handling issues](#handling-issues)
  - [Field value types](#field-value-types)
  - [Transform rules](#transform-rules)

## Install

### npm

```bash
npm i react-zod-form
```

## Features

- Zod
- Field value parser by apparent rules
- Field names helper

## Usage

### Getting values

_If you're not familiar with [`Zod`](https://zod.dev/), begin with it first._

You start from creating new `ZodForm`

```ts
import ZodForm from "react-zod-form"

const form = new ZodForm()
```

Then you declare some fields

```ts
import ZodForm from "react-zod-form"
import { z } from "zod"

const form = new ZodForm({
  userName: z.string().min(3, "Enter at least 3 chars"),
  email: z.string().email("Follow this email format: email@example.com"),
  website: z.string().url("Follow this URL format: https://example.com")
})
```

You just created Zod form!

**Notice:** _It's better to keep zod form in the low level to make sure you're creating ZodForm only once._

---

Now let's create react form component

```tsx
function ExampleForm() {
  return (
    <form>
      <input placeholder="Enter your username" required />
      <input placeholder="Enter your email" type="email" required />
      <input placeholder="Enter your website" type="url" required />
    </form>
  )
}

export default ExampleForm
```

Combine zod schema and give fields their names (help yourself with `fields`)

```tsx
import ZodForm from "react-zod-form"
import { z } from "zod"

const form = new ZodForm({
  userName: z.string().min(3, "Enter at least 3 chars"),
  email: z.string().email("Follow this email format: email@example.com"),
  website: z.string().url("Follow this URL format: https://example.com")
})

function ExampleForm() {
  return (
    <form>
      <input placeholder="Enter your username" required name={form.fields.username} />
      <input placeholder="Enter your email" type="email" required name={form.fields.email} />
      <input placeholder="Enter your website" type="url" required name={form.fields.url} />
    </form>
  )
}

export default ExampleForm
```

Now let's get some values on event (i.e. `onBlur`, `onFocus`, `onChange`, `onSubmit`, ...)

```tsx
import { FormEvent } from "react"
import ZodForm from "react-zod-form"
import { z } from "zod"

const form = new ZodForm({
  userName: z.string().min(3, "Enter at least 3 chars"),
  email: z.string().email("Follow this email format: email@example.com"),
  website: z.string().url("Follow this URL format: https://example.com")
})

function ExampleForm() {
  /**
   * Triggered on input unfocus.
   */
  function onBlur(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // Tries to return a field that was currently unfocused, otherwise throws error
    const field = form.parseCurrentField(event)
    console.log(field.name, field.value)
    
    // Tries to return all field values, otherwise throws error
    const fields = form.parseAllFields(event)
    console.log(fields)
  }
  
  return (
    <form onBlur={onBlur}>
      <input placeholder="Enter your username" required name={form.fields.username} />
      <input placeholder="Enter your email" type="email" required name={form.fields.email} />
      <input placeholder="Enter your website" type="url" required name={form.fields.url} />
    </form>
  )
}

export default ExampleForm
```

Wow, now you have your fields just in a few lines of code and it's all concise!

**Notice:** _There is a safe version of `parseAllFields` - `safeParseAllFields`, works just same as in zod._

Let's talk about form interface as you may want your form to be a "standonle module"

```tsx
import { FormEvent } from "react"
import ZodForm from "react-zod-form"
import { z } from "zod"

const form = new ZodForm({
  userName: z.string().min(3, "Enter at least 3 chars"),
  email: z.string().email("Follow this email format: email@example.com"),
  website: z.string().url("Follow this URL format: https://example.com")
})

export type ExampleFormFields = z.infer<typeof form.object>

interface ExampleFormProps {
  onBlur?(value: ExampleFormFields): void
}

function ExampleForm(props: ExampleFormProps) {
  /**
   * Triggered on input unfocus.
   */
  function onBlur(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // Tries to return a field that was currently unfocused, otherwise throws error
    const field = form.parseCurrentField(event)
    console.log(field.name, field.value)
    
    // Tries to return all field values, otherwise throws error
    const fields = form.parseAllFields(event)
    console.log(fields)
  }
  
  return (
    <form onBlur={onBlur}>
      <input placeholder="Enter your username" required name={form.fields.username} />
      <input placeholder="Enter your email" type="email" required name={form.fields.email} />
      <input placeholder="Enter your website" type="url" required name={form.fields.url} />
    </form>
  )
}

export default ExampleForm
```

I'll explain you this a bit:

Interface `ExampleFormFields` represents a value that your output will give, your output is to be methods like `onBlur`, `onFocus`, `onChange`, `onSubmit`.

### Handling issues

Issues are form errors. This is a separate module, so you need to import this along with `ZodForm`.

Let's take the previous example and start with reporting and clearing error

```tsx
import { FormEvent } from "react"
import ZodForm, { useZodFormIssues } from "react-zod-form"
import { z } from "zod"

const form = new ZodForm({
  userName: z.string().min(3, "Enter at least 3 chars"),
  email: z.string().email("Follow this email format: email@example.com"),
  website: z.string().url("Follow this URL format: https://example.com")
})

export type ExampleFormFields = z.infer<typeof form.object>

interface ExampleFormProps {
  onBlur?(value: ExampleFormFields): void
}

function ExampleForm(props: ExampleFormProps) {
  const { reportError, clearError } = useZodFormIssues(form)
  
  /**
   * Triggered on input unfocus.
   */
  function onBlur(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // Tries to return all field values, otherwise throws error
    const fields = form.parseAllFields(event)
    if (fields.success) {
      clearError() // You better clear error right after success check

      console.log(fields)
    } else {
      reportError(fields.error)
    }
  }
  
  return (
    <form onBlur={onBlur}>
      <input placeholder="Enter your username" required name={form.fields.username} />
      <input placeholder="Enter your email" type="email" required name={form.fields.email} />
      <input placeholder="Enter your website" type="url" required name={form.fields.url} />
    </form>
  )
}

export default ExampleForm
```

Now continue with displaying issue message

```tsx
import { FormEvent } from "react"
import ZodForm, { useZodFormIssues } from "react-zod-form"
import { z } from "zod"

const form = new ZodForm({
  userName: z.string().min(3, "Enter at least 3 chars"),
  email: z.string().email("Follow this email format: email@example.com"),
  website: z.string().url("Follow this URL format: https://example.com")
})

export type ExampleFormFields = z.infer<typeof form.object>

interface ExampleFormProps {
  onBlur?(value: ExampleFormFields): void
}

function ExampleForm(props: ExampleFormProps) {
  const { reportError, clearError, fieldIssues } = useZodFormIssues(form)
  
  /**
   * Triggered on input unfocus.
   */
  function onBlur(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // Tries to return all field values, otherwise throws error
    const fields = form.parseAllFields(event)
    if (fields.success) {
      clearError() // You better clear error right after success check

      console.log(fields)
    } else {
      reportError(fields.error)
    }
  }
  
  return (
    <form onBlur={onBlur}>
      {fieldIssues.username}
      <input placeholder="Enter your username" required name={form.fields.username} />
      {fieldIssues.email}
      <input placeholder="Enter your email" type="email" required name={form.fields.email} />
      {fieldIssues.url}
      <input placeholder="Enter your website" type="url" required name={form.fields.url} />
    </form>
  )
}

export default ExampleForm
```

**Notice:** _`fieldIssues` will have the same keys as your form fields._

---

Let's say all your form fields are valid, but something went wrong on a backend

```tsx
import { FormEvent } from "react"
import ZodForm, { useZodFormIssues } from "react-zod-form"
import { z } from "zod"

const form = new ZodForm({
  userName: z.string().min(3, "Enter at least 3 chars"),
  email: z.string().email("Follow this email format: email@example.com"),
  website: z.string().url("Follow this URL format: https://example.com")
})

export type ExampleFormFields = z.infer<typeof form.object>

interface ExampleFormProps {
  onBlur?(value: ExampleFormFields): void
}

function ExampleForm(props: ExampleFormProps) {
  const { reportError, clearError, fieldIssues, addIssue } = useZodFormIssues(form)
  
  /**
   * Triggered on input unfocus.
   */
  function onBlur(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // Tries to return all field values, otherwise throws error
    const fields = form.parseAllFields(event)
    if (fields.success) {
      clearError() // You better clear error right after success check

      requestBackend(fields.data)
    } else {
      reportError(fields.error)
    }
  }

  /**
   * --- THIS IS EXAMPLE ---
   */
  function requestBackend(fields: ExampleFormFields) {
    const response = send(fields)
    if (!response.error) return

    response.error.fields.forEach(field => {
      addIssue([field.name], field.message)
    })
  }
  
  return (
    <form onBlur={onBlur}>
      {fieldIssues.username}
      <input placeholder="Enter your username" required name={form.fields.username} />
      {fieldIssues.email}
      <input placeholder="Enter your email" type="email" required name={form.fields.email} />
      {fieldIssues.url}
      <input placeholder="Enter your website" type="url" required name={form.fields.url} />
    </form>
  )
}

export default ExampleForm
```


<!-- ### Observing dirty

Finding out if a form has been changed.

```tsx
import { FormEvent } from "react"
import ZodForm, { useZodFormIssues } from "react-zod-form"
import { z } from "zod"

const form = new ZodForm({
  userName: z.string().min(3, "Enter at least 3 chars"),
  email: z.string().email("Follow this email format: email@example.com"),
  website: z.string().url("Follow this URL format: https://example.com")
})

export type ExampleFormFields = z.infer<typeof form.object>

interface ExampleFormProps {
  onBlur?(value: ExampleFormFields): void
}

function ExampleForm(props: ExampleFormProps) {
  const { observe, isDirty } = useZodFormDirty(form, {/* Your default state */})
  
  /**
   * Triggered on input unfocus.
   */
  function onBlur(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // Tries to return all field values, otherwise throws error
    const fields = form.parseAllFields(event)
    if (fields.success) {
      clearError() // You better clear error right after success check

      console.log(fields)
    } else {
      reportError(fields.error)
    }
  }
  
  return (
    <form onBlur={onBlur}>
      {fieldIssues.username}
      <input placeholder="Enter your username" required name={form.fields.username} />
      <input placeholder="Enter your email" type="email" required name={form.fields.email} />
      <input placeholder="Enter your website" type="url" required name={form.fields.url} />
    </form>
  )
}

export default ExampleForm
``` -->

## Field value types

A form field value may be one of these type (can be in array):

- `string`
- `number`
- `boolean`
- `File`

Take a look at the interface to understand it better

```ts
type FormFieldValue = FormFieldValueBasic | FormFieldValueBasic[]
type FormFieldValueBasic = string | number | boolean | File
```

## Transform rules

|           Type            |      Output      | Description                                                                                               |
| :-----------------------: | :--------------: | --------------------------------------------------------------------------------------------------------- |
|           `any`           |     `number`     | If value is a parsable number, it will be converted to `number`.                                          |
|           `any`           |    `boolean`     | If value is `"true"` or `"false"`, it will be converted to `boolean`.                                     |
| `"radio"` \| `"checkbox"` |    `boolean`     | If value is `"ok"` and type is `"radio" \| "checkbox"`, the value from `checked` attribute will be taken. |
|         `"file"`          | `File \| File[]` | If type is `"file"`, it will give `File` or `File[]`, depending on `multiple` attribute.                  |
