
  const cancelBtn = document.querySelector("#cancel");
  
  cancelBtn.addEventListener("mouseenter", function (e) {
    moveRandomEl(e.target);
  });

function moveRandomEl(elm) {
    elm.style.position = "absolute";
    elm.style.top = Math.floor(Math.random() * 90 + 5) + "%";
    elm.style.left = Math.floor(Math.random() * 90 + 5) + "%";
  }
  

