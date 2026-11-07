import { Link, Stack, router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { View } from 'react-native';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useLogin } from '../api/hook';


const schema = z.object({
  email: z.string().email('Please enter a valid email.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

type FormValues = z.infer<typeof schema>;

export default function SignInScreen() {
  const { mutate, isPending } = useLogin();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema as any),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (values: FormValues) => {
    mutate(values, {
      onSuccess: () => {
        router.replace('/documents');
      },
    });
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Sign In',
        }}
      />

      <View className="flex-1 justify-center bg-background px-6">
        <View className="gap-8">
          <View className="gap-2">
            <Text className="text-4xl font-bold">Welcome Back 👋</Text>

            <Text className="text-muted-foreground">Sign in to continue.</Text>
          </View>

          <View className="gap-4">
            <View className="gap-1">
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
                <Text className="text-sm text-destructive">{errors.email.message}</Text>
              )}
            </View>

            <View className="gap-1">
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
                <Text className="text-sm text-destructive">{errors.password.message}</Text>
              )}
            </View>

            <Link href="/(auth)/forget-password" asChild>
              <Button variant="link" className="self-end">
                <Text>Forgot Password?</Text>
              </Button>
            </Link>

            <Button disabled={!isValid || isPending} onPress={handleSubmit(onSubmit)}>
              <Text>{isPending ? 'Signing In...' : 'Sign In'}</Text>
            </Button>

            <Link href="/(auth)/sign-up" asChild>
              <Button variant="ghost">
                <Text>Don't have an account? Sign Up</Text>
              </Button>
            </Link>
          </View>
        </View>
      </View>
    </>
  );
}
