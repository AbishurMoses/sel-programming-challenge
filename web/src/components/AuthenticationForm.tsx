
  import { Input } from "@/components/ui/input"
  import { Button } from "@/components/ui/button"
  import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSet,
  } from "@/components/ui/field"
  import { useState } from "react"
  import { Card } from "./ui/card"
  import { apiService } from "@/services/apiService"
  import type { ApiError } from "@/types/api"

  interface AuthenticationFormProps {
    onSuccess: () => void
  }

  export default function AuthenticationForm({ onSuccess }: AuthenticationFormProps) {
    const [formData, setFormData] = useState({
      serverurl: "",
      username: "",
      password: "",
    })
    const [fieldErrors, setFieldErrors] = useState({
      serverurl: { failed: false, comment: "Server URL is required." },
      username: { failed: false, comment: "Username is required." },
      password: { failed: false, comment: "Password is required." },
    })
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleChange = (e: { target: { id: any; value: any } }) => {
      const { id, value } = e.target
      setFormData((prev) => ({ ...prev, [id]: value }))
    }

    const handleSubmit = async (e: { preventDefault: () => void }) => {
      e.preventDefault()
      setSubmitError(null)

      const isUrlValid = formData.serverurl.trim().length > 0
      const isUserValid = formData.username.trim().length > 0
      const isPassValid = formData.password.length > 0

      setFieldErrors({
        serverurl: { ...fieldErrors.serverurl, failed: !isUrlValid },
        username: { ...fieldErrors.username, failed: !isUserValid },
        password: { ...fieldErrors.password, failed: !isPassValid },
      })

      if (!(isUrlValid && isUserValid && isPassValid)) return

      setIsSubmitting(true)
      try {
        await apiService.authenticate({
          serverUrl: formData.serverurl,
          username: formData.username,
          password: formData.password,
        })
        onSuccess()
      } catch (err) {
        const apiErr = err as ApiError
        setSubmitError(apiErr.message ?? "Authentication failed")
        
      } finally {
        setIsSubmitting(false)
      }
    }

    return (
      <Card className="w-full max-w-sm px-4">
        <form onSubmit={handleSubmit}>
          <FieldSet>
            <FieldLegend>Industrial Data Monitor</FieldLegend>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="serverurl">Server URL</FieldLabel>
                <Input
                  id="serverurl"
                  type="text"
                  autoComplete="on"
                  value={formData.serverurl}
                  onChange={handleChange}
                  aria-invalid={fieldErrors.serverurl.failed}
                  disabled={isSubmitting}
                  autoFocus
                />
                {fieldErrors.serverurl.failed && (
                  <FieldError>{fieldErrors.serverurl.comment}</FieldError>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input
                  id="username"
                  autoComplete="on"
                  value={formData.username}
                  onChange={handleChange}
                  aria-invalid={fieldErrors.username.failed}
                  disabled={isSubmitting}
                />
                {fieldErrors.username.failed && (
                  <FieldError>{fieldErrors.username.comment}</FieldError>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  autoComplete="off"
                  value={formData.password}
                  onChange={handleChange}
                  aria-invalid={fieldErrors.password.failed}
                  disabled={isSubmitting}
                />
                {fieldErrors.password.failed && (
                  <FieldError>{fieldErrors.password.comment}</FieldError>
                )}
              </Field>
            </FieldGroup>
            {submitError && (
              <p className="text-sm text-destructive" role="alert">
                {submitError}
              </p>
            )}
            <Field orientation="horizontal">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Connecting..." : "Connect to Server"}
              </Button>
            </Field>
          </FieldSet>
        </form>
      </Card>
    )
  }