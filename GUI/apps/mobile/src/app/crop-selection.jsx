import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
  FadeInDown,
  BounceIn,
  SlideInRight,
} from 'react-native-reanimated';
import { MotiView } from 'moti';
import { Wheat, Check, ArrowRight, Plus } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import { useQuery, useMutation } from '@tanstack/react-query';

const translations = {
  en: {
    title: 'Select Your Crops',
    subtitle: 'Tell us what you cultivate for better disease detection',
    selectCrops: 'Select the crops you grow',
    continue: 'Continue to Dashboard',
    addingCrops: 'Adding your crops...',
    noCropsSelected: 'Please select at least one crop',
  },
  ta: {
    title: 'உங்கள் பயிர்களைத் தேர்ந்தெடுக்கவும்',
    subtitle: 'சிறந்த நோய் கண்டறிதலுக்காக நீங்கள் என்ன பயிரிடுகிறீர்கள் என்று சொல்லுங்கள்',
    selectCrops: 'நீங்கள் வளர்க்கும் பயிர்களைத் தேர்ந்தெடுக்கவும்',
    continue: 'டாஷ்போர்டுக்குத் தொடரவும்',
    addingCrops: 'உங்கள் பயிர்களைச் சேர்க்கிறது...',
    noCropsSelected: 'தயவுசெய்து குறைந்தது ஒரு பயிரையாவது தேர்ந்தெடுக்கவும்',
  },
  te: {
    title: 'మీ పంటలను ఎంచుకోండి',
    subtitle: 'మెరుగైన వ్యాధి గుర్తింపు కోసం మీరు ఏమి పండిస్తున్నారో చెప్పండి',
    selectCrops: 'మీరు పండించే పంటలను ఎంచుకోండి',
    continue: 'డాష్‌బోర్డ్‌కు కొనసాగండి',
    addingCrops: 'మీ పంటలను జోడిస్తోంది...',
    noCropsSelected: 'దయచేసి కనీసం ఒక పంటను ఎంచుకోండి',
  },
  kn: {
    title: 'ನಿಮ್ಮ ಬೆಳೆಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    subtitle: 'ಉತ್ತಮ ರೋಗ ಪತ್ತೆಗಾಗಿ ನೀವು ಏನು ಬೆಳೆಸುತ್ತೀರಿ ಎಂದು ಹೇಳಿ',
    selectCrops: 'ನೀವು ಬೆಳೆಸುವ ಬೆಳೆಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    continue: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಮುಂದುವರಿಸಿ',
    addingCrops: 'ನಿಮ್ಮ ಬೆಳೆಗಳನ್ನು ಸೇರಿಸಲಾಗುತ್ತಿದೆ...',
    noCropsSelected: 'ದಯವಿಟ್ಟು ಕನಿಷ್ಠ ಒಂದು ಬೆಳೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
  },
  ml: {
    title: 'നിങ്ങളുടെ വിളകൾ തിരഞ്ഞെടുക്കുക',
    subtitle: 'മികച്ച രോഗനിർണയത്തിനായി നിങ്ങൾ എന്താണ് കൃഷി ചെയ്യുന്നതെന്ന് പറയുക',
    selectCrops: 'നിങ്ങൾ വളർത്തുന്ന വിളകൾ തിരഞ്ഞെടുക്കുക',
    continue: 'ഡാഷ്ബോർഡിലേക്ക് തുടരുക',
    addingCrops: 'നിങ്ങളുടെ വിളകൾ ചേർക്കുന്നു...',
    noCropsSelected: 'ദയവായി കുറഞ്ഞത് ഒരു വിള തിരഞ്ഞെടുക്കുക',
  },
};

export default function CropSelection() {
  const insets = useSafeAreaInsets();
  const [language, setLanguage] = useState('en');
  const [userData, setUserData] = useState(null);
  const [selectedCrops, setSelectedCrops] = useState([]);

  const t = translations[language] || translations.en;

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const savedLanguage = await SecureStore.getItemAsync('selectedLanguage');
      const savedUserData = await SecureStore.getItemAsync('userData');
      
      if (savedLanguage) setLanguage(savedLanguage);
      if (savedUserData) setUserData(JSON.parse(savedUserData));
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Fetch available crops
  const { data: cropsData, isLoading: cropsLoading } = useQuery({
    queryKey: ['crops', language],
    queryFn: async () => {
      const response = await fetch(`/api/crops?language=${language}`);
      if (!response.ok) {
        throw new Error('Failed to fetch crops');
      }
      return response.json();
    },
  });

  // Add user crops mutation
  const addCropsMutation = useMutation({
    mutationFn: async (cropIds) => {
      const promises = cropIds.map(cropId =>
        fetch('/api/user-crops', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userData.id,
            crop_id: cropId,
          }),
        })
      );
      
      const responses = await Promise.all(promises);
      return responses;
    },
    onSuccess: () => {
      router.replace('/main-dashboard');
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to add crops. Please try again.');
    },
  });

  const handleCropToggle = (cropId) => {
    setSelectedCrops(prev => 
      prev.includes(cropId) 
        ? prev.filter(id => id !== cropId)
        : [...prev, cropId]
    );
  };

  const handleContinue = () => {
    if (selectedCrops.length === 0) {
      Alert.alert('Error', t.noCropsSelected);
      return;
    }

    addCropsMutation.mutate(selectedCrops);
  };

  const crops = cropsData?.crops || [];

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
            backgroundColor: '#f59e0b',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 24,
            shadowColor: '#f59e0b',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 8,
          }}>
            <Wheat size={40} color="#FFF" />
          </View>
        </MotiView>

        <Text style={{
          fontSize: 28,
          fontWeight: 'bold',
          color: '#1f2937',
          textAlign: 'center',
          marginBottom: 8,
        }}>
          {t.title}
        </Text>
        
        <Text style={{
          fontSize: 16,
          color: '#6b7280',
          textAlign: 'center',
          lineHeight: 22,
        }}>
          {t.subtitle}
        </Text>
      </Animated.View>

      {/* Crops Grid */}
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ 
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{
          fontSize: 18,
          fontWeight: '600',
          color: '#374151',
          marginBottom: 20,
        }}>
          {t.selectCrops}
        </Text>

        {cropsLoading ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
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
                borderTopColor: '#f59e0b',
              }} />
            </MotiView>
            <Text style={{
              color: '#6b7280',
              fontSize: 16,
              marginTop: 16,
            }}>
              Loading crops...
            </Text>
          </View>
        ) : (
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}>
            {crops.map((crop, index) => (
              <Animated.View
                key={crop.id}
                entering={BounceIn.delay(300 + index * 100)}
                style={{ width: '48%', marginBottom: 16 }}
              >
                <TouchableOpacity
                  onPress={() => handleCropToggle(crop.id)}
                  style={{
                    backgroundColor: selectedCrops.includes(crop.id) ? '#22c55e' : '#fff',
                    borderRadius: 16,
                    padding: 20,
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 3,
                    borderWidth: 2,
                    borderColor: selectedCrops.includes(crop.id) ? '#22c55e' : 'transparent',
                    minHeight: 120,
                    justifyContent: 'center',
                  }}
                >
                  <MotiView
                    animate={{
                      scale: selectedCrops.includes(crop.id) ? 1.1 : 1,
                    }}
                    transition={{
                      type: 'spring',
                      damping: 15,
                      stiffness: 150,
                    }}
                  >
                    <View style={{
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      backgroundColor: selectedCrops.includes(crop.id) 
                        ? 'rgba(255,255,255,0.2)' 
                        : '#f59e0b',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginBottom: 12,
                    }}>
                      {selectedCrops.includes(crop.id) ? (
                        <Check size={24} color="#fff" />
                      ) : (
                        <Wheat size={24} color="#fff" />
                      )}
                    </View>
                  </MotiView>

                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: selectedCrops.includes(crop.id) ? '#fff' : '#1f2937',
                    textAlign: 'center',
                    lineHeight: 20,
                  }}>
                    {crop.display_name}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Continue Button */}
      <View style={{
        position: 'absolute',
        bottom: insets.bottom + 20,
        left: 24,
        right: 24,
      }}>
        <Animated.View entering={SlideInRight.delay(500)}>
          <TouchableOpacity
            onPress={handleContinue}
            disabled={selectedCrops.length === 0 || addCropsMutation.isLoading}
            style={{
              backgroundColor: selectedCrops.length > 0 ? '#22c55e' : '#9ca3af',
              borderRadius: 16,
              padding: 18,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: selectedCrops.length > 0 ? '#22c55e' : '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            {addCropsMutation.isLoading ? (
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
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: 'rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  marginRight: 8,
                }} />
              </MotiView>
            ) : (
              <ArrowRight size={20} color="#fff" style={{ marginRight: 8 }} />
            )}
            <Text style={{
              color: '#fff',
              fontSize: 16,
              fontWeight: '600',
            }}>
              {addCropsMutation.isLoading ? t.addingCrops : t.continue}
            </Text>
            {selectedCrops.length > 0 && !addCropsMutation.isLoading && (
              <View style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 12,
                paddingHorizontal: 8,
                paddingVertical: 4,
                marginLeft: 8,
              }}>
                <Text style={{
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: '600',
                }}>
                  {selectedCrops.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}