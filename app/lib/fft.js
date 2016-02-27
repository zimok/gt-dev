export default function fft(id) {

  var audio = document.getElementById('track')
  var audioContext = new AudioContext()
  var source = audioContext.createMediaElementSource(audio)
  var analyser = audioContext.createAnalyser()
  
  source.connect(analyser);
  analyser.connect(audioContext.destination)

  analyser.fftSize = 256


  // var bufferLength = analyser.frequencyBinCount
  // var dataArray = new Uint8Array(analyser.frequencyBinCount)
  
 
  // frequencyBinCount tells you how many values you'll receive from the analyser
  //var frequencyData = new Uint8Array(analyser.frequencyBinCount)
 

  // function renderFrame() {
  //    requestAnimationFrame(renderFrame);
  //    // update data in frequencyData
  //    analyser.getByteFrequencyData(frequencyData);
  //    // render frame based on values in frequencyData
  // }

  
  //audio.play()

  return { analyser, audio }
}