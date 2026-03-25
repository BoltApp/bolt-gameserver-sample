import { useState, useEffect, useRef, useLayoutEffect } from "preact/hooks";
import classNames from "classnames";
import styles from "./Tabs.module.css";

export interface TabItem {
  label: string;
  value: string;
  content?: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string | null) => void;
  className?: string;
  center?: boolean;
}

export function Tabs({
  items,
  defaultValue,
  value: controlledValue,
  onValueChange,
  className,
  center,
}: TabsProps) {
  // State management: support both controlled and uncontrolled
  const [internalValue, setInternalValue] = useState<string>(
    defaultValue || items[0]?.value || "",
  );
  const isControlled = controlledValue !== undefined;
  const activeValue = isControlled ? controlledValue : internalValue;

  // Refs for tab buttons and indicator
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const indicatorRef = useRef<HTMLDivElement>(null);

  // Update internal state when controlled value changes
  useEffect(() => {
    if (isControlled && controlledValue) {
      setInternalValue(controlledValue);
    }
  }, [isControlled, controlledValue]);

  // Update indicator position and width
  const updateIndicator = () => {
    const activeIndex = items.findIndex((item) => item.value === activeValue);
    const activeTab = tabRefs.current[activeIndex];
    const indicator = indicatorRef.current;

    if (activeTab && indicator) {
      const { offsetLeft, offsetWidth } = activeTab;
      indicator.style.setProperty("--active-tab-left", `${offsetLeft}px`);
      indicator.style.setProperty("--active-tab-width", `${offsetWidth}px`);
    }
  };

  // Update indicator on mount and when active value changes
  useLayoutEffect(() => {
    updateIndicator();
  }, [activeValue, items]);

  // Update indicator on window resize
  useEffect(() => {
    const handleResize = () => {
      updateIndicator();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeValue]);

  // Handle tab selection
  const handleTabClick = (value: string) => {
    if (!isControlled) {
      setInternalValue(value);
    }
    onValueChange?.(value);
  };

  // Keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = items.findIndex((item) => item.value === activeValue);
    let newIndex = currentIndex;

    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        break;
      case "ArrowRight":
        event.preventDefault();
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        break;
      case "Home":
        event.preventDefault();
        newIndex = 0;
        break;
      case "End":
        event.preventDefault();
        newIndex = items.length - 1;
        break;
      default:
        return;
    }

    const newValue = items[newIndex]?.value;
    if (newValue) {
      handleTabClick(newValue);
      tabRefs.current[newIndex]?.focus();
    }
  };

  return (
    <div className={classNames(styles.root, className)}>
      <div
        className={classNames(styles.tabList, center && styles.centered)}
        role="tablist"
        onKeyDown={handleKeyDown}>
        {items.map((item, index) => {
          const isSelected = item.value === activeValue;
          const tabId = `tab-${item.value}`;
          const panelId = `panel-${item.value}`;

          return (
            <button
              key={item.value}
              ref={(el) => (tabRefs.current[index] = el)}
              id={tabId}
              role="tab"
              aria-selected={isSelected}
              aria-controls={panelId}
              tabIndex={isSelected ? 0 : -1}
              className={styles.tab}
              onClick={() => handleTabClick(item.value)}>
              {item.label}
            </button>
          );
        })}
        <div ref={indicatorRef} className={styles.indicator} />
      </div>

      <div className={styles.panelContainer}>
        {items.map((item) => {
          const isActive = item.value === activeValue;
          const tabId = `tab-${item.value}`;
          const panelId = `panel-${item.value}`;

          return (
            <div
              key={item.value}
              id={panelId}
              role="tabpanel"
              aria-labelledby={tabId}
              hidden={!isActive}
              className={styles.tabPanel}>
              {isActive && item.content}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Tabs;
