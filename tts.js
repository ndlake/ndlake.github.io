const synth = window.speechSynthesis;

const voiceSelect = document.querySelector("#voice-select");

let voiceSelected = false;
let mouseDown = false;
let onPause = false;
let currentNode = null;
let doneSpeaking = true;
let voices = [];

//populate options
function populateVoiceList() {
    voices = synth.getVoices().sort(function(x, y) {
        const xName = x.name.toUpperCase();
        const yName = y.name.toUpperCase();
        if (xName < yName) {
            return -1;
        } else if (xName > yName) {
            return 1;
        }
        return 0;
    });
    for (let i = 0; i < voices.length; i++) {
        const option = document.createElement("option");
        option.textContent = `${voices[i].name} (${voices[i].lang})`;
        if (voices[i].default) {
            option.textContent += ' - DEFAULT';
        }
        option.setAttribute('data-lang', voices[i].lang);
        option.setAttribute('data-name', voices[i].name);
        voiceSelect.appendChild(option);
    }
    voiceSelect.selectedIndex = -1;
}

populateVoiceList();

if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoiceList;
}

document.addEventListener('mousedown', ()=> {
    mouseDown = true;
});

document.addEventListener('mouseup', ()=> {
    mouseDown = false;
    let node = document.getSelection().anchorNode;
    if ( node !== undefined && node !== null) {
        if (node.parentElement !== undefined && node.parentElement !== null) {
            if (node.parentElement.dir === "ltr") {
                audioPlayer(node.parentElement);
            }
        }  
    }
    
});

function speakLine(line) {
    if (synth.speaking) {
        console.error("synth.speaking");
        return;
    }
    if (line !== "") {
        const utterThis = new SpeechSynthesisUtterance(line);
        utterThis.onend = function (event) {
            console.log("SpeechSynthesisUtterance.onend");
            return 
        };
        utterThis.onerror = function (event) {
            console.error("SpeechSythesisUtterance.onerror");
        };
    const selectedOption = voiceSelect.selectedOptions[0].getAttribute("data-name");
    for (let i = 0; i < voices.length; i++) {
        if (voices[i].name === selectedOption) {
            utterThis.voice = voices[i];
            break;
        }
    }
    synth.cancel();
    synth.speak(utterThis);
    let r = setInterval(() => {
        console.log(synth.speaking);
        if (!synth.speaking) {
            clearInterval(r);
        } else {
            synth.pause();
            synth.resume();
        }
      }, 14000);
    }
}

function audioPlayer(node) {
    assembledText = "";
    while (node !== null && node !== undefined) {
        assembledText += node.textContent;
        node = getNextLine(node);
    }
    speakLine(assembledText);
}

function getNextLine(node) {
    let nextNode = node.nextSibling;
    while (nextNode !== undefined && nextNode !== null && nextNode.dir == "") {
        nextNode = nextNode.nextSibling;
    }
    return nextNode;
}

