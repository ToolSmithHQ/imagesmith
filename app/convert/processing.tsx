import { useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useConversion } from '@/src/hooks/use-conversion';
import { ProgressBar } from '@/src/components/ui/progress-bar';
import { Button } from '@/src/components/ui/button';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function ProcessingScreen() {
  const router = useRouter();
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const errorColor = useThemeColor({}, 'error');
  const backgroundColor = useThemeColor({}, 'background');

  const { sourceImage, processingState, startConversion, retry, reset } =
    useConversion();

  useEffect(() => {
    startConversion();
  }, []);

  useEffect(() => {
    if (processingState.status === 'complete') {
      router.replace('/convert/result');
    }
  }, [processingState.status]);

  const isError = processingState.status === 'error';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor }]}>
      <View style={styles.container}>
        {sourceImage && (
          <Image
            source={{ uri: sourceImage.uri }}
            style={[styles.image, isError && styles.imageError]}
            contentFit="contain"
          />
        )}

        {!isError ? (
          <View style={styles.progressSection}>
            <ProgressBar progress={processingState.progress} />
            <Text style={[styles.status, { color: iconColor }]}>
              {processingState.progress < 0.5
                ? 'Converting...'
                : processingState.progress < 0.9
                  ? 'Almost done...'
                  : 'Finishing up...'}
            </Text>
          </View>
        ) : (
          <View style={styles.errorSection}>
            <Text style={[styles.errorTitle, { color: errorColor }]}>
              Conversion Failed
            </Text>
            <Text style={[styles.errorMessage, { color: iconColor }]}>
              {processingState.error?.userMessage ??
                'Something went wrong. Please try again.'}
            </Text>
            <View style={styles.errorActions}>
              {processingState.error?.recoverable && (
                <Button variant="primary" title="Try Again" onPress={retry} />
              )}
              <Button
                variant="ghost"
                title="Go Back"
                onPress={() => {
                  reset();
                  router.back();
                }}
              />
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
  },
  image: {
    width: '70%',
    aspectRatio: 1,
    borderRadius: 16,
    opacity: 0.6,
  },
  imageError: {
    opacity: 0.3,
  },
  progressSection: {
    width: '100%',
    gap: 12,
  },
  status: {
    textAlign: 'center',
    fontSize: 15,
  },
  errorSection: {
    alignItems: 'center',
    gap: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorActions: {
    gap: 10,
    marginTop: 8,
    width: '100%',
  },
});
