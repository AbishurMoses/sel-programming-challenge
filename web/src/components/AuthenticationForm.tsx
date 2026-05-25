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
import { useState } from "react";
import { Card } from "./ui/card";

export default function AuthenticationForm() {
    const [formData, setFormData] = useState({
        serverurl: "",
        username: "",
        password: "",
    });
    const [errors, setErrors] = useState({
        serverurl: { failed: false, comment: "Only 192.168.3.2 is allowed." },
        username: { failed: false, comment: "" },
        password: { failed: false, comment: "" },
    });

    const formValidation = (field: string, value: string) => {
        switch (field) {
            case "serverurl":
                return value === "192.168.3.2";
            case "username":
                return value === "admin";
            case "password":
                return value === "admin";
            default:
                return false;
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Validate each field individually
        const isUrlValid = formValidation("serverurl", formData.serverurl);
        const isUserValid = formValidation("username", formData.username);
        const isPassValid = formValidation("password", formData.password);

        // Update the error states to trigger UI updates
        setErrors({
            serverurl: { ...errors.serverurl, failed: !isUrlValid },
            username: { ...errors.username, failed: !isUserValid },
            password: { ...errors.password, failed: !isPassValid },
        });

        // If ALL fields are valid, proceed with submission
        if (isUrlValid && isUserValid && isPassValid) {
            alert("Validation Passed");
        }
    };

    return (
        <Card className="w-full max-w-sm px-4">
            <form onSubmit={handleSubmit}>

                <FieldSet>
                    <FieldLegend>Industrial Data Monitor    </FieldLegend>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="serverurl">Server URL</FieldLabel>
                            <Input id="serverurl"
                                type="text"
                                autoComplete="on"
                                value={formData.serverurl}
                                onChange={handleChange}
                                aria-invalid={errors.serverurl.failed}
                                autoFocus
                            />
                            {errors.serverurl.failed &&
                                <FieldError>{errors.serverurl.comment}</FieldError>
                            }
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="username">Username</FieldLabel>
                            <Input id="username"
                                autoComplete="on"
                                value={formData.username}
                                onChange={handleChange}
                                aria-invalid={errors.username.failed} />
                            {errors.username.failed &&
                                <FieldError>{errors.username.comment}</FieldError>
                            }
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="password">Password</FieldLabel>
                            <Input id="password"
                                type="password"
                                autoComplete="off"
                                value={formData.password}
                                onChange={handleChange}
                                aria-invalid={errors.password.failed} />
                            {errors.password.failed &&
                                <FieldError>{errors.password.comment}</FieldError>
                            }
                        </Field>
                    </FieldGroup>
                    <Field orientation="horizontal">
                        <Button type="submit">Connect to Server</Button>
                    </Field>
                </FieldSet>
            </form>
        </Card>
    )
}