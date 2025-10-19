import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
  FadeInDown,
  BounceIn,
  SlideInRight,
} from 'react-native-reanimated';
import { MotiView } from 'moti';
import { User, Phone, MessageSquare, ArrowRight, Check } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import { useMutation } from '@tanstack/react-query';
import KeyboardAvoidingAnimatedView from '@/components/KeyboardAvoidingAnimatedView';

const translations = {
  en: {
    title: 'Welcome Farmer!',
    subtitle: 'Let\'s get you started with CropCare AI',
    nameLabel: 'Full Name',
    namePlaceholder: 'Enter your full name',
    phoneLabel: 'Phone Number',
    phonePlaceholder: 'Enter your phone number',
    otpLabel: 'OTP Code',
    otpPlaceholder: 'Enter 6-digit OTP',
    sendOtp: 'Send OTP',
    verifyOtp: 'Verify OTP',
    resendOtp: 'Resend OTP',
    continue: 'Continue',
    otpSent: 'OTP sent to your phone!',
    invalidOtp: 'Invalid OTP. Please try again.',
    registering: 'Creating your account...',
  },
  ta: {
    title: 'வரவேற்கிறோம் விவசாயி!',
    subtitle: 'CropCare AI உடன் தொடங்குவோம்',
    nameLabel: 'முழு பெயர்',
    namePlaceholder: 'உங்கள் முழு பெயரை உள்ளிடவும்',
    phoneLabel: 'தொலைபேசி எண்',
    phonePlaceholder: 'உங்கள் தொலைபேசி எண்ணை உள்ளிடவும்',
    otpLabel: 'OTP குறியீடு',
    otpPlaceholder: '6 இலக்க OTP ஐ உள்ளிடவும்',
    sendOtp: 'OTP அனுப்பு',
    verifyOtp: 'OTP சரிபார்க்கவும்',
    resendOtp: 'OTP மீண்டும் அனுப்பு',
    continue: 'தொடரவும்',
    otpSent: 'உங்கள் தொலைபேசிக்கு OTP அனுப்பப்பட்டது!',
    invalidOtp: 'தவறான OTP. மீண்டும் முயற்சிக்கவும்.',
    registering: 'உங்கள் கணக்கை உருவாக்குகிறது...',
  },
  te: {
    title: 'స్వాగతం రైతు!',
    subtitle: 'CropCare AI తో మొదలుపెట్టండి',
    nameLabel: 'పూర్తి పేరు',
    namePlaceholder: 'మీ పూర్తి పేరు నమోదు చేయండి',
    phoneLabel: 'ఫోన్ నంబర్',
    phonePlaceholder: 'మీ ఫోన్ నంబర్ నమోదు చేయండి',
    otpLabel: 'OTP కోడ్',
    otpPlaceholder: '6 అంకెల OTP నమోదు చేయండి',
    sendOtp: 'OTP పంపండి',
    verifyOtp: 'OTP ధృవీకరించండి',
    resendOtp: 'OTP మళ్లీ పంపండి',
    continue: 'కొనసాగించండి',
    otpSent: 'మీ ఫోన్‌కు OTP పంపబడింది!',
    invalidOtp: 'చెల్లని OTP. దయచేసి మళ్లీ ప్రయత్నించండి.',
    registering: 'మీ ఖాతాను సృష్టిస్తోంది...',
  },
  kn: {
    title: 'ಸ್ವಾಗತ ರೈತ!',
    subtitle: 'CropCare AI ಯೊಂದಿಗೆ ಪ್ರಾರಂಭಿಸೋಣ',
    nameLabel: 'ಪೂರ್ಣ ಹೆಸರು',
    namePlaceholder: 'ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ',
    phoneLabel: 'ಫೋನ್ ಸಂಖ್ಯೆ',
    phonePlaceholder: 'ನಿಮ್ಮ ಫೋನ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ',
    otpLabel: 'OTP ಕೋಡ್',
    otpPlaceholder: '6 ಅಂಕಿಯ OTP ನಮೂದಿಸಿ',
    sendOtp: 'OTP ಕಳುಹಿಸಿ',
    verifyOtp: 'OTP ಪರಿಶೀಲಿಸಿ',
    resendOtp: 'OTP ಮರುಕಳುಹಿಸಿ',
    continue: 'ಮುಂದುವರಿಸಿ',
    otpSent: 'ನಿಮ್ಮ ಫೋನ್‌ಗೆ OTP ಕಳುಹಿಸಲಾಗಿದೆ!',
    invalidOtp: 'ಅಮಾನ್ಯ OTP. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    registering: 'ನಿಮ್ಮ ಖಾತೆಯನ್ನು ರಚಿಸಲಾಗುತ್ತಿದೆ...',
  },
  ml: {
    title: 'സ്വാഗതം കർഷകാ!',
    subtitle: 'CropCare AI യുമായി ആരംഭിക്കാം',
    nameLabel: 'പൂർണ്ണ നാമം',
    namePlaceholder: 'നിങ്ങളുടെ പൂർണ്ണ നാമം നൽകുക',
    phoneLabel: 'ഫോൺ നമ്പർ',
    phonePlaceholder: 'നിങ്ങളുടെ ഫോൺ നമ്പർ നൽകുക',
    otpLabel: 'OTP കോഡ്',
    otpPlaceholder: '6 അക്ക OTP നൽകുക',
    sendOtp: 'OTP അയയ്ക്കുക',
    verifyOtp: 'OTP പരിശോധിക്കുക',
    resendOtp: 'OTP വീണ്ടും അയയ്ക്കുക',
    continue: 'തുടരുക',
    otpSent: 'നിങ്ങളുടെ ഫോണിലേക്ക് OTP അയച്ചു!',
    invalidOtp: 'അസാധുവായ OTP. ദയവായി വീണ്ടും ശ്രമിക്കുക.',
    registering: 'നിങ്ങളുടെ അക്കൗണ്ട് സൃഷ്ടിക്കുന്നു...',
  },
};

export default function UserRegistration() {
  const insets = useSafeAreaInsets();
  const [language, setLanguage] = useState('en');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('details'); // 'details', 'otp', 'verified'
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const t = translations[language] || translations.en;

  useEffect(() => {
    loadLanguage();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await SecureStore.getItemAsync('selectedLanguage');
      if (savedLanguage) {
        setLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const createUserMutation = useMutation({
    mutationFn: async (userData) => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        throw new Error('Failed to create user');
      }
      return response.json();
    },
    onSuccess: async (data) => {
      // Store user data
      await SecureStore.setItemAsync('userData', JSON.stringify(data.user));
      router.replace('/crop-selection');
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to create account. Please try again.');
    },
  });

  const handleSendOtp = () => {
    if (!name.trim() || !phoneNumber.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Simulate OTP sending
    setOtpSent(true);
    setStep('otp');
    setCountdown(60);
    Alert.alert('Success', t.otpSent);
  };

  const handleVerifyOtp = () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter a 6-digit OTP');
      return;
    }

    // Simulate OTP verification (in real app, verify with backend)
    if (otp === '123456' || otp.length === 6) {
      setStep('verified');
      // Create user account
      createUserMutation.mutate({
        name: name.trim(),
        phone_number: phoneNumber.trim(),
        language: language,
      });
    } else {
      Alert.alert('Error', t.invalidOtp);
    }
  };

  const handleResendOtp = () => {
    setCountdown(60);
    Alert.alert('Success', t.otpSent);
  };

  return (
    <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
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
              backgroundColor: '#3b82f6',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 24,
              shadowColor: '#3b82f6',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 8,
            }}>
              <User size={40} color="#FFF" />
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

        {/* Form */}
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ 
            paddingHorizontal: 24,
            paddingBottom: insets.bottom + 24,
          }}
          showsVerticalScrollIndicator={false}
        >
          {step === 'details' && (
            <>
              {/* Name Input */}
              <Animated.View entering={BounceIn.delay(300)}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: 8,
                }}>
                  {t.nameLabel}
                </Text>
                <View style={{
                  backgroundColor: '#fff',
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: name ? '#22c55e' : '#e5e7eb',
                  marginBottom: 20,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder={t.namePlaceholder}
                    style={{
                      padding: 16,
                      fontSize: 16,
                      color: '#1f2937',
                    }}
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </Animated.View>

              {/* Phone Input */}
              <Animated.View entering={BounceIn.delay(400)}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: 8,
                }}>
                  {t.phoneLabel}
                </Text>
                <View style={{
                  backgroundColor: '#fff',
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: phoneNumber ? '#22c55e' : '#e5e7eb',
                  marginBottom: 32,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}>
                  <TextInput
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    placeholder={t.phonePlaceholder}
                    keyboardType="phone-pad"
                    style={{
                      padding: 16,
                      fontSize: 16,
                      color: '#1f2937',
                    }}
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </Animated.View>

              {/* Send OTP Button */}
              <Animated.View entering={SlideInRight.delay(500)}>
                <TouchableOpacity
                  onPress={handleSendOtp}
                  style={{
                    backgroundColor: '#22c55e',
                    borderRadius: 12,
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#22c55e',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  <Phone size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={{
                    color: '#fff',
                    fontSize: 16,
                    fontWeight: '600',
                  }}>
                    {t.sendOtp}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </>
          )}

          {step === 'otp' && (
            <>
              {/* OTP Input */}
              <Animated.View entering={BounceIn.delay(300)}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: 8,
                }}>
                  {t.otpLabel}
                </Text>
                <View style={{
                  backgroundColor: '#fff',
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: otp ? '#22c55e' : '#e5e7eb',
                  marginBottom: 20,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}>
                  <TextInput
                    value={otp}
                    onChangeText={setOtp}
                    placeholder={t.otpPlaceholder}
                    keyboardType="number-pad"
                    maxLength={6}
                    style={{
                      padding: 16,
                      fontSize: 18,
                      color: '#1f2937',
                      textAlign: 'center',
                      letterSpacing: 4,
                    }}
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </Animated.View>

              {/* Verify Button */}
              <Animated.View entering={SlideInRight.delay(400)}>
                <TouchableOpacity
                  onPress={handleVerifyOtp}
                  disabled={createUserMutation.isLoading}
                  style={{
                    backgroundColor: '#22c55e',
                    borderRadius: 12,
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                    opacity: createUserMutation.isLoading ? 0.7 : 1,
                    shadowColor: '#22c55e',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  {createUserMutation.isLoading ? (
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
                    <Check size={20} color="#fff" style={{ marginRight: 8 }} />
                  )}
                  <Text style={{
                    color: '#fff',
                    fontSize: 16,
                    fontWeight: '600',
                  }}>
                    {createUserMutation.isLoading ? t.registering : t.verifyOtp}
                  </Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Resend OTP */}
              <TouchableOpacity
                onPress={handleResendOtp}
                disabled={countdown > 0}
                style={{
                  alignItems: 'center',
                  padding: 12,
                }}
              >
                <Text style={{
                  color: countdown > 0 ? '#9ca3af' : '#3b82f6',
                  fontSize: 14,
                  fontWeight: '500',
                }}>
                  {countdown > 0 ? `${t.resendOtp} (${countdown}s)` : t.resendOtp}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}