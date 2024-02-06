const {invoke} = window.__TAURI__.tauri;

let config = {
    tabSize: 2
};

async function build() {
    let input = document.querySelector("#sourceInput").value;
    let info = await invoke("build", {name: "default", input: input});

    console.log(info);
}

window.addEventListener("DOMContentLoaded", () => {
    let statusBar = document.querySelector("#statusBar");

    document.querySelector("#openBtn").addEventListener("click", (e) => {
        e.preventDefault();
        statusBar.innerText = "Open";
    });

    document.querySelector("#newBtn").addEventListener("click", (e) => {
        e.preventDefault();
        statusBar.innerText = "New";
    });

    document.querySelector("#buildBtn").addEventListener("click", (e) => {
        e.preventDefault();
        statusBar.innerText = "Build";
        build();
    });

    document.querySelector("#saveBtn").addEventListener("click", (e) => {
        e.preventDefault();
        statusBar.innerText = "Save";
    });

    document.querySelector("#sourceInput").addEventListener("keydown", function(e) {
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
    })
});
