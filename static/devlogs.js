// A routine designed to allow for the gradual unveiling of older devlogs, using a "show more" button.
document.addEventListener("DOMContentLoaded", () => {
  const devlogs = document.querySelectorAll("#devlogs-container .content");
  const button = document.getElementById("show-more-button");

  let visibleCount = 2; // Initially only the first two devlogs shall be visible

  // hiding every other devlog
  devlogs.forEach((devlog, index) => {
    if (index >= visibleCount) {
      devlog.style.display = "none";
    }
  });

  // Now the button (select only the develogs that aren't yet shown)
  button.addEventListener("click", () => {
    const hiddenDevlogs = Array.from(devlogs).filter(
      (devlog) => devlog.style.display === "none"
    ); 

    if (hiddenDevlogs.length > 0) {
      // Showing the next hidden devlog
      hiddenDevlogs[0].style.display = "block";

      // scrolling effect  
      hiddenDevlogs[0].scrollIntoView({ behavior: "smooth" });

      // when last devlog is shown, the button vanishes.
      if (hiddenDevlogs.length === 1) {
        button.style.display = "none";
      }
    }
  });
});