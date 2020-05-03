var sw;

const requestNotificationPermission = async () => {
  const permission = await window.Notification.requestPermission();
  if(permission !== 'granted'){
      throw new Error('Permission not granted for Notification');
  }
}

const showLocalNotification = (title, body) => {
  // const options = {
  //   "//": "Visual Options",
  //   "body": "<String>",
  //   "icon": "<URL String>",
  //   "image": "<URL String>",
  //   "badge": "<URL String>",
  //   "vibrate": "<Array of Integers>",
  //   "sound": "<URL String>",
  //   "dir": "<String of 'auto' | 'ltr' | 'rtl'>",
  //   "//": "Behavioural Options",
  //   "tag": "<String>",
  //   "data": "<Anything>",
  //   "requireInteraction": "<boolean>",
  //   "renotify": "<Boolean>",
  //   "silent": "<Boolean>",
  //   "//": "Both Visual & Behavioural Options",
  //   "actions": "<Array of Strings>",
  //   "//": "Information Option. No visual affect.",
  //   "timestamp": "<Long>"
  // }
  const options = {
      body,
      // here you can add more properties like icon, image, vibrate, etc.
  };
  sw.showNotification(title, options);
}

async function registerSW() { 
  if ('serviceWorker' in navigator) { 
    try {
      let res = await navigator.serviceWorker.register('./sw.js'); 
      return res;
    } catch (e) {
      throw e 
    }
  } else {
    document.querySelector('.alert').removeAttribute('hidden'); 
  }
}
var noSleep;
window.addEventListener('load', async e => {
  sw = await registerSW()
  permission = await requestNotificationPermission();
  noSleep = new NoSleep();
});



var selectedTemplate='basic-stretch'
var templateDom = document.getElementById('templates');
templateDom.addEventListener('onChange', (event)=>{
  console.log(event.target.value)
})

Object.keys(templates).forEach(k=>{
  var c = document.createElement('option')
  c.innerHTML = templates[k].name;
  c.value = k
  templateDom.appendChild(c)
})

stretchStarted = false;
var stretchButton = document.getElementById('stretch-btn');
stretchButton.addEventListener('click',async function(){
  if(stretchStarted){
    stretchButton.innerHTML = 'Start'
    noSleep.disable();
    stretchStarted=false;
    navigator.serviceWorker.ready.then(function(swRegistration) {
      return swRegistration.sync.register('stretch-stop');
    });
    return;
  }
    stretchButton.innerHTML = 'Stop'
    noSleep.enable();
  stretchStarted = true;
  navigator.serviceWorker.ready.then(function(swRegistration) {
    return swRegistration.sync.register('stretch-start');
  });
  
})

function read(str){
  if ('speechSynthesis' in window) {

    var synthesis = window.speechSynthesis;
  
    // Get the first `en` language voice in the list
    var voice = synthesis.getVoices().filter(function(voice) {
      return voice.lang === 'en';
    })[0];
  
    // Create an utterance object
    var utterance = new SpeechSynthesisUtterance(str);
  
    // Set utterance properties
    utterance.voice = voice;
    utterance.pitch = 1;
    utterance.rate = 0.8;
    utterance.volume = 0.8;
  
    // Speak the utterance
    synthesis.speak(utterance);
  
  } else {
    console.log('Text-to-speech not supported.');
  }
}

async function wait(s){
  return new Promise((resolve)=>{setTimeout(()=>resolve(),s*1000)})
}

var synthesis = window.speechSynthesis;
var step=0
var isRedo=false
var laps=0
navigator.serviceWorker.addEventListener('message', async event => { 
  if(event.data.type === 'next'){
    var current = templates[selectedTemplate].items[step];
    Object.keys(current).forEach(k=>{
      if(k==='image'){
        document.getElementById('img').src=current[k];
      } else {
        var d = document.getElementById(k)
        if(d){
          d.innerHTML = current[k]
        }
      }
    })
    if(current.leftAndRight && !isRedo){
      isRedo = true
    } else {
      step++;
      step%=templates[selectedTemplate].items.length;
      isRedo = false;
    }
    read(current.prepration);
    await wait(5);
    read(current.execution);
    await wait(1);
    read(current.comment);

  }
}, false);