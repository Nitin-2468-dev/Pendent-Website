 "use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "./../lib/utils";

type Cell = { row: number; col: number };

type BackgroundRippleEffectProps = {
  /** Omit to calculate rows automatically from the available height. */
  rows?: number;
  cols?: number;
  cellSize?: number;
};

export const BackgroundRippleEffect = ({
  rows: fixedRows,
  cols = 27,
  cellSize = 56,
}: BackgroundRippleEffectProps) => {
  const [measuredRows, setMeasuredRows] = useState(1);
  const [clickedCell, setClickedCell] = useState<Cell | null>(null);
  const [rippleKey, setRippleKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const updateRows = () => {
      setMeasuredRows(Math.max(1, Math.ceil(element.clientHeight / cellSize)));
    };

    updateRows();
    const observer = new ResizeObserver(updateRows);
    observer.observe(element);
    return () => observer.disconnect();
  }, [cellSize]);

  const rows = fixedRows ?? measuredRows;

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute inset-0 h-full w-full overflow-hidden",
        "[--cell-border-color:var(--color-neutral-300)] [--cell-fill-color:var(--color-neutral-100)] [--cell-shadow-color:var(--color-neutral-500)]",
        "dark:[--cell-border-color:var(--color-neutral-700)] dark:[--cell-fill-color:var(--color-neutral-900)] dark:[--cell-shadow-color:var(--color-neutral-800)]",
      )}
    >
      <div className="relative h-full w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-[2] h-full w-full overflow-hidden" />
        <DivGrid
          key={`base-${rippleKey}`}
          className="mask-radial-from-20% mask-radial-at-top opacity-60"
          rows={rows}
          cols={cols}
          cellSize={cellSize}
          borderColor="var(--cell-border-color)"
          fillColor="var(--cell-fill-color)"
          clickedCell={clickedCell}
          onCellClick={(row, col) => {
            setClickedCell({ row, col });
            setRippleKey((key) => key + 1);
          }}
          interactive
        />
      </div>
    </div>
  );
};

type DivGridProps = {
  className?: string;
  rows: number;
  cols: number;
  cellSize: number;
  borderColor: string;
  fillColor: string;
  clickedCell: Cell | null;
  onCellClick?: (row: number, col: number) => void;
  interactive?: boolean;
};

type CellStyle = React.CSSProperties & {
  "--delay"?: string;
  "--duration"?: string;
};

const DivGrid = ({
  className,
  rows,
  cols,
  cellSize,
  borderColor,
  fillColor,
  clickedCell,
  onCellClick = () => {},
  interactive = true,
}: DivGridProps) => {
  const cells = useMemo(
    () => Array.from({ length: rows * cols }, (_, index) => index),
    [rows, cols],
  );

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
    gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
    width: cols * cellSize,
    height: rows * cellSize,
    marginInline: "auto",
  };

  return (
    <div className={cn("relative z-[3]", className)} style={gridStyle}>
      {cells.map((index) => {
        const rowIndex = Math.floor(index / cols);
        const colIndex = index % cols;
        const distance = clickedCell
          ? Math.hypot(clickedCell.row - rowIndex, clickedCell.col - colIndex)
          : 0;
        const delay = clickedCell ? Math.max(0, distance * 55) : 0;
        const duration = 200 + distance * 80;

        const animationStyle: CellStyle = clickedCell
          ? {
              "--delay": `${delay}ms`,
              "--duration": `${duration}ms`,
            }
          : {};

        return (
          <div
            key={index}
            className={cn(
              "cell relative border-[0.5px] opacity-40 transition-opacity duration-150 will-change-transform hover:opacity-80 dark:shadow-[0px_0px_40px_1px_var(--cell-shadow-color)_inset]",
              clickedCell && "animate-cell-ripple [animation-fill-mode:none]",
              !interactive && "pointer-events-none",
            )}
            style={{
              backgroundColor: fillColor,
              borderColor,
              ...animationStyle,
            }}
            onClick={interactive ? () => onCellClick(rowIndex, colIndex) : undefined}
          />
        );
      })}
    </div>
  );
};
