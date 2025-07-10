
const sounds: { [key: string]: HTMLAudioElement } = {};

const soundSources = {
  move: 'https://cdn.pixabay.com/audio/2022/10/16/audio_a9f13f7356.mp3',
  collect: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c3b092d37c.mp3',
  use: 'https://cdn.pixabay.com/audio/2022/04/06/audio_51f61975e8.mp3',
  break: 'https://cdn.pixabay.com/audio/2023/04/24/audio_9091333d02.mp3',
  win: 'https://cdn.pixabay.com/audio/2022/01/21/audio_a11972a975.mp3',
  lose: 'https://cdn.pixabay.com/audio/2022/02/21/audio_03166d860f.mp3',
  stun: 'https://cdn.pixabay.com/audio/2022/03/24/audio_34b079d324.mp3',
};

// Preload sounds for better performance
Object.entries(soundSources).forEach(([name, src]) => {
  const audio = new Audio(src);
  audio.preload = 'auto';
  sounds[name] = audio;
});

export const playSound = (name: keyof typeof soundSources) => {
  if (sounds[name]) {
    // Clone the preloaded audio element to allow for overlapping sounds (e.g., rapid movement).
    // This is more robust than resetting the currentTime of a single instance.
    const sound = sounds[name].cloneNode(true) as HTMLAudioElement;
    sound.play().catch(e => {
        // This error can happen if the user hasn't interacted with the page yet (autoplay policies).
        // It can also happen if the audio file format is not supported or the URL is invalid.
        // We are replacing the URLs to ensure they are valid and use standard mp3 format.
        console.error(`Could not play sound: ${name}`, e)
    });
  }
};
