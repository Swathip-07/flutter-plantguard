import React, { useEffect, useRef } from "react";
import { View, Text, Dimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  interpolate,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { MotiView } from "moti";
import { Leaf, Sparkles, Heart } from "lucide-react-native";

const { width, height } = Dimensions.get("window");

export default function SplashScreen() {
  const insets = useSafeAreaInsets();

  // Animation values
  const logoScale = useSharedValue(0);
  const logoRotation = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(50);
  const subtitleOpacity = useSharedValue(0);
  const subtitleY = useSharedValue(30);
  const backgroundGradient = useSharedValue(0);
  const sparkleOpacity = useSharedValue(0);

  const navigateToLanguageSelection = () => {
    router.replace("/language-selection");
  };

  useEffect(() => {
    // Start the animation sequence
    const startAnimations = () => {
      // Background gradient animation
      backgroundGradient.value = withTiming(1, {
        duration: 2000,
        easing: Easing.out(Easing.quad),
      });

      // Logo entrance with bounce and rotation
      logoScale.value = withSequence(
        withTiming(1.2, {
          duration: 800,
          easing: Easing.out(Easing.back(1.7)),
        }),
        withSpring(1, { damping: 8, stiffness: 100 }),
      );

      logoRotation.value = withSequence(
        withTiming(360, { duration: 1000, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 500 }),
      );

      // Title animation with delay
      titleOpacity.value = withDelay(600, withTiming(1, { duration: 800 }));
      titleY.value = withDelay(600, withSpring(0, { damping: 12 }));

      // Subtitle animation
      subtitleOpacity.value = withDelay(1000, withTiming(1, { duration: 600 }));
      subtitleY.value = withDelay(1000, withSpring(0, { damping: 10 }));

      // Sparkle effects
      sparkleOpacity.value = withDelay(
        1200,
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.7, { duration: 400 }),
          withTiming(1, { duration: 400 }),
        ),
      );

      // Navigate after animations complete
      setTimeout(() => {
        runOnJS(navigateToLanguageSelection)();
      }, 3500);
    };

    startAnimations();
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: logoScale.value },
        { rotate: `${logoRotation.value}deg` },
      ],
    };
  });

  const titleAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: titleOpacity.value,
      transform: [{ translateY: titleY.value }],
    };
  });

  const subtitleAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: subtitleOpacity.value,
      transform: [{ translateY: subtitleY.value }],
    };
  });

  const backgroundAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolate(
      backgroundGradient.value,
      [0, 1],
      [0x22c55e, 0x16a34a], // Green gradient
    );
    return {
      backgroundColor: `#${backgroundColor.toString(16).padStart(6, "0")}`,
    };
  });

  const sparkleAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: sparkleOpacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        {
          flex: 1,
          paddingTop: insets.top,
          justifyContent: "center",
          alignItems: "center",
        },
        backgroundAnimatedStyle,
      ]}
    >
      <StatusBar style="light" />

      {/* Floating sparkles */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: height * 0.2,
            left: width * 0.2,
          },
          sparkleAnimatedStyle,
        ]}
      >
        <MotiView
          from={{ scale: 0, rotate: "0deg" }}
          animate={{ scale: 1, rotate: "360deg" }}
          transition={{
            type: "timing",
            duration: 2000,
            loop: true,
            repeatReverse: false,
          }}
        >
          <Sparkles size={24} color="#FFF" />
        </MotiView>
      </Animated.View>

      <Animated.View
        style={[
          {
            position: "absolute",
            top: height * 0.3,
            right: width * 0.15,
          },
          sparkleAnimatedStyle,
        ]}
      >
        <MotiView
          from={{ scale: 0, rotate: "0deg" }}
          animate={{ scale: 1, rotate: "-360deg" }}
          transition={{
            type: "timing",
            duration: 2500,
            loop: true,
            repeatReverse: false,
            delay: 500,
          }}
        >
          <Heart size={20} color="#FFF" />
        </MotiView>
      </Animated.View>

      <Animated.View
        style={[
          {
            position: "absolute",
            bottom: height * 0.3,
            left: width * 0.1,
          },
          sparkleAnimatedStyle,
        ]}
      >
        <MotiView
          from={{ scale: 0, rotate: "0deg" }}
          animate={{ scale: 1, rotate: "360deg" }}
          transition={{
            type: "timing",
            duration: 3000,
            loop: true,
            repeatReverse: false,
            delay: 1000,
          }}
        >
          <Sparkles size={18} color="#FFF" />
        </MotiView>
      </Animated.View>

      {/* Main logo */}
      <Animated.View
        style={[
          {
            alignItems: "center",
            marginBottom: 40,
          },
          logoAnimatedStyle,
        ]}
      >
        <View
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 3,
            borderColor: "rgba(255, 255, 255, 0.3)",
          }}
        >
          <Leaf size={60} color="#FFF" />
        </View>
      </Animated.View>

      {/* Title */}
      <Animated.View
        style={[{ alignItems: "center", marginBottom: 20 }, titleAnimatedStyle]}
      >
        <Text
          style={{
            fontSize: 32,
            fontWeight: "bold",
            color: "#FFF",
            textAlign: "center",
            textShadowColor: "rgba(0, 0, 0, 0.3)",
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 4,
          }}
        >
          CropCare AI
        </Text>
      </Animated.View>

      {/* Subtitle */}
      <Animated.View
        style={[
          { alignItems: "center", paddingHorizontal: 40 },
          subtitleAnimatedStyle,
        ]}
      >
        <Text
          style={{
            fontSize: 18,
            color: "rgba(255, 255, 255, 0.9)",
            textAlign: "center",
            lineHeight: 24,
            textShadowColor: "rgba(0, 0, 0, 0.2)",
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 2,
          }}
        >
          Smart Crop Disease Detection{"\n"}for Better Farming
        </Text>
      </Animated.View>

      {/* Loading indicator */}
      <View
        style={{
          position: "absolute",
          bottom: insets.bottom + 60,
          alignItems: "center",
        }}
      >
        <MotiView
          from={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: 1.2, opacity: 1 }}
          transition={{
            type: "timing",
            duration: 1000,
            loop: true,
            repeatReverse: true,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              borderWidth: 3,
              borderColor: "rgba(255, 255, 255, 0.3)",
              borderTopColor: "#FFF",
            }}
          />
        </MotiView>
        <Text
          style={{
            color: "rgba(255, 255, 255, 0.8)",
            fontSize: 14,
            marginTop: 10,
          }}
        >
          Loading...
        </Text>
      </View>
    </Animated.View>
  );
}
