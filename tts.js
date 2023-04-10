const synth = window.speechSynthesis;

const voiceSelect = document.querySelector("#voice-select");

let curVoice = null;
let voices = [];

let curLine = null;


voiceSelect.addEventListener('change', (e) => {
    curVoice = voiceSelect.selectedOptions[0].getAttribute("data-name");
});
//populate options
function populateVoiceList() {
    voices = synth.getVoices().sort(function (x, y) {
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
        return Promise.reject(new Error("SpeechSYnth is already speaking."));
    }
    if (line !== "") {
        return new Promise((resolve, reject) => {
            const utterThis = new SpeechSynthesisUtterance(line);
            utterThis.onend = function (event) {
                clearInterval(r);
                synth.cancel();
                resolve();
            };
            utterThis.onerror = function (event) {
                synth.cancel();
                resolve();
            };
            if (curVoice == null) {
                alert("Please select a voice from the drop down");
                resolve();
                return;
            }
            for (let i = 0; i < voices.length; i++) {
                if (voices[i].name === curVoice) {
                    utterThis.voice = voices[i];
                    break;
                }
            }
            utterThis.pitch = 1;
            utterThis.rate = 1;
            synth.cancel();
            synth.speak(utterThis);
            var r = setInterval(() => {
                console.log(synth.speaking, "interval loop");
                if (!synth.speaking) {
                    clearInterval(r);
                } else {
                    synth.pause();
                    synth.resume();
                }
            }, 14000);
        });
    }
}
export async function audioPlayer(text) {
    if (text == null) {
        return;
    }
    return await speakLine(text);
}

export function resumePlayer() {
    if (curLine != null) {
        audioPlayer(curLine);
    }
}

export function pausePlayer() {
    synth.cancel();
}



