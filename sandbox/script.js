async function loadFiles() {
  const res = await fetch("/api/sandbox");
  const data = await res.json();

  const list = document.getElementById("file-list");
  const preview = document.getElementById("preview");

  list.innerHTML = "";
  preview.innerHTML = "<em>Select a file to preview</em>";

  data.files.forEach((file) => {
    const div = document.createElement("div");
    div.className = "file";
    div.textContent = file;
    div.onclick = () => openFile(file);
    list.appendChild(div);
  });
}

async function openFile(file) {
  const res = await fetch(`/api/sandbox/file?file=${encodeURIComponent(file)}`);
  const data = await res.json();

  const preview = document.getElementById("preview");
  preview.innerHTML = "";
  const pre = document.createElement("pre");
  pre.textContent = data.contents;
  preview.appendChild(pre);
}

function escape(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

loadFiles();

