"use client";

import {
  Minus,
  Plus,
  Maximize,
  Minimize,
  RotateCcw,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CanvasControlsProps {
  zoomPercent: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomToFit: () => void;
  onZoomTo100: () => void;
}

export function CanvasControls({
  zoomPercent,
  onZoomIn,
  onZoomOut,
  onZoomToFit,
  onZoomTo100,
}: CanvasControlsProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  return (
    <TooltipProvider>
      <div
        className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-2xl border border-zinc-800 bg-zinc-950/90 p-1 shadow-[0_12px_30px_-16px_rgba(0,0,0,0.8)] backdrop-blur"
        role="group"
        aria-label="Canvas controls">
        <Tooltip>
          <TooltipTrigger asChild>
            <ControlButton
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              title={isFullscreen ? "Exit fullscreen (F)" : "Enter fullscreen (F)"}>
              {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
            </ControlButton>
          </TooltipTrigger>
          <TooltipContent>
            {isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <ControlButton
              onClick={onZoomToFit}
              aria-label="Zoom to fit"
              title="Zoom to fit">
              <RotateCcw size={15} />
            </ControlButton>
          </TooltipTrigger>
          <TooltipContent>Zoom to fit</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <ControlButton
              onClick={onZoomTo100}
              aria-label="Zoom to 100%"
              title="Zoom to 100%">
              100%
            </ControlButton>
          </TooltipTrigger>
          <TooltipContent>Zoom to 100%</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <ControlButton onClick={onZoomIn} aria-label="Zoom in" title="Zoom in">
              <Plus size={15} />
            </ControlButton>
          </TooltipTrigger>
          <TooltipContent>Zoom in</TooltipContent>
        </Tooltip>
        <span className="sr-only" aria-live="polite">
          {zoomPercent}%
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <ControlButton onClick={onZoomOut} aria-label="Zoom out" title="Zoom out">
              <Minus size={15} />
            </ControlButton>
          </TooltipTrigger>
          <TooltipContent>Zoom out</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

function ControlButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className="rounded-xl bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-200 transition-colors hover:bg-zinc-800 active:scale-95"
      {...props}>
      {children}
    </button>
  );
}
