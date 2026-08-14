// Camera carousel animation for Raath SecureTech website
// This script cycles through .cam-feed elements, showing each for a few seconds.
// It defines a global initCarousel() function that is called from app.js after initialization.

(function () {
  // Ensure the DOM is ready before selecting elements
  function initCarousel() {
    var feeds = document.querySelectorAll('.cam-feed');
    if (!feeds.length) return;
    var current = 0;
    // Helper to update active class
    function updateActive() {
      feeds.forEach(function (el, idx) {
        if (idx === current) {
          el.classList.add('active');
        } else {
          el.classList.remove('active');
        }
      });
    }
    // Initial display
    updateActive();
    // Cycle every 3.5 seconds (adjustable)
    setInterval(function () {
      current = (current + 1) % feeds.length;
      updateActive();
    }, 3500);
  }
  // Expose globally for app.js to call
  window.initCarousel = initCarousel;
})();
