import { SignInFormValues, signInSchema } from "@/utils/validations-schemas/auth";
import { schemaResolver, useForm } from "@mantine/form";

export const useSignInForm = () =>
  useForm<SignInFormValues>({
    initialValues: { email: "", password: "" },
    // sync: true makes isValid() and validate() return their results straight away, instead of as Promises.
    validate: schemaResolver(signInSchema, { sync: true }),
  });
