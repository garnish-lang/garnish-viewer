const {invoke} = window.__TAURI__.tauri;

let config = {
    tabSize: 2
};

async function build() {
    let input = document.querySelector("#sourceInput").value || "";

    try {
        return await invoke("build", {name: "default", input: input});
    }catch (e) {
        console.log(e);
        return null;
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
        "lexerTokenList",
        "lexerTokenTemplate",
    ]) {
        Object.defineProperty(obj, name, {
            value: document.querySelector(`#${name}`)
        });
    }

    return obj;
}

window.addEventListener("DOMContentLoaded", () => {
    let elements = query_document();
    console.log(elements);

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
        build().then((info) => {
            console.log(elements.lexerTokenList.childNodes);

            while (elements.lexerTokenList.firstElementChild) {
                elements.lexerTokenList.removeChild(elements.lexerTokenList.firstElementChild);
            }

            for (let token of info.all_lexer_tokens) {
                let item = elements.lexerTokenTemplate.content.cloneNode(true);
                item.firstElementChild.setAttribute("title", token.token_type);

                if (token.token_type === "Whitespace" || token.token_type === "Subexpression") {
                    let s = [];
                    for (let c of token.text) {
                        if (c === " ") {
                            s.push("&#x23B5");
                        } else if (c === "\n") {
                            s.push("&crarr;");
                        }
                    }
                    item.firstElementChild.innerHTML = s.join("");
                } else {
                    item.firstElementChild.textContent = token.text;
                }

                elements.lexerTokenList.appendChild(item);
            }
        });
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
