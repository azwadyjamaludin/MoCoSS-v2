import { useEffect } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import Svg, {
    Circle,
    Defs,
    G,
    LinearGradient,
    RadialGradient,
    Rect,
    Stop,
    Text as SvgText,
} from 'react-native-svg';

const { width, height } = Dimensions.get('window');

interface MoCoSSSplashScreenProps {
  onFinish?: () => void;
}

export default function MoCoSSSplashScreen({ onFinish }: MoCoSSSplashScreenProps) {
  const pulse = useSharedValue(0);
  const waveHeight = useSharedValue(1);
  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) });
    scale.value = withTiming(1, { duration: 800, easing: Easing.back(1.2) });

    pulse.value = withRepeat(
      withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    waveHeight.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 600, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.7, { duration: 600, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, []);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 150 })
    );

    if (onFinish) {
      onFinish();
    }
  };

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <Animated.View style={[styles.svgWrapper, containerAnimatedStyle]}>
        <View style={styles.svgContainer}>
          <Svg width={280} height={280} viewBox="0 0 280 280" fill="none">
            <Defs>
              <RadialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#1E1B4B" stopOpacity={0.8} />
                <Stop offset="100%" stopColor="#0B0F19" stopOpacity={1} />
              </RadialGradient>

              <LinearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#38BDF8" />
                <Stop offset="50%" stopColor="#6366F1" />
                <Stop offset="100%" stopColor="#A855F7" />
              </LinearGradient>

              <LinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0%" stopColor="#38BDF8" stopOpacity={0.6} />
                <Stop offset="100%" stopColor="#A855F7" stopOpacity={0.1} />
              </LinearGradient>
            </Defs>

            {/* Background */}
            <Rect width="280" height="280" rx="60" fill="url(#bgGlow)" />

            {/* Neural Nodes */}
            <G opacity={0.6}>
              <Circle cx="80" cy="80" r="4" fill="#38BDF8" />
              <Circle cx="200" cy="80" r="4" fill="#A855F7" />
              <Circle cx="60" cy="140" r="3" fill="#6366F1" />
              <Circle cx="220" cy="140" r="3" fill="#6366F1" />
            </G>

            {/* Waveform Bars */}
            <G>
              <Rect x="85" y="110" width="8" height="40" rx="4" fill="url(#waveGrad)" />
              <Rect x="103" y="95" width="8" height="70" rx="4" fill="url(#waveGrad)" />
              <Rect x="121" y="80" width="8" height="100" rx="4" fill="url(#waveGrad)" />
              <Rect x="139" y="70" width="8" height="120" rx="4" fill="url(#waveGrad)" />
              <Rect x="157" y="80" width="8" height="100" rx="4" fill="url(#waveGrad)" />
              <Rect x="175" y="95" width="8" height="70" rx="4" fill="url(#waveGrad)" />
              <Rect x="193" y="110" width="8" height="40" rx="4" fill="url(#waveGrad)" />
            </G>

            {/* Centered MoCoSS Title */}
            <SvgText
              x="140"
              y="220"
              fontSize="26"
              fontWeight="bold"
              fill="#F8FAFC"
              textAnchor="middle"
              letterSpacing="3"
            >
              MoCoSS
            </SvgText>
          </Svg>
        </View>
      </Animated.View>

      <Text style={styles.subtitle}>AI-Driven Clinical Counseling Supervision</Text>
      <Text style={styles.hint}>Tap screen to proceed</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    height: height,
    backgroundColor: '#0B0F19',
    justifyContent: 'center',
    alignItems: 'center',
  },
  svgWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgContainer: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 32,
    letterSpacing: 0.8,
    fontWeight: '500',
  },
  hint: {
    color: '#475569',
    fontSize: 11,
    marginTop: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});