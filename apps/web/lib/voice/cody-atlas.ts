import type { CodexPetAnimationName, PetSpriteAtlas } from "codex-pets-react"

// Cody sheet is 1536x2288 = 8x11 cells of 192x208. Default atlas uses 9 rows and clips wrong.
export const CODY_ATLAS: PetSpriteAtlas<CodexPetAnimationName> = {
  columns: 8,
  rows: 11,
  cellWidth: 192,
  cellHeight: 208,
  animations: {
    idle: {
      row: 0,
      frames: 6,
      frameDurations: [280, 110, 110, 140, 140, 320],
    },
    "running-right": {
      row: 1,
      frames: 8,
      frameDurations: [120, 120, 120, 120, 120, 120, 120, 220],
    },
    "running-left": {
      row: 2,
      frames: 8,
      frameDurations: [120, 120, 120, 120, 120, 120, 120, 220],
    },
    waving: {
      row: 3,
      frames: 4,
      frameDurations: [140, 140, 140, 280],
    },
    jumping: {
      row: 4,
      frames: 5,
      frameDurations: [140, 140, 140, 140, 280],
    },
    failed: {
      row: 5,
      frames: 8,
      frameDurations: [140, 140, 140, 140, 140, 140, 140, 240],
    },
    waiting: {
      row: 6,
      frames: 6,
      frameDurations: [150, 150, 150, 150, 150, 260],
    },
    running: {
      row: 7,
      frames: 6,
      frameDurations: [120, 120, 120, 120, 120, 220],
    },
    review: {
      row: 8,
      frames: 6,
      frameDurations: [150, 150, 150, 150, 150, 280],
    },
  },
}

export const CODY_SCALE = 0.7
export const CODY_WIDTH = CODY_ATLAS.cellWidth * CODY_SCALE
export const CODY_HEIGHT = CODY_ATLAS.cellHeight * CODY_SCALE
