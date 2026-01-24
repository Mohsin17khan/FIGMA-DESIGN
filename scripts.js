function FramerDesign() {
  const frames = document.querySelector("#frames");
  const frameArrow = document.querySelector("#frame-arrow");

  const shape = document.querySelector("#shapes");
  const shapeArrow = document.querySelector("#shapes-arrow");

  frameArrow.addEventListener("click", function () {
    frames.style.display = "block";
    shape.style.display = "none";
  });

  shapeArrow.addEventListener("click", function () {
    shape.style.display = "block";
    frames.style.display = "none";
  });

  const board = document.querySelector("#main");
  const rectTool = document.querySelector("#rectool");
  const circleTool = document.getElementById("circle");
  const frame = document.querySelector("#frame-art");
  const section = document.querySelector("#frame-section");
  const text = document.querySelector("#text");
  const comment = document.querySelector("#comment");
  const pencilTool = document.getElementById("pencil-drawing");

  const rotate = document.querySelector("#rotate");
  const rotateValue = document.querySelector("#rotate-value");

  const xValue = document.querySelector("#x-value");
  const yValue = document.querySelector("#y-value");

  const width = document.querySelector("#width");
  const height = document.querySelector("#height");
  const opacity = document.querySelector("#opacity");
  const allLayers = document.querySelector("#layers");

  let isRectToolActive = false;
  let isCircleToolActive = false;
  let isDrawing = false;
  let startX, startY;
  let currentRect;
  let rectangles = [];

  let isPencilActive = false;
  let isPencilDrawing = false;
  let currentPath = null;

  let undoStack = [];
  let redoStack = [];
  let selectedElement = null;

  rectTool.addEventListener("click", () => {
    isRectToolActive = true;
    isCircleToolActive = false;
    isPencilActive = false;
    board.style.cursor = "crosshair";
    shape.style.display = "none";
  });

  circleTool.addEventListener("click", () => {
    isCircleToolActive = true;
    isRectToolActive = false;
    isPencilActive = false;
    board.style.cursor = "crosshair";
    shape.style.display = "none";
  });

  board.addEventListener("mousedown", (e) => {
    if (!isRectToolActive && !isCircleToolActive) return;

    isDrawing = true;
    startX = e.offsetX;
    startY = e.offsetY;

    currentRect = document.createElement("div");
    currentRect.style.position = "absolute";
    currentRect.style.left = startX + "px";
    currentRect.style.top = startY + "px";
    currentRect.style.border = "2px solid white";
    currentRect.style.background = "transparent";

    if (isCircleToolActive) currentRect.style.borderRadius = "50%";

    board.appendChild(currentRect);
  });

  board.addEventListener("mousemove", (e) => {
    if (!isDrawing) return;

    const w = e.offsetX - startX;
    const h = e.offsetY - startY;

    currentRect.style.width = Math.abs(w) + "px";
    currentRect.style.height = Math.abs(h) + "px";
    currentRect.style.left = (w < 0 ? e.offsetX : startX) + "px";
    currentRect.style.top = (h < 0 ? e.offsetY : startY) + "px";
  });

  board.addEventListener("mouseup", () => {
    if (!isDrawing) return;

    isDrawing = false;
    isRectToolActive = false;
    isCircleToolActive = false;
    board.style.cursor = "default";

    rectangles.push(currentRect);
    undoStack.push(currentRect);
    redoStack = [];

    makeDraggable(currentRect);
    makeResizable(currentRect);
    makeSelectable(currentRect);
  });

  frame.addEventListener("click", () => {
    const div = document.createElement("div");
    div.style.width = "200px";
    div.style.height = "200px";
    div.style.position = "absolute";
    div.style.left = "100px";
    div.style.top = "100px";
    div.style.background = "white";
    div.style.border = "1px solid gray";

    board.appendChild(div);
    rectangles.push(div);
    undoStack.push(div);
    redoStack = [];

    makeDraggable(div);
    makeResizable(div);
    makeSelectable(div);
    frames.style.display = "none";
  });

  section.addEventListener("click", () => {
    const div = document.createElement("div");
    div.style.width = "400px";
    div.style.height = "400px";
    div.style.position = "absolute";
    div.style.left = "50px";
    div.style.top = "50px";
    div.style.border = "1px solid gray";

    board.appendChild(div);
    rectangles.push(div);
    undoStack.push(div);
    redoStack = [];

    makeDraggable(div);
    makeResizable(div);
    makeSelectable(div);
    frames.style.display = "none";
  });

  function createText(top, text) {
    const t = document.createElement("textarea");
    t.style.width = "130px";
    t.style.height = "30px";
    t.style.position = "absolute";
    t.style.left = "70%";
    t.style.top = top;
    t.style.border = "2px solid white";
    t.style.background = "transparent";
    t.style.color = "white";
    t.style.resize = "none";
    t.placeholder = text;

    board.appendChild(t);
    rectangles.push(t);
    undoStack.push(t);
    redoStack = [];

    makeDraggable(t);
    makeSelectable(t);
  }

  text.addEventListener("click", () => createText("10%", "Enter Text"));
  comment.addEventListener("click", () => createText("50%", "Enter Comment"));

  pencilTool.addEventListener("click", () => {
    isPencilActive = true;
    isRectToolActive = false;
    isCircleToolActive = false;
    board.style.cursor = "crosshair";
  });

  board.addEventListener("mousedown", (e) => {
    if (!isPencilActive) return;

    isPencilDrawing = true;
    currentPath = document.createElement("div");
    currentPath.className = "pencil-path";
    currentPath.style.position = "absolute";
    currentPath.style.width = "100%";
    currentPath.style.height = "100%";
    currentPath.style.pointerEvents = "none";

    board.appendChild(currentPath);
    rectangles.push(currentPath);
    undoStack.push(currentPath);
    redoStack = [];

    drawPoint(e);
  });

  board.addEventListener("mousemove", (e) => {
    if (isPencilDrawing) drawPoint(e);
  });

  board.addEventListener("mouseup", () => {
    isPencilDrawing = false;
    isPencilActive = false;
    board.style.cursor = "default";
  });

  function drawPoint(e) {
    const d = document.createElement("div");
    d.style.width = "4px";
    d.style.height = "4px";
    d.style.background = "white";
    d.style.borderRadius = "50%";
    d.style.position = "absolute";
    d.style.left = e.offsetX + "px";
    d.style.top = e.offsetY + "px";
    currentPath.appendChild(d);
  }

  function makeSelectable(el) {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      selectedElement = el;
      rectangles.forEach((r) => (r.style.borderColor = "white"));
      el.style.borderColor = "blue";
    });
  }

  function makeDraggable(el) {
    let drag = false,
      sx,
      sy,
      ex,
      ey;
    el.addEventListener("mousedown", (e) => {
      drag = true;
      sx = e.clientX;
      sy = e.clientY;
      ex = parseInt(el.style.left) || 0;
      ey = parseInt(el.style.top) || 0;
      e.stopPropagation();
    });
    document.addEventListener("mousemove", (e) => {
      if (!drag) return;
      el.style.left = ex + (e.clientX - sx) + "px";
      el.style.top = ey + (e.clientY - sy) + "px";
    });
    document.addEventListener("mouseup", () => (drag = false));
  }

  function makeResizable(el) {
    const h = document.createElement("div");
    h.style.width = "10px";
    h.style.height = "10px";
    h.style.background = "blue";
    h.style.position = "absolute";
    h.style.right = "-5px";
    h.style.bottom = "-5px";
    h.style.cursor = "se-resize";
    el.appendChild(h);

    let rs = false,
      sx,
      sy,
      sw,
      sh;
    h.addEventListener("mousedown", (e) => {
      rs = true;
      sx = e.clientX;
      sy = e.clientY;
      sw = parseInt(el.style.width) || 100;
      sh = parseInt(el.style.height) || 100;
      e.stopPropagation();
    });
    document.addEventListener("mousemove", (e) => {
      if (!rs) return;
      el.style.width = sw + (e.clientX - sx) + "px";
      el.style.height = sh + (e.clientY - sy) + "px";
    });
    document.addEventListener("mouseup", () => (rs = false));
  }

  function undo() {
    if (!undoStack.length) return;
    const el = undoStack.pop();
    board.contains(el) && board.removeChild(el);
    redoStack.push(el);
  }

  function redo() {
    if (!redoStack.length) return;
    const el = redoStack.pop();
    board.appendChild(el);
    undoStack.push(el);
  }

  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "z") undo();
    if (e.ctrlKey && e.key === "y") redo();
    if (e.key === "Delete" && selectedElement) {
      board.removeChild(selectedElement);
      undoStack.push(selectedElement);
      selectedElement = null;
    }
  });

  // number nikal na
  function num(v) {
    return parseFloat(v) || 0;
  }

  // jab element select ho  values panel me bharo
  function syncPanel(el) {
    xValue.value = parseInt(el.style.left) || 0;
    yValue.value = parseInt(el.style.top) || 0;
    width.value = parseInt(el.style.width) || 0;
    height.value = parseInt(el.style.height) || 0;

    // opacity (0–1 %)
    const op = el.style.opacity ? el.style.opacity * 100 : 100;
    opacity.value = op + "%";

    // rotation
    const rot = el.dataset.rotate || 0;
    rotate.value = rot;
    rotateValue.innerHTML = rot + "°";
    syncColor(el);
  }

  // select override only extend
  const oldMakeSelectable = makeSelectable;
  makeSelectable = function (el) {
    oldMakeSelectable(el);
    el.addEventListener("click", () => {
      syncPanel(el);
    });
  };

  // rotation
  rotateValue.addEventListener("click", function () {
    if (!selectedElement) return;

    const deg = num(rotate.value);
    selectedElement.dataset.rotate = deg;

    selectedElement.style.transform = `rotate(${deg}deg)`;

    rotateValue.innerHTML = deg + "°";
  });

  // position X
  xValue.addEventListener("input", () => {
    if (!selectedElement) return;
    selectedElement.style.left = num(xValue.value) + "px";
  });

  // position Y
  yValue.addEventListener("input", () => {
    if (!selectedElement) return;
    selectedElement.style.top = num(yValue.value) + "px";
  });

  // width
  width.addEventListener("input", () => {
    if (!selectedElement) return;
    selectedElement.style.width = num(width.value) + "px";
  });

  // height
  height.addEventListener("input", () => {
    if (!selectedElement) return;
    selectedElement.style.height = num(height.value) + "px";
  });

  // opacity
  opacity.addEventListener("input", () => {
    if (!selectedElement) return;

    let v = opacity.value.toString().replace("%", "");
    v = Math.min(100, Math.max(0, num(v)));

    selectedElement.style.opacity = v / 100;
    opacity.value = v + "%";
  });

  let layerCount = 0;

  // layer name generate
  function getLayerName(el) {
    if (el.tagName === "TEXTAREA") return "Text";
    if (el.style.borderRadius === "50%") return "Circle";
    if (el.style.background === "white") return "Frame";
    return "Rectangle";
  }

  // layer add
  function addLayer(el) {
    layerCount++;

    const layer = document.createElement("div");
    layer.className = "layer";
    layer.innerText = layerCount + ". " + getLayerName(el);

    layer.dataset.id = layerCount;
    el.dataset.layerId = layerCount;

    allLayers.appendChild(layer);

    // click karne pr layer  select
    layer.addEventListener("click", () => {
      rectangles.forEach((r) => (r.style.borderColor = "white"));

      selectedElement = el;
      el.style.borderColor = "blue";
      syncPanel(el);

      // active layer style
      document
        .querySelectorAll(".layer")
        .forEach((l) => l.classList.remove("active"));
      layer.classList.add("active");
    });
  }

  // border  jb element select ho
  function syncLayerSelection(el) {
    document
      .querySelectorAll(".layer")
      .forEach((l) => l.classList.remove("active"));
    const layer = [...allLayers.children].find(
      (l) => l.dataset.id == el.dataset.layerId,
    );
    if (layer) layer.classList.add("active");
  }

  const oldMakeSelectable2 = makeSelectable;
  makeSelectable = function (el) {
    oldMakeSelectable2(el);

    el.addEventListener("click", () => {
      syncLayerSelection(el);
    });
  };

  // rectangle / circle
  const oldMouseUp = board.onmouseup;
  board.addEventListener("mouseup", () => {
    if (currentRect) {
      addLayer(currentRect);
      currentRect = null;
    }
  });

  // frame
  frame.addEventListener("click", () => {
    const el = rectangles[rectangles.length - 1];
    addLayer(el);
  });

  // section
  section.addEventListener("click", () => {
    const el = rectangles[rectangles.length - 1];
    addLayer(el);
  });

  // text / comment
  const oldCreateText = createText;
  createText = function (top, text) {
    oldCreateText(top, text);
    const el = rectangles[rectangles.length - 1];
    addLayer(el);
  };

  // move karna arrow key s
  document.addEventListener("keydown", (e) => {
    if (!selectedElement) return;

    const count = 5;

    switch (e.key) {
      case "ArrowUp":
        selectedElement.style.top =
          (parseInt(selectedElement.style.top) || 0) - count + "px";
        yValue.value = parseInt(selectedElement.style.top) || 0;
        break;

      case "ArrowDown":
        selectedElement.style.top =
          (parseInt(selectedElement.style.top) || 0) + count + "px";
        yValue.value = parseInt(selectedElement.style.top) || 0;
        break;

      case "ArrowLeft":
        selectedElement.style.left =
          (parseInt(selectedElement.style.left) || 0) - count + "px";
        xValue.value = parseInt(selectedElement.style.left) || 0;
        break;

      case "ArrowRight":
        selectedElement.style.left =
          (parseInt(selectedElement.style.left) || 0) + count + "px";
        xValue.value = parseInt(selectedElement.style.left) || 0;
        break;
    }
  });

  // color features
  const colorInput = document.querySelector("#colorInput");

  colorInput.addEventListener("input", () => {
    if (selectedElement) {
      // textarea par background change na ho
      if (selectedElement.tagName === "TEXTAREA") return;

      // selected shape ka color change
      selectedElement.style.background = colorInput.value;
    } else {
      // agar koi shape select nahi hai, board ka background change
      board.style.background = colorInput.value;
    }
  });

  function syncColor(el) {
    if (el.tagName === "TEXTAREA") return;
    colorInput.value = rgbToHex(getComputedStyle(el).backgroundColor);
  }

  function rgbToHex(rgb) {
    const rgbValues = rgb.match(/\d+/g);
    if (!rgbValues) return "#ffffff";
    const hex = rgbValues
      .slice(0, 3)
      .map((x) => parseInt(x).toString(16).padStart(2, "0"))
      .join("");
    return "#" + hex;
  }

  const saveBtn = document.querySelector("#save");
  const clearBtn = document.querySelector("#clear");

  // save fn
  function saveAll() {
    const data = rectangles.map((el) => {
      return {
        type: el.classList.contains("pencil-path")
          ? "pencil"
          : el.tagName === "TEXTAREA"
            ? "text"
            : el.style.borderRadius === "50%"
              ? "circle"
              : el.style.background === "white"
                ? "frame"
                : el.style.border
                  ? "rectangle"
                  : "section",

        x: el.classList.contains("pencil-path")
          ? 0
          : parseInt(el.style.left) || 0,
        y: el.classList.contains("pencil-path")
          ? 0
          : parseInt(el.style.top) || 0,
        w: el.classList.contains("pencil-path")
          ? board.offsetWidth
          : parseInt(el.style.width) || 0,
        h: el.classList.contains("pencil-path")
          ? board.offsetHeight
          : parseInt(el.style.height) || 0,

        bg: getComputedStyle(el).backgroundColor,
        border: getComputedStyle(el).border,
        opacity: parseFloat(el.style.opacity) || 1,
        rotate: parseFloat(el.dataset.rotate) || 0,
        text: el.tagName === "TEXTAREA" ? el.value : "",
        html: el.classList.contains("pencil-path") ? el.innerHTML : "",
      };
    });

    localStorage.setItem("boardData", JSON.stringify(data));
    alert("Saved successfully");
  }

  saveBtn.addEventListener("click", saveAll);

  //for load function
  function loadAll() {
    const data = JSON.parse(localStorage.getItem("boardData") || "[]");
    if (!data.length) return;

    clearAll(false);  

    data.forEach((item) => {
      let el;

      if (item.type === "pencil") {
        el = document.createElement("div");
        el.className = "pencil-path";
        el.style.position = "absolute";
        el.style.width = "100%";
        el.style.height = "100%";
        el.style.pointerEvents = "none";
        el.innerHTML = item.html;
      } else if (item.type === "text") {
        el = document.createElement("textarea");
        el.value = item.text;
        el.style.background = "transparent";
        el.style.color = "white";
        el.style.resize = "none";
        el.style.border = "2px solid white";
      } else {
        el = document.createElement("div");
        el.style.border = item.border || "2px solid white";
        el.style.background = item.bg;
        if (item.type === "circle") el.style.borderRadius = "50%";
      }

      el.style.position = "absolute";
      el.style.left = item.x + "px";
      el.style.top = item.y + "px";
      el.style.width = item.w + "px";
      el.style.height = item.h + "px";
      el.style.opacity = item.opacity;
      el.dataset.rotate = item.rotate;
      el.style.transform = `rotate(${item.rotate}deg)`;

      board.appendChild(el);
      rectangles.push(el);

    if (item.type !== "pencil") {
  makeDraggable(el);
  makeResizable(el);
  makeSelectable(el);
  addLayer(el);
}
    });
  }

  window.addEventListener("load", loadAll);

  function clearAll(removeStorage = true) {
    rectangles.forEach((el) => {
      if (board.contains(el)) board.removeChild(el);
    });
    rectangles = [];
    allLayers.innerHTML = "";
    selectedElement = null;

    if (removeStorage) localStorage.removeItem("boardData");
  }

  clearBtn.addEventListener("click", () => clearAll(true));

  const sharebtn = document.querySelector("#share");
  const downloadContainer = document.querySelector("#downloadContainer");
  const cancel = document.querySelector("#cancel");

  const downloadJSON = document.querySelector("#download-json");
  const downloadHTML = document.querySelector("#download-html");

  sharebtn.addEventListener("click", function () {
    downloadContainer.style.display = "block";
  });

  cancel.addEventListener("click", function () {
    downloadContainer.style.display = "none";
  });

  downloadJSON.addEventListener("click", () => {
    exportJSON();
  });

  downloadHTML.addEventListener("click", function () {
    exportHTML();
  });

  // for export json
  function exportJSON() {
    const data = rectangles.map((el) => ({
      type:
        el.tagName === "TEXTAREA"
          ? "text"
          : el.style.borderRadius === "50%"
            ? "circle"
            : el.style.background === "white"
              ? "frame"
              : el.style.border
                ? "rectangle"
                : "section",

      x: parseInt(el.style.left) || 0,
      y: parseInt(el.style.top) || 0,
      w: parseInt(el.style.width) || 0,
      h: parseInt(el.style.height) || 0,
      bg: getComputedStyle(el).backgroundColor,
      border: getComputedStyle(el).border,
      opacity: el.style.opacity || 1,
      rotate: el.dataset.rotate || 0,
      text: el.tagName === "TEXTAREA" ? el.value : "",
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    triggerDownload(blob, "design.json");
  }

  // for html export
  function exportHTML() {
    let html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Exported Design</title>
</head>
<body style="
  margin:0;
  position:relative;
  width:${board.offsetWidth}px;
  height:${board.offsetHeight}px;
  background:${getComputedStyle(board).backgroundColor};
">
`;

    rectangles.forEach((el) => {
      const style = `
      position:absolute;
      left:${el.style.left};
      top:${el.style.top};
      width:${el.style.width};
      height:${el.style.height};
      background:${getComputedStyle(el).backgroundColor};
      border:${getComputedStyle(el).border};
      opacity:${el.style.opacity || 1};
      transform:rotate(${el.dataset.rotate || 0}deg);
      border-radius:${el.style.borderRadius || "0"};
    `;

      if (el.tagName === "TEXTAREA") {
        html += `
<textarea style="${style}">
${el.value}
</textarea>
`;
      } else {
        html += `<div style="${style}"></div>\n`;
      }
    });

    html += `
</body>
</html>
`;

    const blob = new Blob([html], { type: "text/html" });
    triggerDownload(blob, "design.html");
  }

  function triggerDownload(blob, filename) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }
}

FramerDesign();



