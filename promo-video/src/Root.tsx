import { Composition } from "remotion";
import { ContentCheckmatePromo } from "./ContentCheckmatePromo";

// 4:3 ratio, 30 seconds at 30fps = 900 frames
const FPS = 30;
const DURATION_SECONDS = 30;
const WIDTH = 1024;
const HEIGHT = 768; // 4:3 ratio

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ContentCheckmatePromo"
      component={ContentCheckmatePromo}
      durationInFrames={FPS * DURATION_SECONDS}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};
