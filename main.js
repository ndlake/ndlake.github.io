import * as tts from './tts.js';

let url = null;
// Loaded via <script> tag, create shortcut to access PDF.js exports.
pdfjsLib = window['pdfjs-dist/build/pdf'];
// The workerSrc property shall be specified.
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

let pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    pdfPageView = null;;
let OGscale = 1;//being updated in renderPage
const canvas = document.querySelector('#pdf-render');
const container = document.getElementById("pageContainer");
const eventBus = new pdfjsViewer.EventBus();

function activateTextListeners() {
    console.log("activate!");

    let textElements = document.querySelectorAll("span[dir='ltr']");
    console.log(textElements.length);
    textElements.forEach((e) => {
        e.addEventListener("click", tts.audioPlayer);
        e.classList.add("textObject");
        //console.log(e.textContent);
    });
}

//render page
function renderPage(num) {
    pageRendering = true;
    let renderTask = pdfDoc.getPage(pageNum).then(function(page) {
        // Associate the actual page with the view, and draw it.
        pdfPageView.setPdfPage(page);
        return pdfPageView.draw();
    });
    pageRendering = false;
    if (pageNumPending !== null) {
        //new page is pending
        renderPage(pageNumPending);
        pageNumPending = null;
    }
    
    //update page counters
    document.getElementById('page-num').textContent = num;
    document.getElementById('go-to-number').placeholder = num;
}

function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
}

function onPrevPage() {
    if (pdfDoc === null || pageNum <= 1) {
        return;
    }
    pageNum--;
    queueRenderPage(pageNum);
}

document.getElementById('prev-page').addEventListener('click', onPrevPage);

function onNextPage() {
    if (pdfDoc === null||pageNum >= pdfDoc.numPages ) {
        return;
    }
    pageNum++;
    queueRenderPage(pageNum);
}
document.getElementById('next-page').addEventListener('click', onNextPage);

function loadInputPage() {
    let pageInputElement = document.getElementById("go-to-number");
    if (pdfDoc === null||pageNum > pdfDoc.numPages ) {
        return;
    }
    if (pageInputElement.value !== "" && Number(pageInputElement.value) <= pdfDoc.numPages) {
        pageNum = Number(pageInputElement.value);
        queueRenderPage(pageNum);
        pageInputElement.value = "";
        pageInputElement.placeholder = pageNum;
    }
}

document.getElementById('go-to-page').addEventListener('click', loadInputPage);

function resetPDF() {
    if (pdfDoc !== null) {
        pdfDoc.destroy();
        pdfDoc = null;
    }
    if (pdfPageView !== null) {
        pdfPageView.destroy();
        pdfPageView = null;
    }
    let pageDiv = document.querySelector(".page");
    if (pageDiv !== null) {
        pageDiv.remove();
    }
    if (url !== null) {
        URL.revokeObjectURL(url);
        url = null;
    }
    pageNum = 1;
    pageRendering = false;
    pageNumPending = null;
}

const fileInputElement = document.getElementById("file-selector");
fileInputElement.addEventListener("change", selectedInput);
function selectedInput(e) {
    const fileList = e.target.files;
    if (fileList.length > 0) {
        resetPDF();
        url = URL.createObjectURL(e.target.files[0]);
        pdfjsLib.getDocument(url).promise.then(function(pdfDoc_) {
            pdfDoc = pdfDoc_;
            document.getElementById('page-count').textContent = pdfDoc.numPages;
            document.getElementById('num-pages').textContent = pdfDoc.numPages;
            let scale = 1;
            eventBus.on("textlayerrendered", activateTextListeners);
            let pdfPage = pdfDoc.getPage(pageNum).then(function(page) {
                let viewport = page.getViewport({scale:OGscale});
                scale = container.clientWidth/viewport.width;
                viewport = page.getViewport({scale:scale});
                pdfPageView = new pdfjsViewer.PDFPageView({
                    container,
                    id: pageNum,
                    scale: scale,
                    defaultViewport: page.getViewport({ scale: scale }),
                    eventBus
                    });
                    
                // Associate the actual page with the view, and draw it.
                renderPage(pageNum);
            });
            document.getElementById('page-num').textContent = pageNum;
        }, function(err) {
            // show there's been an error
            const div = document.createElement('div');
            div.className = 'error';
            text = document.createTextNode(err.message);
            div.appendChild(text);
            document.querySelector('body').insertBefore(div, canvas);
        });
    }
}
