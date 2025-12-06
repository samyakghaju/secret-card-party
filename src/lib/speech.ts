// Text-to-speech utility using Web Speech API

export const speak = (text: string, onEnd?: () => void) => {
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 0.8;
    utterance.volume = 1;
    
    // Try to get a deeper voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('male'));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    
    if (onEnd) {
      utterance.onend = onEnd;
    }
    
    window.speechSynthesis.speak(utterance);
  } else if (onEnd) {
    // If speech synthesis not available, just call onEnd
    onEnd();
  }
};

export const cancelSpeech = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};
