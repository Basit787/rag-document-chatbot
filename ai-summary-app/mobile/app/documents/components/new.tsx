import * as DocumentPicker from 'expo-document-picker';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { useUploadDocument } from '../api/hook';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const schema = z.object({
  file: z
    .object({
      uri: z.string(),
      name: z.string(),
      size: z.number(),
      mimeType: z.string().optional(),
    })
    .refine((file) => file.name.endsWith('.txt'), {
      message: 'Only .txt files are allowed.',
    })
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: 'Maximum file size is 5 MB.',
    }),
});

type FormValues = z.infer<typeof schema>;

export default function UploadTextFileDialog() {
  const [openDialog, setOpenDialog] = useState(false);

  const { mutate: uploadDocument, isPending } = useUploadDocument();

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema as any),
    mode: 'onChange',
  });

  const file = watch('file');

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'text/plain',
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled) return;

    const asset = result.assets[0];

    setValue(
      'file',
      {
        uri: asset.uri,
        name: asset.name,
        size: asset.size ?? 0,
        mimeType: asset.mimeType,
      },
      {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      }
    );
  };

  const onSubmit = (values: FormValues) => {
    uploadDocument(values.file as any, {
      onSuccess: () => {
        reset();
        setOpenDialog(false);
      },
    });
  };

  const handleReset = () => {
    reset();
  };

  return (
    <>
      <Button onPress={() => setOpenDialog(true)}>
        <Text>Add File</Text>
      </Button>

      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Upload Text File</AlertDialogTitle>

            <AlertDialogDescription>Upload a .txt document for processing.</AlertDialogDescription>
          </AlertDialogHeader>

          <View className="gap-4 py-4">
            <Button variant="outline" onPress={pickFile}>
              <Text>Select File</Text>
            </Button>

            <Text className="text-sm text-muted-foreground">Maximum file size: 5 MB</Text>

            {file && (
              <View className="gap-1">
                <Text className="font-medium">{file.name}</Text>
                <Text className="text-xs text-muted-foreground">
                  {((file.size ?? 0) / 1024).toFixed(2)} KB
                </Text>
              </View>
            )}

            {errors.file && <Text className="text-sm text-destructive">{errors.file.message}</Text>}

            <Button disabled={!isValid || isPending} onPress={handleSubmit(onSubmit)}>
              <Text>{isPending ? 'Uploading...' : 'Upload'}</Text>
            </Button>

            <Button variant="outline" onPress={handleReset}>
              <Text>Reset</Text>
            </Button>
          </View>

          <AlertDialogFooter>
            <AlertDialogCancel>
              <Text>Cancel</Text>
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
