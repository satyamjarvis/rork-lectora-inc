import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import * as Updates from 'expo-updates';

interface Props {
  children: ReactNode;
  translations?: {
    title: string;
    message: string;
    retry: string;
    technicalDetails: string;
  };
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  isReloading: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isReloading: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (__DEV__) {
      console.error('🔴 Error capturado por Error Boundary:', error);
      console.error('🔴 Info del error:', errorInfo);
    }
    
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReload = async () => {
    this.setState({ isReloading: true });
    
    try {
      if (Platform.OS === 'web') {
        globalThis?.location?.reload();
        return;
      }

      // Try expo-updates first for production builds
      try {
        await Updates.reloadAsync();
      } catch (updateError) {
        if (__DEV__) {
          console.log('expo-updates reload failed, trying state reset:', updateError);
        }
        // Fallback: reset error boundary state
        this.setState({
          hasError: false,
          error: null,
          errorInfo: null,
          isReloading: false,
        });
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Error during reload:', error);
      }
      // Final fallback: just reset state
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        isReloading: false,
      });
    }
  };

  render() {
    if (this.state.hasError) {
      const t = this.props.translations || {
        title: 'Something went wrong',
        message: 'The app encountered an unexpected error. Please try again.',
        retry: 'Retry',
        technicalDetails: 'Technical details:',
      };

      return (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.title}>{t.title}</Text>
            <Text style={styles.message}>
              {t.message}
            </Text>
            
            <TouchableOpacity 
              style={[styles.button, this.state.isReloading && styles.buttonDisabled]} 
              onPress={this.handleReload}
              disabled={this.state.isReloading}
              activeOpacity={0.8}
              accessibilityLabel={t.retry}
              accessibilityRole="button"
            >
              {this.state.isReloading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>{t.retry}</Text>
              )}
            </TouchableOpacity>

            {__DEV__ && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorTitle}>{t.technicalDetails}</Text>
                <Text style={styles.errorText}>
                  {this.state.error?.toString()}
                </Text>
                {this.state.errorInfo && (
                  <Text style={styles.errorStack}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 24,
    minWidth: 120,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#4A9AFF',
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorDetails: {
    width: '100%',
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  errorText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  errorStack: {
    fontSize: 10,
    color: '#999',
    fontFamily: 'monospace',
  },
});
