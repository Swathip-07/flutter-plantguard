import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import Animated, {
  FadeInDown,
  BounceIn,
  SlideInUp,
  FadeIn,
  ZoomIn,
} from 'react-native-reanimated';
import { MotiView } from 'moti';
import { 
  Camera, 
  ArrowLeft, 
  FlipHorizontal,
  Zap,
  ZapOff,
  ImageIcon,
  Sparkles,
  CheckCircle,
  AlertCircle,
  RotateCcw
} from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import { useQuery } from '@tanstack/react-query';

const translations = {
  en: {
    title: 'Disease Detection',
    subtitle: 'Take a photo of your crop to detect diseases',
    takePhoto: 'Take Photo',
    retakePhoto: 'Retake Photo',
    chooseFromGallery: 'Choose from Gallery',
    analyzing: 'Analyzing your crop...',
    permissionTitle: 'Camera Permission Required',
    permissionMessage: 'We need camera access to take photos of your crops',
    grantPermission: 'Grant Permission',
    flipCamera: 'Flip Camera',
    toggleFlash: 'Toggle Flash',
    selectCrop: 'Select Crop Type',
    cropRequired: 'Please select a crop type first',
    analysisComplete: 'Analysis Complete!',
    noDisease: 'Your crop looks healthy!',
    diseaseDetected: 'Disease detected',
    confidence: 'Confidence',
    recommendations: 'Treatment Recommendations',
    viewTreatment: 'View Treatment',
    backToDashboard: 'Back to Dashboard',
  },
  ta: {
    title: 'நோய் கண்டறிதல்',
    subtitle: 'நோய்களைக் கண்டறிய உங்கள் பயிரின் புகைப்படம் எடுக்கவும்',
    takePhoto: 'புகைப்படம் எடுக்கவும்',
    retakePhoto: 'மீண்டும் எடுக்கவும்',
    chooseFromGallery: 'கேலரியில் இருந்து தேர்வு செய்யவும்',
    analyzing: 'உங்கள் பயிரை பகுப்பாய்வு செய்கிறது...',
    permissionTitle: 'கேமரா அனுமதி தேவை',
    permissionMessage: 'உங்கள் பயிர்களின் புகைப்படங்களை எடுக்க கேமரா அணுகல் தேவை',
    grantPermission: 'அனுமதி வழங்கவும்',
    flipCamera: 'கேமராவை புரட்டவும்',
    toggleFlash: 'ஃபிளாஷ் மாற்றவும்',
    selectCrop: 'பயிர் வகையைத் தேர்ந்தெடுக்கவும்',
    cropRequired: 'முதலில் பயிர் வகையைத் தேர்ந்தெடுக்கவும்',
    analysisComplete: 'பகுப்பாய்வு முடிந்தது!',
    noDisease: 'உங்கள் பயிர் ஆரோக்கியமாக உள்ளது!',
    diseaseDetected: 'நோய் கண்டறியப்பட்டது',
    confidence: 'நம்பிக்கை',
    recommendations: 'சிகிச்சை பரிந்துரைகள்',
    viewTreatment: 'சிகிச்சையைப் பார்க்கவும்',
    backToDashboard: 'டாஷ்போர்டுக்குத் திரும்பவும்',
  },
  te: {
    title: 'వ్యాధి గుర్తింపు',
    subtitle: 'వ్యాధులను గుర్తించడానికి మీ పంట ఫోటో తీయండి',
    takePhoto: 'ఫోటో తీయండి',
    retakePhoto: 'మళ్లీ తీయండి',
    chooseFromGallery: 'గ్యాలరీ నుండి ఎంచుకోండి',
    analyzing: 'మీ పంటను విశ్లేషిస్తోంది...',
    permissionTitle: 'కెమెరా అనుమతి అవసరం',
    permissionMessage: 'మీ పంటల ఫోటోలు తీయడానికి కెమెరా యాక్సెస్ అవసరం',
    grantPermission: 'అనుమతి ఇవ్వండి',
    flipCamera: 'కెమెరాను తిప్పండి',
    toggleFlash: 'ఫ్లాష్ మార్చండి',
    selectCrop: 'పంట రకాన్ని ఎంచుకోండి',
    cropRequired: 'దయచేసి మొదట పంట రకాన్ని ఎంచుకోండి',
    analysisComplete: 'విశ్లేషణ పూర్తయింది!',
    noDisease: 'మీ పంట ఆరోగ్యంగా ఉంది!',
    diseaseDetected: 'వ్యాధి గుర్తించబడింది',
    confidence: 'విశ్వాసం',
    recommendations: 'చికిత్సా సిఫార్సులు',
    viewTreatment: 'చికిత్సను చూడండి',
    backToDashboard: 'డాష్‌బోర్డుకు తిరిగి వెళ్లండి',
  },
  kn: {
    title: 'ರೋಗ ಪತ್ತೆ',
    subtitle: 'ರೋಗಗಳನ್ನು ಪತ್ತೆಹಚ್ಚಲು ನಿಮ್ಮ ಬೆಳೆಯ ಫೋಟೋ ತೆಗೆಯಿರಿ',
    takePhoto: 'ಫೋಟೋ ತೆಗೆಯಿರಿ',
    retakePhoto: 'ಮತ್ತೆ ತೆಗೆಯಿರಿ',
    chooseFromGallery: 'ಗ್ಯಾಲರಿಯಿಂದ ಆಯ್ಕೆಮಾಡಿ',
    analyzing: 'ನಿಮ್ಮ ಬೆಳೆಯನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತಿದೆ...',
    permissionTitle: 'ಕ್ಯಾಮೆರಾ ಅನುಮತಿ ಅಗತ್ಯ',
    permissionMessage: 'ನಿಮ್ಮ ಬೆಳೆಗಳ ಫೋಟೋಗಳನ್ನು ತೆಗೆಯಲು ಕ್ಯಾಮೆರಾ ಪ್ರವೇಶ ಅಗತ್ಯ',
    grantPermission: 'ಅನುಮತಿ ನೀಡಿ',
    flipCamera: 'ಕ್ಯಾಮೆರಾ ತಿರುಗಿಸಿ',
    toggleFlash: 'ಫ್ಲಾಶ್ ಬದಲಿಸಿ',
    selectCrop: 'ಬೆಳೆ ಪ್ರಕಾರವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    cropRequired: 'ದಯವಿಟ್ಟು ಮೊದಲು ಬೆಳೆ ಪ್ರಕಾರವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    analysisComplete: 'ವಿಶ್ಲೇಷಣೆ ಪೂರ್ಣಗೊಂಡಿದೆ!',
    noDisease: 'ನಿಮ್ಮ ಬೆಳೆ ಆರೋಗ್ಯಕರವಾಗಿದೆ!',
    diseaseDetected: 'ರೋಗ ಪತ್ತೆಯಾಗಿದೆ',
    confidence: 'ವಿಶ್ವಾಸ',
    recommendations: 'ಚಿಕಿತ್ಸೆ ಶಿಫಾರಸುಗಳು',
    viewTreatment: 'ಚಿಕಿತ್ಸೆ ವೀಕ್ಷಿಸಿ',
    backToDashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಿ',
  },
  ml: {
    title: 'രോഗ കണ്ടെത്തൽ',
    subtitle: 'രോഗങ്ങൾ കണ്ടെത്താൻ നിങ്ങളുടെ വിളയുടെ ഫോട്ടോ എടുക്കുക',
    takePhoto: 'ഫോട്ടോ എടുക്കുക',
    retakePhoto: 'വീണ്ടും എടുക്കുക',
    chooseFromGallery: 'ഗാലറിയിൽ നിന്ന് തിരഞ്ഞെടുക്കുക',
    analyzing: 'നിങ്ങളുടെ വിള വിശകലനം ചെയ്യുന്നു...',
    permissionTitle: 'ക്യാമറ അനുമതി ആവശ്യം',
    permissionMessage: 'നിങ്ങളുടെ വിളകളുടെ ഫോട്ടോകൾ എടുക്കാൻ ക്യാമറ ആക്സസ് ആവശ്യം',
    grantPermission: 'അനുമതി നൽകുക',
    flipCamera: 'ക്യാമറ മറിക്കുക',
    toggleFlash: 'ഫ്ലാഷ് മാറ്റുക',
    selectCrop: 'വിള തരം തിരഞ്ഞെടുക്കുക',
    cropRequired: 'ദയവായി ആദ്യം വിള തരം തിരഞ്ഞെടുക്കുക',
    analysisComplete: 'വിശകലനം പൂർത്തിയായി!',
    noDisease: 'നിങ്ങളുടെ വിള ആരോഗ്യകരമാണ്!',
    diseaseDetected: 'രോഗം കണ്ടെത്തി',
    confidence: 'വിശ്വാസം',
    recommendations: 'ചികിത്സാ ശുപാർശകൾ',
    viewTreatment: 'ചികിത്സ കാണുക',
    backToDashboard: 'ഡാഷ്ബോർഡിലേക്ക് മടങ്ങുക',
  },
};

export default function DiseaseDetection() {
  const insets = useSafeAreaInsets();
  const [language, setLanguage] = useState('en');
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [facing, setFacing] = useState('back');
  const [flash, setFlash] = useState('off');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  const t = translations[language] || translations.en;

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const savedLanguage = await SecureStore.getItemAsync('selectedLanguage');
      if (savedLanguage) setLanguage(savedLanguage);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Fetch available crops
  const { data: cropsData } = useQuery({
    queryKey: ['crops', language],
    queryFn: async () => {
      const response = await fetch(`/api/crops?language=${language}`);
      if (!response.ok) {
        throw new Error('Failed to fetch crops');
      }
      return response.json();
    },
  });

  const crops = cropsData?.crops || [];

  const takePicture = async () => {
    if (!selectedCrop) {
      Alert.alert('Error', t.cropRequired);
      return;
    }

    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });
      setCapturedImage(photo.uri);
      analyzeImage(photo.uri);
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture');
    }
  };

  const pickImageFromGallery = async () => {
    if (!selectedCrop) {
      Alert.alert('Error', t.cropRequired);
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets[0].uri);
        analyzeImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const analyzeImage = async (imageUri) => {
    setIsAnalyzing(true);
    
    try {
      // Simulate API call for disease detection
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock analysis result
      const mockResult = {
        hasDisease: Math.random() > 0.5,
        diseaseName: 'Leaf Blight',
        confidence: Math.floor(Math.random() * 30) + 70, // 70-99%
        recommendations: [
          'Apply fungicide spray',
          'Improve drainage',
          'Remove affected leaves'
        ]
      };
      
      setAnalysisResult(mockResult);
    } catch (error) {
      console.error('Error analyzing image:', error);
      Alert.alert('Error', 'Failed to analyze image');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlash(current => (current === 'off' ? 'on' : current === 'on' ? 'auto' : 'off'));
  };

  if (!permission) {
    return <View style={{ flex: 1, backgroundColor: '#f8fafc' }} />;
  }

  if (!permission.granted) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: '#f8fafc',
        paddingTop: insets.top,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
      }}>
        <StatusBar style="dark" />
        
        <Animated.View entering={BounceIn} style={{ alignItems: 'center' }}>
          <View style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: '#22c55e',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 24,
          }}>
            <Camera size={50} color="#fff" />
          </View>
          
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: 12,
            textAlign: 'center',
          }}>
            {t.permissionTitle}
          </Text>
          
          <Text style={{
            fontSize: 16,
            color: '#6b7280',
            textAlign: 'center',
            marginBottom: 32,
            lineHeight: 24,
          }}>
            {t.permissionMessage}
          </Text>
          
          <TouchableOpacity
            onPress={requestPermission}
            style={{
              backgroundColor: '#22c55e',
              borderRadius: 16,
              paddingHorizontal: 32,
              paddingVertical: 16,
              shadowColor: '#22c55e',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: '#fff',
            }}>
              {t.grantPermission}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

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
          alignItems: 'center',
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#fff',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <ArrowLeft size={20} color="#1f2937" />
        </TouchableOpacity>
        
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: 4,
          }}>
            {t.title}
          </Text>
          <Text style={{
            fontSize: 14,
            color: '#6b7280',
          }}>
            {t.subtitle}
          </Text>
        </View>

        {/* Floating sparkles */}
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
          <Sparkles size={20} color="#22c55e" />
        </MotiView>
      </Animated.View>

      {/* Crop Selection */}
      {!capturedImage && (
        <Animated.View 
          entering={FadeInDown.delay(200)}
          style={{
            paddingHorizontal: 24,
            marginBottom: 20,
          }}
        >
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: 12,
          }}>
            {t.selectCrop}
          </Text>
          
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
          }}>
            {crops.slice(0, 6).map((crop) => (
              <TouchableOpacity
                key={crop.id}
                onPress={() => setSelectedCrop(crop)}
                style={{
                  backgroundColor: selectedCrop?.id === crop.id ? '#22c55e' : '#fff',
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderWidth: 1,
                  borderColor: selectedCrop?.id === crop.id ? '#22c55e' : '#e5e7eb',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                <Text style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: selectedCrop?.id === crop.id ? '#fff' : '#374151',
                }}>
                  {crop.display_name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      )}

      {/* Camera View or Image Display */}
      <View style={{ flex: 1, marginHorizontal: 24, marginBottom: 24 }}>
        {capturedImage ? (
          <Animated.View 
            entering={ZoomIn}
            style={{
              flex: 1,
              borderRadius: 20,
              overflow: 'hidden',
              backgroundColor: '#fff',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <Image
              source={{ uri: capturedImage }}
              style={{ flex: 1 }}
              contentFit="cover"
              transition={200}
            />
            
            {/* Analysis Overlay */}
            {isAnalyzing && (
              <Animated.View 
                entering={FadeIn}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <MotiView
                  from={{ scale: 0.8 }}
                  animate={{ scale: 1.2 }}
                  transition={{
                    type: 'timing',
                    duration: 1000,
                    loop: true,
                    repeatReverse: true,
                  }}
                >
                  <ActivityIndicator size="large" color="#22c55e" />
                </MotiView>
                <Text style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: '#fff',
                  marginTop: 16,
                  textAlign: 'center',
                }}>
                  {t.analyzing}
                </Text>
              </Animated.View>
            )}

            {/* Analysis Results */}
            {analysisResult && (
              <Animated.View 
                entering={SlideInUp}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  padding: 20,
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                }}
              >
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 12,
                }}>
                  {analysisResult.hasDisease ? (
                    <AlertCircle size={24} color="#ef4444" />
                  ) : (
                    <CheckCircle size={24} color="#22c55e" />
                  )}
                  <Text style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: analysisResult.hasDisease ? '#ef4444' : '#22c55e',
                    marginLeft: 8,
                  }}>
                    {analysisResult.hasDisease ? t.diseaseDetected : t.noDisease}
                  </Text>
                </View>
                
                {analysisResult.hasDisease && (
                  <>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: '#1f2937',
                      marginBottom: 4,
                    }}>
                      {analysisResult.diseaseName}
                    </Text>
                    <Text style={{
                      fontSize: 14,
                      color: '#6b7280',
                      marginBottom: 12,
                    }}>
                      {t.confidence}: {analysisResult.confidence}%
                    </Text>
                  </>
                )}
              </Animated.View>
            )}
          </Animated.View>
        ) : (
          <Animated.View 
            entering={BounceIn.delay(300)}
            style={{
              flex: 1,
              borderRadius: 20,
              overflow: 'hidden',
              backgroundColor: '#000',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <CameraView
              style={{ flex: 1 }}
              facing={facing}
              flash={flash}
              ref={cameraRef}
            >
              {/* Camera Controls */}
              <View style={{
                position: 'absolute',
                top: 20,
                right: 20,
                gap: 12,
              }}>
                <TouchableOpacity
                  onPress={toggleFlash}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {flash === 'off' ? (
                    <ZapOff size={24} color="#fff" />
                  ) : (
                    <Zap size={24} color="#fff" />
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={toggleCameraFacing}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <FlipHorizontal size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </CameraView>
          </Animated.View>
        )}
      </View>

      {/* Action Buttons */}
      <Animated.View 
        entering={FadeInDown.delay(400)}
        style={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 20,
          gap: 12,
        }}
      >
        {capturedImage ? (
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={retakePhoto}
              style={{
                flex: 1,
                backgroundColor: '#6b7280',
                borderRadius: 16,
                paddingVertical: 16,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#6b7280',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <RotateCcw size={20} color="#fff" />
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#fff',
                marginLeft: 8,
              }}>
                {t.retakePhoto}
              </Text>
            </TouchableOpacity>
            
            {analysisResult?.hasDisease && (
              <TouchableOpacity
                onPress={() => router.push('/treatment-results')}
                style={{
                  flex: 1,
                  backgroundColor: '#22c55e',
                  borderRadius: 16,
                  paddingVertical: 16,
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#22c55e',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#fff',
                }}>
                  {t.viewTreatment}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            <TouchableOpacity
              onPress={takePicture}
              disabled={!selectedCrop}
              style={{
                backgroundColor: selectedCrop ? '#22c55e' : '#9ca3af',
                borderRadius: 16,
                paddingVertical: 18,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: selectedCrop ? '#22c55e' : '#9ca3af',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Camera size={24} color="#fff" />
              <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: '#fff',
                marginLeft: 12,
              }}>
                {t.takePhoto}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={pickImageFromGallery}
              disabled={!selectedCrop}
              style={{
                backgroundColor: selectedCrop ? '#3b82f6' : '#9ca3af',
                borderRadius: 16,
                paddingVertical: 16,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: selectedCrop ? '#3b82f6' : '#9ca3af',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <ImageIcon size={20} color="#fff" />
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#fff',
                marginLeft: 8,
              }}>
                {t.chooseFromGallery}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </View>
  );
}