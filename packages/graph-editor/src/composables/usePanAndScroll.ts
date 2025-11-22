import { Ref } from "vue";
import { NewEdgeData } from "../types";

export const usePanAndScroll = (mainContainer: Ref<HTMLElement | undefined>, isNodeDragging: Ref<boolean>, newEdgeData?: Ref<NewEdgeData | null>) => {
  const setupPanAndScroll = () => {
    const container = mainContainer.value;
    if (!container) return;

    let isPanning = false;
    let startX = 0;
    let startY = 0;
    let scrollLeftStart = 0;
    let scrollTopStart = 0;

    // Start panning
    const startPanning = (clientX: number, clientY: number, target: Element, event: Event) => {
      // Disable panning when node is dragging
      if (isNodeDragging.value) {
        return false;
      }

      // Disable panning when edge is being created
      if (newEdgeData?.value) {
        return false;
      }

      // Only pan on empty canvas (not on nodes, edges, buttons, etc.)
      const isClickableElement =
        target.closest(".node") ||
        target.closest(".edge") ||
        target.tagName === "BUTTON" ||
        target.tagName === "INPUT" ||
        target.tagName === "SELECT" ||
        target.tagName === "TEXTAREA";

      // Blur focused textarea if clicking outside
      const focusedTextarea = document.activeElement as HTMLTextAreaElement;
      if (focusedTextarea && focusedTextarea.tagName === "TEXTAREA" && !isClickableElement) {
        focusedTextarea.blur();
      }

      if (!isClickableElement) {
        isPanning = true;
        startX = clientX;
        startY = clientY;
        scrollLeftStart = container.scrollLeft;
        scrollTopStart = container.scrollTop;
        container.style.cursor = "grabbing";
        event.preventDefault();
        return true;
      }
      return false;
    };

    // Update panning
    const updatePanning = (clientX: number, clientY: number, event: Event) => {
      if (!isPanning) return;

      const deltaX = clientX - startX;
      const deltaY = clientY - startY;

      container.scrollLeft = scrollLeftStart - deltaX;
      container.scrollTop = scrollTopStart - deltaY;
      event.preventDefault();
    };

    // End panning
    const endPanning = () => {
      isPanning = false;
      container.style.cursor = "grab";
    };

    // Mouse event handlers
    const handleMouseDown = (event: MouseEvent) => {
      startPanning(event.clientX, event.clientY, event.target as Element, event);
    };

    const handleMouseMove = (event: MouseEvent) => {
      updatePanning(event.clientX, event.clientY, event);
    };

    const handleMouseUp = () => {
      endPanning();
    };

    // Touch event handlers
    const handleTouchStart = (event: TouchEvent) => {
      startPanning(event.touches[0].clientX, event.touches[0].clientY, event.target as Element, event);
    };

    const handleTouchMove = (event: TouchEvent) => {
      updatePanning(event.touches[0].clientX, event.touches[0].clientY, event);
    };

    const handleTouchEnd = () => {
      endPanning();
    };

    // Wheel event handler
    const handleWheel = (event: WheelEvent) => {
      const target = event.target as Element;

      // Allow default scroll in focused textarea
      const focusedTextarea = document.activeElement as HTMLTextAreaElement;
      if (focusedTextarea && focusedTextarea.tagName === "TEXTAREA") {
        if (target === focusedTextarea || focusedTextarea.contains(target)) {
          return;
        }
      }

      // Allow default scroll in textarea
      if (target.tagName === "TEXTAREA" || target.closest("textarea")) {
        return;
      }

      const { deltaX, deltaY } = event;
      const { scrollLeft, scrollTop, scrollWidth, scrollHeight, clientWidth, clientHeight } = container;

      // Horizontal scroll
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if ((scrollLeft <= 0 && deltaX < 0) || (scrollLeft >= scrollWidth - clientWidth && deltaX > 0)) {
          return;
        }
        event.preventDefault();
        container.scrollLeft += deltaX;
      } else {
        // Vertical scroll
        if ((scrollTop <= 0 && deltaY < 0) || (scrollTop >= scrollHeight - clientHeight && deltaY > 0)) {
          return;
        }
        event.preventDefault();
        container.scrollTop += deltaY;
      }
    };

    // Add event listeners
    container.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    container.addEventListener("touchstart", handleTouchStart, { passive: false });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd);

    container.addEventListener("wheel", handleWheel, { passive: false });

    // Initial cursor style
    container.style.cursor = "grab";

    // Cleanup function
    return () => {
      container.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);

      container.removeEventListener("wheel", handleWheel);
    };
  };

  return {
    setupPanAndScroll,
  };
};
