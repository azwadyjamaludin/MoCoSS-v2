import { Ionicons } from '@expo/vector-icons';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ModuleCardProps {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  isAiPowered?: boolean; 
  aiBadgeText?: string;  
  onPress: () => void;
}

export default function ModuleCard({
  title,
  description,
  icon,
  color,
  isAiPowered = false,
  aiBadgeText = 'AI',
  onPress,
}: ModuleCardProps) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.topRow}>
        <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        {isAiPowered && (
          <View style={styles.aiBadge}>
            <Ionicons name="sparkles" size={10} color="#7C3AED" />
            <Text style={styles.aiBadgeText}>{aiBadgeText}</Text>
          </View>
        )}
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription} numberOfLines={2}>
        {description}
      </Text>
    </TouchableOpacity>
  );
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 44) / 2;

const styles = StyleSheet.create({
  card: {width: cardWidth,backgroundColor: '#FFFFFF',borderRadius: 16,padding: 16,marginBottom: 14,borderWidth: 1,borderColor: '#E2E8F0',elevation: 2,shadowColor: '#000',shadowOffset: { width: 0, height: 1 },shadowOpacity: 0.05,shadowRadius: 3,},
  topRow: {flexDirection: 'row',justifyContent: 'space-between',alignItems: 'flex-start',marginBottom: 10,},
  iconContainer: {width: 44, height: 44,borderRadius: 12,justifyContent: 'center',alignItems: 'center',},
  aiBadge: {flexDirection: 'row',alignItems: 'center',gap: 3,backgroundColor: '#F3E8FF',paddingHorizontal: 7,paddingVertical: 3,borderRadius: 999,},
  aiBadgeText: {fontSize: 10,fontWeight: '700',color: '#7C3AED',},
  cardTitle: {fontSize: 14,fontWeight: '700',color: '#0F172A',marginBottom: 4,},
  cardDescription: {fontSize: 11,color: '#64748B',lineHeight: 15,},
});