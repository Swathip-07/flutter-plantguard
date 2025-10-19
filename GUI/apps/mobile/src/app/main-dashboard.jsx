import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
  FadeInDown,
  BounceIn,
  SlideInRight,
  SlideInLeft,
} from 'react-native-reanimated';
import { MotiView } from 'moti';
import { 
  Camera, 
  TrendingUp, 
  MessageCircle, 
  Leaf, 
  User, 
  Settings,
  Heart,
  Sparkles,
  ChevronRight,
  Plus
} from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import { useQuery } from '@tanstack/react-query';

const translations = {
  en: {
    welcome: 'Welcome back',
    subtitle: 'How can I help you today?',
    detectDisease: 'Detect Disease',
    detectSubtitle: 'Take a photo to analyze crop health',
    marketPrices: 'Market Prices',
    marketSubtitle: 'Check current and predicted prices',
    chatBot: 'Ask CropCare AI',
    chatSubtitle: 'Get farming advice and tips',
    myCrops: 'My Crops',
    recentActivity: 'Recent Activity',
    noActivity: 'No recent activity',
    quickActions: 'Quick Actions',
    viewProfile: 'View Profile',
    settings: 'Settings',
  },
  ta: {
    welcome: 'மீண்டும் வரவேற்கிறோம்',
    subtitle: 'இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?',
    detectDisease: 'நோய் கண்டறிதல்',
    detectSubtitle: 'பயிர் ஆரோக்கியத்தை பகுப்பாய்வு செய்ய புகைப்படம் எடுக்கவும்',
    marketPrices: 'சந்தை விலைகள்',
    marketSubtitle: 'தற்போதைய மற்றும் எதிர்பார்க்கப்படும் விலைகளைச் சரிபார்க்கவும்',
    chatBot: 'CropCare AI யிடம் கேளுங்கள்',
    chatSubtitle: 'விவசாய ஆலோசனை மற்றும் குறிப்புகளைப் பெறுங்கள்',
    myCrops: 'என் பயிர்கள்',
    recentActivity: 'சமீபத்திய செயல்பாடு',
    noActivity: 'சமீபத்திய செயல்பாடு இல்லை',
    quickActions: 'விரைவு செயல்கள்',
    viewProfile: 'சுயவிவரத்தைப் பார்க்கவும்',
    settings: 'அமைப்புகள்',
  },
  te: {
    welcome: 'తిరిగి స్వాగతం',
    subtitle: 'ఈరోజు నేను మీకు ఎలా సహాయం చేయగలను?',
    detectDisease: 'వ్యాధి గుర్తింపు',
    detectSubtitle: 'పంట ఆరోగ్యాన్ని విశ్లేషించడానికి ఫోటో తీయండి',
    marketPrices: 'మార్కెట్ ధరలు',
    marketSubtitle: 'ప్రస్తుత మరియు అంచనా ధరలను తనిఖీ చేయండి',
    chatBot: 'CropCare AI ని అడగండి',
    chatSubtitle: 'వ్యవసాయ సలహా మరియు చిట్కాలు పొందండి',
    myCrops: 'నా పంటలు',
    recentActivity: 'ఇటీవలి కార్యకలాపాలు',
    noActivity: 'ఇటీవలి కార్యకలాపాలు లేవు',
    quickActions: 'త్వరిత చర్యలు',
    viewProfile: 'ప్రొఫైల్ చూడండి',
    settings: 'సెట్టింగులు',
  },
  kn: {
    welcome: 'ಮತ್ತೆ ಸ್ವಾಗತ',
    subtitle: 'ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?',
    detectDisease: 'ರೋಗ ಪತ್ತೆ',
    detectSubtitle: 'ಬೆಳೆ ಆರೋಗ್ಯವನ್ನು ವಿಶ್ಲೇಷಿಸಲು ಫೋಟೋ ತೆಗೆಯಿರಿ',
    marketPrices: 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು',
    marketSubtitle: 'ಪ್ರಸ್ತುತ ಮತ್ತು ಅಂದಾಜು ಬೆಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ',
    chatBot: 'CropCare AI ಯನ್ನು ಕೇಳಿ',
    chatSubtitle: 'ಕೃಷಿ ಸಲಹೆ ಮತ್ತು ಸಲಹೆಗಳನ್ನು ಪಡೆಯಿರಿ',
    myCrops: 'ನನ್ನ ಬೆಳೆಗಳು',
    recentActivity: 'ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆ',
    noActivity: 'ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆ ಇಲ್ಲ',
    quickActions: 'ತ್ವರಿತ ಕ್ರಿಯೆಗಳು',
    viewProfile: 'ಪ್ರೊಫೈಲ್ ವೀಕ್ಷಿಸಿ',
    settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
  },
  ml: {
    welcome: 'വീണ്ടും സ്വാഗതം',
    subtitle: 'ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കാം?',
    detectDisease: 'രോഗ കണ്ടെത്തൽ',
    detectSubtitle: 'വിള ആരോഗ്യം വിശകലനം ചെയ്യാൻ ഫോട്ടോ എടുക്കുക',
    marketPrices: 'മാർക്കറ്റ് വിലകൾ',
    marketSubtitle: 'നിലവിലുള്ളതും പ്രവചിക്കപ്പെട്ടതുമായ വിലകൾ പരിശോധിക്കുക',
    chatBot: 'CropCare AI യോട് ചോദിക്കുക',
    chatSubtitle: 'കൃഷി ഉപദേശവും നുറുങ്ങുകളും നേടുക',
    myCrops: 'എന്റെ വിളകൾ',
    recentActivity: 'സമീപകാല പ്രവർത്തനം',
    noActivity: 'സമീപകാല പ്രവർത്തനം ഇല്ല',
    quickActions: 'ദ്രുത പ്രവർത്തനങ്ങൾ',
    viewProfile: 'പ്രൊഫൈൽ കാണുക',
    settings: 'ക്രമീകരണങ്ങൾ',
  },
};

export default function MainDashboard() {
  const insets = useSafeAreaInsets();
  const [language, setLanguage] = useState('en');
  const [userData, setUserData] = useState(null);

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

  // Fetch user crops
  const { data: userCropsData } = useQuery({
    queryKey: ['userCrops', userData?.id, language],
    queryFn: async () => {
      if (!userData?.id) return { userCrops: [] };
      const response = await fetch(`/api/user-crops?user_id=${userData.id}&language=${language}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user crops');
      }
      return response.json();
    },
    enabled: !!userData?.id,
  });

  const userCrops = userCropsData?.userCrops || [];

  const handleDiseaseDetection = () => {
    router.push('/disease-detection');
  };

  const handleMarketPrices = () => {
    router.push('/market-prices');
  };

  const handleChatBot = () => {
    // For now, we'll show an alert. In a real app, this would open a chat interface
    Alert.alert('CropCare AI', 'Chat feature coming soon! This will be your AI farming assistant.');
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
          paddingVertical: 20,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: 4,
          }}>
            {t.welcome}
          </Text>
          <Text style={{
            fontSize: 16,
            color: '#6b7280',
          }}>
            {userData?.name || 'Farmer'}
          </Text>
        </View>

        <TouchableOpacity
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: '#22c55e',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#22c55e',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <User size={24} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      {/* Floating sparkles */}
      <View style={{ position: 'absolute', top: insets.top + 80, right: 60, zIndex: 1 }}>
        <MotiView
          from={{ scale: 0, rotate: '0deg' }}
          animate={{ scale: 1, rotate: '360deg' }}
          transition={{
            type: 'timing',
            duration: 3000,
            loop: true,
            repeatReverse: false,
          }}
        >
          <Sparkles size={16} color="#f59e0b" />
        </MotiView>
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ 
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Subtitle */}
        <Animated.View entering={FadeInDown.delay(200)}>
          <Text style={{
            fontSize: 18,
            color: '#374151',
            marginBottom: 32,
            textAlign: 'center',
          }}>
            {t.subtitle}
          </Text>
        </Animated.View>

        {/* Main Action Cards */}
        <View style={{ marginBottom: 32 }}>
          {/* Disease Detection Card */}
          <Animated.View entering={BounceIn.delay(300)}>
            <TouchableOpacity
              onPress={handleDiseaseDetection}
              style={{
                backgroundColor: '#22c55e',
                borderRadius: 20,
                padding: 24,
                marginBottom: 16,
                shadowColor: '#22c55e',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <View style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 16,
                  }}>
                    <Camera size={30} color="#fff" />
                  </View>
                  <Text style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: '#fff',
                    marginBottom: 8,
                  }}>
                    {t.detectDisease}
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    color: 'rgba(255,255,255,0.8)',
                    lineHeight: 20,
                  }}>
                    {t.detectSubtitle}
                  </Text>
                </View>
                <ChevronRight size={24} color="rgba(255,255,255,0.8)" />
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Market Prices and Chat Bot Row */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {/* Market Prices */}
            <Animated.View entering={SlideInLeft.delay(400)} style={{ flex: 1 }}>
              <TouchableOpacity
                onPress={handleMarketPrices}
                style={{
                  backgroundColor: '#3b82f6',
                  borderRadius: 16,
                  padding: 20,
                  shadowColor: '#3b82f6',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <View style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 12,
                }}>
                  <TrendingUp size={24} color="#fff" />
                </View>
                <Text style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: '#fff',
                  marginBottom: 4,
                }}>
                  {t.marketPrices}
                </Text>
                <Text style={{
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.8)',
                  lineHeight: 16,
                }}>
                  {t.marketSubtitle}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Chat Bot */}
            <Animated.View entering={SlideInRight.delay(400)} style={{ flex: 1 }}>
              <TouchableOpacity
                onPress={handleChatBot}
                style={{
                  backgroundColor: '#f59e0b',
                  borderRadius: 16,
                  padding: 20,
                  shadowColor: '#f59e0b',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <View style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 12,
                }}>
                  <MessageCircle size={24} color="#fff" />
                </View>
                <Text style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: '#fff',
                  marginBottom: 4,
                }}>
                  {t.chatBot}
                </Text>
                <Text style={{
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.8)',
                  lineHeight: 16,
                }}>
                  {t.chatSubtitle}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>

        {/* My Crops Section */}
        <Animated.View entering={FadeInDown.delay(500)}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: '#1f2937',
            }}>
              {t.myCrops}
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/crop-selection')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#e5e7eb',
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}
            >
              <Plus size={16} color="#6b7280" />
              <Text style={{
                fontSize: 12,
                color: '#6b7280',
                marginLeft: 4,
                fontWeight: '500',
              }}>
                Add
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 24 }}
            style={{ marginBottom: 32 }}
          >
            {userCrops.map((crop, index) => (
              <Animated.View
                key={crop.id}
                entering={BounceIn.delay(600 + index * 100)}
                style={{ marginRight: 12 }}
              >
                <View style={{
                  backgroundColor: '#fff',
                  borderRadius: 12,
                  padding: 16,
                  width: 120,
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 3,
                }}>
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#22c55e',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}>
                    <Leaf size={20} color="#fff" />
                  </View>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: '#1f2937',
                    textAlign: 'center',
                  }}>
                    {crop.crop_display_name}
                  </Text>
                </View>
              </Animated.View>
            ))}
            
            {userCrops.length === 0 && (
              <View style={{
                backgroundColor: '#f3f4f6',
                borderRadius: 12,
                padding: 16,
                width: 120,
                alignItems: 'center',
                borderWidth: 2,
                borderColor: '#e5e7eb',
                borderStyle: 'dashed',
              }}>
                <Plus size={24} color="#9ca3af" />
                <Text style={{
                  fontSize: 12,
                  color: '#9ca3af',
                  textAlign: 'center',
                  marginTop: 8,
                }}>
                  Add crops
                </Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>

        {/* Recent Activity */}
        <Animated.View entering={FadeInDown.delay(700)}>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: 16,
          }}>
            {t.recentActivity}
          </Text>

          <View style={{
            backgroundColor: '#fff',
            borderRadius: 16,
            padding: 20,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}>
            <MotiView
              from={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: 'timing',
                duration: 1000,
                loop: true,
                repeatReverse: true,
              }}
            >
              <Heart size={40} color="#e5e7eb" />
            </MotiView>
            <Text style={{
              fontSize: 16,
              color: '#9ca3af',
              marginTop: 12,
              textAlign: 'center',
            }}>
              {t.noActivity}
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}