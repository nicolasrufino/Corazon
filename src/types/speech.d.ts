interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
}

interface Window {
  SpeechRecognition: new () => SpeechRecognition
  webkitSpeechRecognition: new () => SpeechRecognition
}
