const sounds: { [key: string]: HTMLAudioElement } = {};

const soundSources = {
  move: 'https://actions.google.com/sounds/v1/movement/step_wood_plank_solid.ogg',
  collect: 'https://actions.google.com/sounds/v1/coins/coin_drop.ogg',
  use: 'https://actions.google.com/sounds/v1/switches/switch_on.ogg',
  break: 'https://actions.google.com/sounds/v1/impacts/wood_crack.ogg',
  win: 'https://actions.google.com/sounds/v1/events/victory_dance.ogg',
  lose: 'https://actions.google.com/sounds/v1/events/game_over.ogg',
  stun: 'https://actions.google.com/sounds/v1/impacts/hit_on_metal.ogg',
};

// Preload sounds for better performance
Object.entries(soundSources).forEach(([name, src]) => {
  const audio = new Audio(src);
  audio.preload = 'auto';
  sounds[name] = audio;
});

export const playSound = (name: keyof typeof soundSources) => {
  if (sounds[name]) {
    sounds[name].currentTime = 0;
    sounds[name].play().catch(e => console.error(`Could not play sound: ${name}`, e));
  }
};
