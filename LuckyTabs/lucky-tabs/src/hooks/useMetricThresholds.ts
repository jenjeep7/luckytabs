import { useMemo } from 'react';
import { useUserProfile } from '../context/UserProfileContext';

export interface MetricThresholds {
  rtpGoodThreshold: number;
  rtpDecentThreshold: number;
  evPositiveThreshold: number;
}

export const DEFAULT_THRESHOLDS: MetricThresholds = {
  rtpGoodThreshold: 85,
  rtpDecentThreshold: 75,
  evPositiveThreshold: 0
};

export const useMetricThresholds = (): MetricThresholds => {
  const { userProfile } = useUserProfile();

  const thresholds = useMemo(() => {
    if (userProfile?.metricThresholds) {
      return {
        rtpGoodThreshold: userProfile.metricThresholds.rtpGoodThreshold ?? DEFAULT_THRESHOLDS.rtpGoodThreshold,
        rtpDecentThreshold: userProfile.metricThresholds.rtpDecentThreshold ?? DEFAULT_THRESHOLDS.rtpDecentThreshold,
        evPositiveThreshold: userProfile.metricThresholds.evPositiveThreshold ?? DEFAULT_THRESHOLDS.evPositiveThreshold
      };
    }
    return DEFAULT_THRESHOLDS;
  }, [userProfile]);

  return thresholds;
};

// Helper function to determine status based on user's thresholds
export const getBoxStatus = (
  evValue: number,
  rtpValue: number,
  thresholds: MetricThresholds
): 'good' | 'decent' | 'poor' => {
  if (evValue >= thresholds.evPositiveThreshold || rtpValue > thresholds.rtpGoodThreshold) {
    return 'good';
  } else if (rtpValue >= thresholds.rtpDecentThreshold) {
    return 'decent';
  } else {
    return 'poor';
  }
};

// Helper function to get RTP color based on thresholds
export const getRTPColor = (
  rtpValue: number,
  thresholds: MetricThresholds,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  theme: any,
  isPercentage = true
): string => {
  const rtpGood = isPercentage ? thresholds.rtpGoodThreshold : thresholds.rtpGoodThreshold / 100;
  const rtpDecent = isPercentage ? thresholds.rtpDecentThreshold : thresholds.rtpDecentThreshold / 100;
  
  if (rtpValue > rtpGood) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return theme.neon.colors.cyan; // Good
  } else if (rtpValue >= rtpDecent) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return theme.neon.colors.amber; // Decent
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return theme.neon.colors.pink; // Poor
  }
};