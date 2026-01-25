import { loadFont as loadInstrumentSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

// Load fonts with specific weights
const instrumentSerif = loadInstrumentSerif("normal", {
  weights: ["400"],
  subsets: ["latin"],
});

const inter = loadInter("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const fontFamily = {
  display: instrumentSerif.fontFamily,
  body: inter.fontFamily,
};
