import { TextStyle } from 'react-native';

export const fontFamilies = {
  serifDisplay: 'Fraunces_700Bold',
  serifHeading: 'Fraunces_600SemiBold',
  serifRegular: 'Fraunces_400Regular',
  sansBold: 'Inter_700Bold',
  sansSemiBold: 'Inter_600SemiBold',
  sansMedium: 'Inter_500Medium',
  sansRegular: 'Inter_400Regular',
};

export const typography: Record<string, TextStyle> = {
  display: {
    fontFamily: fontFamilies.serifDisplay,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  title1: {
    fontFamily: fontFamilies.serifHeading,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  title2: {
    fontFamily: fontFamilies.serifHeading,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600',
  },
  title3: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  headline: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
  },
  body: {
    fontFamily: fontFamilies.sansRegular,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  bodyEmphasis: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  callout: {
    fontFamily: fontFamilies.sansRegular,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  subhead: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  caption: {
    fontFamily: fontFamilies.sansRegular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
  captionBold: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  button: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
  },
  eyebrow: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
};
