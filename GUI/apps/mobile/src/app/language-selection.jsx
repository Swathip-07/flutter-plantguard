import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  FadeInDown,
  BounceIn,
} from 'react-native-reanimated';
import { MotiView } from 'moti';
import { Globe, ChevronRight, Check } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
];

export default function LanguageSelection() {
  const insets = useSafeAreaInsets();
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);

  const handleLanguageSelect = async (languageCode) => {
    setSelectedLanguage(languageCode);
    setIsLoading(true);
    
    try {
      // Store selected language
      await SecureStore.setItemAsync('selectedLanguage', languageCode);
      
      // Navigate to user registration after a short delay
      setTimeout(() => {
        router.replace('/user-registration');
      }, 500);
    } catch (error) {
      console.error('Error saving language:', error);
      setIsLoading(false);
    }
  };

  return (
    <View style={{
      flex: 1,
      backgroundColor: '#f8fafc',
      paddingTop: insets.top,
    }}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <Animated.View 
        entering={FadeInDown.delay(100)}
        style={{
          paddingHorizontal: 24,
          paddingVertical: 32,
          alignItems: 'center',
        }}
      >
        <MotiView
          from={{ scale: 0, rotate: '0deg' }}
          animate={{ scale: 1, rotate: '360deg' }}
          transition={{
            type: 'spring',
            damping: 15,
            stiffness: 150,
            delay: 200,
          }}
        >
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: '#22c55e',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 24,
            shadowColor: '#22c55e',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 8,
          }}>
            <Globe size={40} color="#FFF" />
          </View>
        </MotiView>

        <Text style={{
          fontSize: 28,
          fontWeight: 'bold',
          color: '#1f2937',
          textAlign: 'center',
          marginBottom: 8,
        }}>
          Choose Your Language
        </Text>
        
        <Text style={{
          fontSize: 16,
          color: '#6b7280',
          textAlign: 'center',
          lineHeight: 22,
        }}>
          Select your preferred language for the best experience
        </Text>
      </Animated.View>

      {/* Language Options */}
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ 
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {languages.map((language, index) => (
          <Animated.View
            key={language.code}
            entering={BounceIn.delay(300 + index * 100)}
          >
            <TouchableOpacity
              onPress={() => handleLanguageSelect(language.code)}
              disabled={isLoading}
              style={{
                backgroundColor: selectedLanguage === language.code ? '#22c55e' : '#fff',
                borderRadius: 16,
                padding: 20,
                marginBottom: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
                borderWidth: 2,
                borderColor: selectedLanguage === language.code ? '#22c55e' : 'transparent',
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 20,
                  fontWeight: '600',
                  color: selectedLanguage === language.code ? '#fff' : '#1f2937',
                  marginBottom: 4,
                }}>
                  {language.nativeName}
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: selectedLanguage === language.code ? 'rgba(255,255,255,0.8)' : '#6b7280',
                }}>
                  {language.name}
                </Text>
              </View>

              <MotiView
                animate={{
                  scale: selectedLanguage === language.code ? 1 : 0,
                  opacity: selectedLanguage === language.code ? 1 : 0,
                }}
                transition={{
                  type: 'spring',
                  damping: 15,
                  stiffness: 150,
                }}
              >
                {selectedLanguage === language.code ? (
                  <Check size={24} color="#fff" />
                ) : (
                  <ChevronRight size={24} color="#9ca3af" />
                )}
              </MotiView>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <MotiView
            from={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: 'spring',
              damping: 15,
            }}
          >
            <View style={{
              backgroundColor: '#fff',
              borderRadius: 16,
              padding: 32,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 8,
            }}>
              <MotiView
                from={{ rotate: '0deg' }}
                animate={{ rotate: '360deg' }}
                transition={{
                  type: 'timing',
                  duration: 1000,
                  loop: true,
                  repeatReverse: false,
                }}
              >
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  borderWidth: 3,
                  borderColor: '#e5e7eb',
                  borderTopColor: '#22c55e',
                  marginBottom: 16,
                }} />
              </MotiView>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#1f2937',
              }}>
                Setting up your language...
              </Text>
            </View>
          </MotiView>
        </View>
      )}
    </View>
  );
}