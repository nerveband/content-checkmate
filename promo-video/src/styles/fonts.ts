import { loadFont as loadIBMPlexSans } from "@remotion/google-fonts/IBMPlexSans";
import { loadFont as loadIBMPlexMono } from "@remotion/google-fonts/IBMPlexMono";

// Load fonts with specific weights
const ibmPlexSans = loadIBMPlexSans("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const ibmPlexMono = loadIBMPlexMono("normal", {
  weights: ["400", "500"],
  subsets: ["latin"],
});

export const fontFamily = {
  display: ibmPlexSans.fontFamily,
  body: ibmPlexSans.fontFamily,
  mono: ibmPlexMono.fontFamily,
};
