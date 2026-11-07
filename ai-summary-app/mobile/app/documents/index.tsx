import * as React from 'react';
import { FlatList, View } from 'react-native';
import { Stack, router } from 'expo-router';

import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

import UploadTextFileDialog from './components/new';
import { useDeleteDocument, useDocuments } from './api/hook';
import LogoutButton from '../(auth)/components/logout';

const SCREEN_OPTIONS = {
  title: 'Documents',
  headerRight: () => (
    <View className="flex-row items-center gap-2">
      <LogoutButton />
      <ThemeToggle />
    </View>
  ),
};

export default function HomeScreen() {
  const { data = [], isLoading, refetch, isRefetching } = useDocuments();

  const { mutate: deleteDocument, isPending: isDeleting } = useDeleteDocument();

  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />

      <View className="flex-1 bg-background p-5">
        <View className="mb-6 gap-2">
          <Text className="text-3xl font-bold">Documents</Text>

          <Text className="text-muted-foreground">Upload and manage your documents.</Text>
        </View>

        <View className="mb-5">
          <UploadTextFileDialog />
        </View>

        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          refreshing={isRefetching}
          onRefresh={refetch}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            gap: 16,
            paddingBottom: 40,
          }}
          ListEmptyComponent={() =>
            isLoading ? (
              <Text className="text-center text-muted-foreground">Loading documents...</Text>
            ) : (
              <Text className="text-center text-muted-foreground">No documents found.</Text>
            )
          }
          renderItem={({ item }) => (
            <View className="gap-3 rounded-xl border border-border bg-card p-4">
              <View>
                <Text className="text-lg font-semibold">{item.filename}</Text>

                <Text className="text-xs text-muted-foreground">{item.id}</Text>
              </View>

              <Text>Status: {item.status}</Text>

              <Text numberOfLines={2} className="text-muted-foreground">
                {item.summary ?? 'Summary not generated'}
              </Text>

              <Text className="text-xs text-muted-foreground">
                {new Date(item.created_at).toLocaleString()}
              </Text>

              <View className="flex-row gap-2">
                <Button variant="secondary" onPress={() => router.push(`/documents/${item.id}`)}>
                  <Text>View</Text>
                </Button>

                <Button
                  variant="destructive"
                  disabled={isDeleting}
                  onPress={() => deleteDocument(item.id)}>
                  <Text>Delete</Text>
                </Button>
              </View>
            </View>
          )}
        />
      </View>
    </>
  );
}
