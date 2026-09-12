import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import type { StyleProp, ViewStyle } from 'react-native';

type VerifiedBadgeProps = {
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export const VerifiedBadge = ({ size = 16, style }: VerifiedBadgeProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Defs>
      <LinearGradient id="verifiedBadgeBlue" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
        <Stop offset="0" stopColor="#4FA4FF" />
        <Stop offset="0.52" stopColor="#2388F2" />
        <Stop offset="1" stopColor="#1172DD" />
      </LinearGradient>
    </Defs>
    <Path
      d="M12 1.25l1.78 2.16 2.72-.68.9 2.65 2.79.21.21 2.79 2.35 1.52-1.52 2.35.68 2.72-2.65.9-.9 2.65-2.79.21-1.52 2.35-2.35-1.52-2.72.68-.9-2.65-2.79-.21-.21-2.79-2.35-1.52 1.52-2.35-.68-2.72 2.65-.9.9-2.65 2.79-.21L12 1.25z"
      fill="url(#verifiedBadgeBlue)"
    />
    <Path
      d="M7.15 12.15l3.2 3.2 6.65-6.7"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth={2.9}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
