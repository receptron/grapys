import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { getClientPos } from "../utils/utils/gui";

type ContextMenuHandle = {
  openMenu: (event: MouseEvent | TouchEvent, rect: DOMRect) => void;
  closeMenu: () => void;
};

type ContextMenuProps = {
  children: React.ReactNode;
};

const ContextMenu = forwardRef<ContextMenuHandle, ContextMenuProps>(({ children }, ref) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuStyle, setMenuStyle] = useState({ top: "0px", left: "0px" });
  const menuRef = useRef(null);

  useImperativeHandle(ref, () => ({
    openMenu: (event: MouseEvent | TouchEvent, rect: DOMRect) => {
      event.preventDefault();
      const { clientX, clientY } = getClientPos(event);
      setMenuStyle({
        top: `${clientY - rect.top}px`,
        left: `${clientX - rect.left}px`,
      });
      setMenuVisible(true);
    },
    closeMenu: () => {
      setMenuVisible(false);
    },
  }));

  return (
    <>
      {menuVisible && (
        <ul ref={menuRef} style={menuStyle} className="absolute w-40 rounded-md border border-gray-300 bg-white py-2 shadow-md">
          {children}
        </ul>
      )}
    </>
  );
});

export default ContextMenu;
