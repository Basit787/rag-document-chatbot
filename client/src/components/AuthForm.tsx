import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useLogin, useRegister } from '@/api/hook';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const authSchema = z
  .object({
    email: z.email('Enter a valid email'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be at most 128 characters'),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (v) => v.confirmPassword === undefined || v.confirmPassword === v.password,
    { message: 'Passwords do not match', path: ['confirmPassword'] },
  );

type AuthValues = z.infer<typeof authSchema>;

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const isRegister = mode === 'register';
  const { mutate: login, isPending: loggingIn } = useLogin();
  const { mutate: register, isPending: registering } = useRegister();

  const form = useForm<AuthValues>({
    resolver: zodResolver(authSchema),
    mode: 'onChange',
    defaultValues: isRegister
      ? { email: '', password: '', confirmPassword: '' }
      : { email: '', password: '' },
  });

  const onSubmit = ({ email, password }: AuthValues) => {
    if (isRegister) register({ email, password });
    else login({ email, password });
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">
          {isRegister ? 'Create an account' : 'Welcome back'}
        </CardTitle>
        <CardDescription>
          {isRegister
            ? 'Sign up to start chatting'
            : 'Sign in to continue chatting'}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" autoComplete="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete={
                        isRegister ? 'new-password' : 'current-password'
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isRegister && (
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
          <CardFooter className="mt-6 flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={!form.formState.isValid || loggingIn || registering}
            >
              {isRegister ? 'Sign up' : 'Sign in'}
            </Button>
            <p className="text-sm text-muted-foreground">
              {isRegister ? 'Already have an account? ' : 'New here? '}
              <Link
                to={isRegister ? '/auth/login' : '/auth/register'}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {isRegister ? 'Sign in' : 'Create an account'}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
