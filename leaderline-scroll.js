/**
 * Patch for LeaderLine when used inside a scrollable container.
 *
 * Problem:
 *  By default LeaderLine calculates positions based on `getBoundingClientRect()`
 *  relative to the viewport. If nodes are inside a scrollable div, scrolling breaks alignment.
 *
 * Fix:
 *  Adjust positions with scroll offsets of the container, or use an observer to re-position on scroll.
 */

(function () {
  if (!window.LeaderLine) return;

  const origPosition = LeaderLine.prototype.position;

  LeaderLine.prototype.position = function () {
    // Get original result
    origPosition.apply(this, arguments);

    try {
      const startElem = this.start;
      const endElem = this.end;
      const scrollParent =
        findScrollParent(startElem) || findScrollParent(endElem);

      if (scrollParent) {
        const rectStart = startElem.getBoundingClientRect();
        const rectEnd = endElem.getBoundingClientRect();
        const parentRect = scrollParent.getBoundingClientRect();

        const offsetX = scrollParent.scrollLeft - parentRect.left;
        const offsetY = scrollParent.scrollTop - parentRect.top;

        this.setOptions({
          start: [
            rectStart.left + rectStart.width / 2 + offsetX,
            rectStart.top + rectStart.height / 2 + offsetY,
          ],
          end: [
            rectEnd.left + rectEnd.width / 2 + offsetX,
            rectEnd.top + rectEnd.height / 2 + offsetY,
          ],
        });
      }
    } catch (e) {
      console.error("LeaderLine scroll fix error:", e);
    }
  };

  function findScrollParent(element) {
    let parent = element.parentElement;
    while (parent) {
      const style = getComputedStyle(parent);
      if (
        /(auto|scroll)/.test(style.overflow + style.overflowY + style.overflowX)
      ) {
        return parent;
      }
      parent = parent.parentElement;
    }
    return null;
  }

  // Re-position on scroll
  document.addEventListener(
    "scroll",
    function (e) {
      if (e.target && (e.target.scrollTop || e.target.scrollLeft)) {
        LeaderLine.positionAll();
      }
    },
    true,
  );
})();
