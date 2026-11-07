import { Link, Stack } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { View } from 'react-native';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useForgetPassword } from '../api/hook';


const schema = z.object({
  email: z.string().email('Invalid email'),
});

type FormValues = z.infer<typeof schema>;

export default function ForgetPasswordScreen() {
  const { mutate, isPending } = useForgetPassword();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema as any),
    mode: 'onChange',
  });

  return (
    <>
      <Stack.Screen options={{ title: 'Forgot Password' }} />

      <View className="flex-1 justify-center gap-5 bg-background px-6">
        <Text className="text-4xl font-bold">Forgot Password</Text>

        <Text className="text-muted-foreground">
          Enter your email to receive a password reset link.
        </Text>

        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <Input
              placeholder="Email"
              keyboardType="email-address"
              value={field.value}
              onChangeText={field.onChange}
            />
          )}
        />

        {errors.email && <Text className="text-destructive">{errors.email.message}</Text>}

        <Button
          disabled={!isValid || isPending}
          onPress={handleSubmit((values) => mutate(values.email))}>
          <Text>{isPending ? 'Sending...' : 'Send Reset Link'}</Text>
        </Button>

        <Link href="/(auth)/sign-in" asChild>
          <Button variant="ghost">
            <Text>Back to Login</Text>
          </Button>
        </Link>
      </View>
    </>
  );
}
