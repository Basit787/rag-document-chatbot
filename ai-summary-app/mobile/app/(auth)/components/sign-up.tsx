import { Link, Stack } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { View } from 'react-native';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';

import { useRegister } from '../api/hook';

const schema = z
  .object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    age: z.coerce.number().min(1, 'Age is required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirm_password: z.string().min(6),
  })
  .refine((data) => data.password === data.confirm_password, {
    path: ['confirm_password'],
    message: 'Passwords do not match',
  });

type FormValues = z.infer<typeof schema>;

export default function SignUpScreen() {
  const { mutate, isPending } = useRegister();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema as any),
    mode: 'onChange',
    defaultValues: {
      name: '',
      age: undefined,
      email: '',
      password: '',
      confirm_password: '',
    },
  });

  return (
    <>
      <Stack.Screen options={{ title: 'Sign Up' }} />

      <View className="flex-1 justify-center gap-5 bg-background px-6">
        <Text className="text-4xl font-bold">Create Account</Text>

        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <Input
              placeholder="Full Name"
              value={field.value}
              onChangeText={field.onChange}
            />
          )}
        />
        {errors.name && (
          <Text className="text-destructive">{errors.name.message}</Text>
        )}

        <Controller
          control={control}
          name="age"
          render={({ field }) => (
            <Input
              placeholder="Age"
              keyboardType="numeric"
              value={field.value?.toString() ?? ''}
              onChangeText={field.onChange}
            />
          )}
        />
        {errors.age && (
          <Text className="text-destructive">{errors.age.message}</Text>
        )}

        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <Input
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={field.value}
              onChangeText={field.onChange}
            />
          )}
        />
        {errors.email && (
          <Text className="text-destructive">{errors.email.message}</Text>
        )}

        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <Input
              placeholder="Password"
              secureTextEntry
              value={field.value}
              onChangeText={field.onChange}
            />
          )}
        />
        {errors.password && (
          <Text className="text-destructive">{errors.password.message}</Text>
        )}

        <Controller
          control={control}
          name="confirm_password"
          render={({ field }) => (
            <Input
              placeholder="Confirm Password"
              secureTextEntry
              value={field.value}
              onChangeText={field.onChange}
            />
          )}
        />
        {errors.confirm_password && (
          <Text className="text-destructive">
            {errors.confirm_password.message}
          </Text>
        )}

        <Button
          disabled={!isValid || isPending}
          onPress={handleSubmit((values) => mutate(values))}
        >
          <Text>{isPending ? 'Creating...' : 'Create Account'}</Text>
        </Button>

        <Link href="/(auth)/sign-in" asChild>
          <Button variant="ghost">
            <Text>Already have an account? Sign In</Text>
          </Button>
        </Link>
      </View>
    </>
  );
}