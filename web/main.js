const {invoke} = window.__TAURI__.tauri;

let config = {
    tabSize: 2
};

async function build() {
    let input = document.querySelector("#sourceInput").value || "";

    try {
        let info = await invoke("build", {name: "default", input: input});
        console.log(info);
    }catch (e) {
        console.log(e);
    }
}

function query_document() {
    let obj = {};

    for (let name of [
        "statusBar",
        "openBtn",
        "newBtn",
        "buildBtn",
        "saveBtn",
        "sourceInput",
        "lexBtn",
        "parseBtn",
        "buildOutputBtn",
        "lexerTokensContainer",
        "parserResultContainer",
        "buildOutputContainer",
    ]) {
        Object.defineProperty(obj, name, {
            value: document.querySelector(`#${name}`)
        });
    }

    return obj;
}

window.addEventListener("DOMContentLoaded", () => {
    let elements = query_document();

    let statusBar = elements.statusBar;

    elements.openBtn.addEventListener("click", (e) => {
        e.preventDefault();
        statusBar.innerText = "Open";
    });

    elements.newBtn.addEventListener("click", (e) => {
        e.preventDefault();
        statusBar.innerText = "New";
    });

    elements.buildBtn.addEventListener("click", (e) => {
        e.preventDefault();
        statusBar.innerText = "Build";
        build();
    });

    elements.saveBtn.addEventListener("click", (e) => {
        e.preventDefault();
        statusBar.innerText = "Save";
    });

    elements.sourceInput.addEventListener("keydown", function(e) {
        if (e.key === "Tab") {
            e.preventDefault();
            let start = this.selectionStart;
            let end = this.selectionEnd;

            // set textarea value to: text before caret + tab + text after caret
            this.value = this.value.substring(0, start) +
                " ".repeat(config.tabSize) + this.value.substring(end);

            // put caret at right position again
            this.selectionStart =
                this.selectionEnd = start + config.tabSize;
        }
    });

    elements.lexBtn.addEventListener("click", (e) => {
        elements.lexerTokensContainer.style.display = "flex";
        elements.parserResultContainer.style.display = "none";
        elements.buildOutputContainer.style.display = "none";
    });

    elements.parseBtn.addEventListener("click", (e) => {
        elements.lexerTokensContainer.style.display = "none";
        elements.parserResultContainer.style.display = "flex";
        elements.buildOutputContainer.style.display = "none";
    });

    elements.buildOutputBtn.addEventListener("click", (e) => {
        elements.lexerTokensContainer.style.display = "none";
        elements.parserResultContainer.style.display = "none";
        elements.buildOutputContainer.style.display = "flex";
    });

    elements.parserResultContainer.style.display = "none";
    elements.buildOutputContainer.style.display = "none";
});
