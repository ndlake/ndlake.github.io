const synth = window.speechSynthesis;

const voiceSelect = document.querySelector("#voice-select");

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
        option.setAttribute('data-lang', voices[i].lang);
        option.setAttribute('data-name', voices[i].name);
        if (voices[i].default) {
            option.textContent += ' - DEFAULT';
        }
        voiceSelect.appendChild(option);
    }
    voiceSelect.selectedIndex = -1;
}

populateVoiceList();

if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoiceList;
}

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
    utterThis.voice = voices[0];
    if (voiceSelect.selectedOptions != undefined) {
        const selectedOption = voiceSelect.selectedOptions[0].getAttribute("data-name");
        for (let i = 0; i < voices.length; i++) {
            if (voices[i].name === selectedOption) {
                utterThis.voice = voices[i];
                break;
            }
        }
    }
    utterThis.pitch = 1;
    utterThis.rate = 1;
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

export function audioPlayer(text) {
    /*
    let assembledText = "";
    let node = event.target;
    while (node !== null && node !== undefined) {
        assembledText += node.textContent;
        node = getNextLine(node);
    }
    */
    speakLine(text);
}

function getNextLine(node) {
    let nextNode = node.nextSibling;
    while (nextNode !== undefined && nextNode !== null && nextNode.dir == "") {
        nextNode = nextNode.nextSibling;
    }
    return nextNode;
}

const playBtn = document.querySelector("#play");
playBtn.addEventListener("click", (e) => {
    (playBtn.textContent === "Play") ? resumePlayer() : pausePlayer();
    playBtn.textContent = (playBtn.textContent == "Play") ? "Pause" : "Play";
    e.preventDefault();
});

function resumePlayer() {
    if (synth.paused) {
        //synth.resume();
        console.log("Resume last token if on same page, if on new page, start at beginning");
    }
}

function pausePlayer() {
    if (synth.speaking) {
        synth.cancel();
    }
}



