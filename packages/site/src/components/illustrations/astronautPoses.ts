/**
 * The Cosmos brand character, from the brand kit (adult version, black line
 * variant), on its 1080-unit artboard. Each pose's paths live in `poses/`,
 * generated from the kit's SVGs; the viewBoxes here crop each drawing.
 */
export const ASTRONAUT_VIEWBOXES = {
  thumbsUp: '190 127 700 826',
};

export type AstronautPose = keyof typeof ASTRONAUT_VIEWBOXES;

/** One shape of the drawing; a `hole` is a white detail inside a black area. */
export type AstronautPath = { d: string; hole?: true };
