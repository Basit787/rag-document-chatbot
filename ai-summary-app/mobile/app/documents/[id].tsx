import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { ThemeToggle } from '@/components/theme-toggle';
import { Text } from '@/components/ui/text';

import { useDocument } from './api/hook';

const SCREEN_OPTIONS = {
  title: 'Document',
  headerRight: () => <ThemeToggle />,
};

export default function ViewDocumentScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  if(!id) return null

  const { data, isLoading } = useDocument(id);
  if (!data) return null

  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />

      <ScrollView className="flex-1 bg-background" contentContainerClassName="p-5">
        {isLoading ? (
          <Text className="text-center text-muted-foreground">Loading...</Text>
        ) : !data ? (
          <Text className="text-center text-destructive">Document not found.</Text>
        ) : (
          <View className="gap-5">
            <View className="gap-2 rounded-xl border border-border bg-card p-5">
              <Text className="text-2xl font-bold">{data.filename}</Text>

              <Text className="text-muted-foreground">{data.id}</Text>
            </View>

            <View className="gap-4 rounded-xl border border-border bg-card p-5">
              <View>
                <Text className="font-semibold">Status</Text>

                <Text>{data.status}</Text>
              </View>

              <View>
                <Text className="font-semibold">Created</Text>

                <Text>{new Date(data.created_at).toLocaleString()}</Text>
              </View>

              <View>
                <Text className="font-semibold">Updated</Text>

                <Text>{new Date(data.updated_at).toLocaleString()}</Text>
              </View>
            </View>

            <View className="gap-2 rounded-xl border border-border bg-card p-5">
              <Text className="text-lg font-semibold">Summary</Text>

              <Text className="leading-6">{data.summary ?? 'Summary not generated.'}</Text>
            </View>

            {/* <View className="gap-2 rounded-xl border border-border bg-card p-5">
              <Text className="text-lg font-semibold">Content</Text>

              <Text className="leading-6">{data.content ?? 'Document content unavailable.'}</Text>
            </View> */}
          </View>
        )}
      </ScrollView>
    </>
  );
}
