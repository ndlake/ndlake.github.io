// ADD IMPROVED PAGE NAVIGATION(EITHER BY ENTERING PAGE NUMBER, OR SHOW ALL PAGES AND USE SCROLL WHEEL)
// EXPERIMENTAL: ADD ABILITY TO READ ENTIRE SECTION AND RETURN A MP3 OR SOMEOTHER AUDIO?
// EXPERIMENTAL: ASSEMBLE PAGE TEXT INTO SECTIONS, THEN ALLOW USER TO HIGHLIGHT SECTIONS ON HOVER?
                    // --> AS SECTION IS READ, HIGHLIGHT?
//Page turning on end of page
 //           - Pause/Unpause
  //          - Ignore errant clicks(don't restart, read again when done)
   //         - Improve handling when switching pages(cancel reading)
    //        - Improve compatibility between browsers(doesn't work on

//USE MUTATION OBSERVER TO CHECK IF TEXT ELEMENTS ARE LOADED, ADD EVENTLISTENERS
const synth = window.speechSynthesis;

const voiceSelect = document.querySelector("#voice-select");
const playBtn = document.querySelector("#play");

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

export function audioPlayer(event) {
    let assembledText = "";
    let node = event.target;
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

playBtn.addEventListener("click", (e) => {
    (playBtn.textContent === "Play") ? resumePlayer() : pausePlayer();
    playBtn.textContent = (playBtn.textContent == "Play") ? "Pause" : "Play";
    e.preventDefault();
});

function resumePlayer() {
    if (synth.paused) {
        synth.resume();
    }
}

function pausePlayer() {
    if (synth.speaking) {
        synth.resume();
    }
}
function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}


