import React from "react";
import { useVideoConfig } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";

import { Scene1Pain } from "./scenes/Scene1Pain";
import { Scene2Solution } from "./scenes/Scene2Solution";
import { Scene3Upload } from "./scenes/Scene3Upload";
import { Scene4BoundingBox } from "./scenes/Scene4BoundingBox";
import { Scene5AIGeneration } from "./scenes/Scene5AIGeneration";
import { Scene6FeatureMontage } from "./scenes/Scene6FeatureMontage";
import { Scene7CTA } from "./scenes/Scene7CTA";

export const ContentCheckmatePromo: React.FC = () => {
  const { fps } = useVideoConfig();

  // Scene durations in frames (30fps)
  // Total: 30 seconds = 900 frames
  const TRANSITION_DURATION = 10; // ~0.33 seconds - fast transitions

  const scenes = [
    { component: Scene1Pain, duration: fps * 5 },         // 0-5s: Pain point with social post
    { component: Scene2Solution, duration: fps * 3 },     // 5-8s: Solution intro
    { component: Scene3Upload, duration: fps * 6 },       // 8-14s: Upload & Analyze demo
    { component: Scene4BoundingBox, duration: fps * 4 },  // 14-18s: Bounding boxes
    { component: Scene5AIGeneration, duration: fps * 5 }, // 18-23s: AI generation
    { component: Scene6FeatureMontage, duration: fps * 4 }, // 23-27s: Feature montage
    { component: Scene7CTA, duration: fps * 3 },          // 27-30s: CTA
  ];

  return (
    <TransitionSeries>
      {scenes.map((scene, index) => {
        const Scene = scene.component;
        const isLast = index === scenes.length - 1;

        return (
          <React.Fragment key={index}>
            <TransitionSeries.Sequence durationInFrames={scene.duration}>
              <Scene />
            </TransitionSeries.Sequence>
            {!isLast && (
              <TransitionSeries.Transition
                presentation={index % 2 === 0 ? fade() : slide({ direction: "from-right" })}
                timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
              />
            )}
          </React.Fragment>
        );
      })}
    </TransitionSeries>
  );
};
