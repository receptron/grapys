import { Ref } from "vue";
import { NewEdgeData } from "../utils/type";

export const usePanAndScroll = (mainContainer: Ref<HTMLElement | undefined>, isNodeDragging: Ref<boolean>, newEdgeData?: Ref<NewEdgeData | null>) => {
  const setupPanAndScroll = () => {
    const container = mainContainer.value;
    if (!container) return;

    let isPanning = false;
    let startX = 0;
    let startY = 0;
    let scrollLeftStart = 0;
    let scrollTopStart = 0;

    // 共通のパン開始処理
    const startPanning = (clientX: number, clientY: number, target: Element, event: Event) => {
      // ノードがドラッグ中の場合はパン操作を無効にする
      if (isNodeDragging.value) {
        return false;
      }

      // エッジ作成中の場合はパン操作を無効にする
      if (newEdgeData?.value) {
        return false;
      }

      // ノードやエッジ以外の場所でのみパンを開始
      const isClickableElement =
        target.closest(".node") ||
        target.closest(".edge") ||
        target.tagName === "BUTTON" ||
        target.tagName === "INPUT" ||
        target.tagName === "SELECT" ||
        target.tagName === "TEXTAREA";

      // フォーカスされているtextareaがある場合はblurさせる
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

    // 共通のパン移動処理
    const updatePanning = (clientX: number, clientY: number, event: Event) => {
      if (!isPanning) return;

      const deltaX = clientX - startX;
      const deltaY = clientY - startY;

      container.scrollLeft = scrollLeftStart - deltaX;
      container.scrollTop = scrollTopStart - deltaY;
      event.preventDefault();
    };

    // 共通のパン終了処理
    const endPanning = () => {
      isPanning = false;
      container.style.cursor = "grab";
    };

    // マウスでのパン操作
    const handleMouseDown = (event: MouseEvent) => {
      startPanning(event.clientX, event.clientY, event.target as Element, event);
    };

    const handleMouseMove = (event: MouseEvent) => {
      updatePanning(event.clientX, event.clientY, event);
    };

    const handleMouseUp = () => {
      endPanning();
    };

    // タッチでのパン操作
    const handleTouchStart = (event: TouchEvent) => {
      startPanning(event.touches[0].clientX, event.touches[0].clientY, event.target as Element, event);
    };

    const handleTouchMove = (event: TouchEvent) => {
      updatePanning(event.touches[0].clientX, event.touches[0].clientY, event);
    };

    const handleTouchEnd = () => {
      endPanning();
    };

    // ホイールイベントでのスクロール制御
    const handleWheel = (event: WheelEvent) => {
      const target = event.target as Element;

      // フォーカスされたテキストエリア内でのスクロールの場合は、デフォルト動作を許可
      const focusedTextarea = document.activeElement as HTMLTextAreaElement;
      if (focusedTextarea && focusedTextarea.tagName === "TEXTAREA" && (target === focusedTextarea || focusedTextarea.contains(target))) {
        return; // デフォルトのスクロール動作を許可
      }

      // テキストエリア内でのスクロールの場合は、デフォルト動作を許可
      if (target.tagName === "TEXTAREA" || target.closest("textarea")) {
        return; // デフォルトのスクロール動作を許可
      }

      const { deltaX, deltaY } = event;
      const { scrollLeft, scrollTop, scrollWidth, scrollHeight, clientWidth, clientHeight } = container;

      // 水平スクロールが可能な場合のみ、デフォルト動作を防ぐ
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // 左端で左スクロール、または右端で右スクロールの場合はブラウザの動作を許可
        if ((scrollLeft <= 0 && deltaX < 0) || (scrollLeft >= scrollWidth - clientWidth && deltaX > 0)) {
          return;
        }
        event.preventDefault();
        container.scrollLeft += deltaX;
      } else {
        // 垂直スクロールが可能な場合のみ、デフォルト動作を防ぐ
        if ((scrollTop <= 0 && deltaY < 0) || (scrollTop >= scrollHeight - clientHeight && deltaY > 0)) {
          return;
        }
        event.preventDefault();
        container.scrollTop += deltaY;
      }
    };

    // イベントリスナーの追加
    container.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    container.addEventListener("touchstart", handleTouchStart, { passive: false });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd);

    container.addEventListener("wheel", handleWheel, { passive: false });

    // 初期カーソルスタイル
    container.style.cursor = "grab";

    // クリーンアップ関数を返す
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
