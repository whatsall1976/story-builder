function speakText1() {
  var msg = new SpeechSynthesisUtterance(pageData.conv1);
  // Get list of available voices
  var voices = window.speechSynthesis.getVoices();
  // Find voice by name
  var selectedVoice = voices.find(voice => voice.name === 'Microsoft Xiaoxiao Online (Natural) - Chinese (Mainland)');
  //var selectedVoice = voices.find(voice => voice.name === 'Microsoft Xiaoyi Online (Natural) - Chinese (Mainland)');
  // Set the selected voice
  msg.voice = selectedVoice;
  msg.rate = 1; // Set rate to normal speed
  // Speak the message
  window.speechSynthesis.speak(msg);
}

