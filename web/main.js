const { invoke } = window.__TAURI__.tauri;

let greetInputEl;
let greetMsgEl;

async function greet() {
  // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
  greetMsgEl.textContent = await invoke("greet", { name: greetInputEl.value });
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
  });

  document.querySelector("#saveBtn").addEventListener("click", (e) => {
    e.preventDefault();
    statusBar.innerText = "Save";
  });
});
