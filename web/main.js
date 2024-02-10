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
        "parseTreeViewTemplate",
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
            console.log(info);

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

            while (elements.parserResultContainer.firstElementChild) {
                let id = elements.parserResultContainer.firstElementChild
                    .querySelector(".graph_container").getAttribute("id");

                zingchart.exec(id, "destroy");

                elements.parserResultContainer.removeChild(elements.parserResultContainer.firstElementChild);
            }

            for (const build of info.context.build_metadata) {
                let nodes = [];

                for (const [i, n] of build.parse_result.nodes.entries()) {
                    nodes.push({
                        id: i.toString(),
                        name: n.definition,
                        parent: n.parent ? n.parent.toString() : "",
                    })
                }

                let newNode = elements.parseTreeViewTemplate.content.cloneNode(true);
                let id = `${build.name}_parseTreeView`;
                newNode.querySelector(".graph_container").setAttribute("id", id);

                newNode.querySelector(".parse_name").textContent = build.name;

                elements.parserResultContainer.appendChild(newNode);

                zingchart.render({
                    id: id,
                    width: '100%',
                    height: '100%',
                    data: makeChartConfig(nodes)
                });
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
        elements.lexerTokensContainer.style.display = "block";
        elements.parserResultContainer.style.display = "none";
        elements.buildOutputContainer.style.display = "none";
    });

    elements.parseBtn.addEventListener("click", (e) => {
        elements.lexerTokensContainer.style.display = "none";
        elements.parserResultContainer.style.display = "block";
        elements.buildOutputContainer.style.display = "none";
    });

    elements.buildOutputBtn.addEventListener("click", (e) => {
        elements.lexerTokensContainer.style.display = "none";
        elements.parserResultContainer.style.display = "none";
        elements.buildOutputContainer.style.display = "block";
    });

    elements.parserResultContainer.style.display = "none";
    elements.buildOutputContainer.style.display = "none";
});


function makeChartConfig(series) {
    return {
        type: 'tree',
        backgroundColor: '#2b2d30',
        options: {
            aspect: 'tree-down',
            orgChart: true,
            packingFactor: 1,
            node: {
                height: '65px',
                label: {
                    color: '#fff',
                    fontSize: '16px'
                },
                hoverState: {
                    visible: false
                },
            },
            'node[cls-rshifted]': {
                offsetX: '25px'
            },
            'node[cls-lshifted]': {
                offsetX: '-25px'
            },
            'node[cls-bblack]': {
                backgroundColor: '#000',
                width: '120px'
            },
            'node[cls-borange]': {
                backgroundColor: '#F6931D',
                width: '80px'
            },
            'node[cls-bred]': {
                backgroundColor: '#C00000',
                width: '80px'
            },
            'node[cls-blightblue]': {
                backgroundColor: '#00B9C2',
                width: '80px'
            },
            'node[cls-bblue]': {
                backgroundColor: '#00408F',
                width: '80px'
            },
            'node[cls-bgreen]': {
                backgroundColor: '#70AD47',
                width: '80px'
            }
        },
        plotarea: {
            margin: '20px 20x 20x 0'
        },
        series: series
    };
}