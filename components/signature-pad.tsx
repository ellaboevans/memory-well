"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Eraser, Undo2 } from "lucide-react";
import SignaturePadLib, { PointGroup } from "signature_pad";

interface SignaturePadProps {
  onSignatureChange: (dataUrl: string | null) => void;
  height?: number;
}

export function SignaturePad({
  onSignatureChange,
  height = 200,
}: Readonly<SignaturePadProps>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const signaturePadRef = useRef<SignaturePadLib | null>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [history, setHistory] = useState<PointGroup[][]>([]);

  // Initialize signature pad
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set up canvas for high DPI displays
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d")?.scale(ratio, ratio);

    // Initialize signature pad
    const signaturePad = new SignaturePadLib(canvas, {
      backgroundColor: "rgba(0, 0, 0, 0)", // Transparent
      penColor: "#ffffff", // White pen for dark theme
      minWidth: 1,
      maxWidth: 3,
      velocityFilterWeight: 0.7,
    });

    signaturePadRef.current = signaturePad;

    // Handle stroke end - save to history and notify parent
    const handleEndStroke = () => {
      setHasSignature(!signaturePad.isEmpty());

      // Save current state to history for undo
      const currentData = signaturePad.toData();
      setHistory((prev) => [
        ...prev.slice(-10),
        currentData.map((group) => ({ ...group })),
      ]);

      // Notify parent
      if (!signaturePad.isEmpty()) {
        onSignatureChange(signaturePad.toDataURL("image/png"));
      }
    };

    signaturePad.addEventListener("endStroke", handleEndStroke);

    return () => {
      signaturePad.removeEventListener("endStroke", handleEndStroke);
      signaturePad.off();
    };
  }, [onSignatureChange]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const signaturePad = signaturePadRef.current;
      if (!canvas || !signaturePad) return;

      // Save current signature data
      const data = signaturePad.toData();

      // Resize canvas
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext("2d")?.scale(ratio, ratio);

      // Restore signature
      signaturePad.clear();
      if (data.length > 0) {
        signaturePad.fromData(data);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Clear canvas
  const clearCanvas = useCallback(() => {
    const signaturePad = signaturePadRef.current;
    if (!signaturePad) return;

    signaturePad.clear();
    setHasSignature(false);
    setHistory([]);
    onSignatureChange(null);
  }, [onSignatureChange]);

  // Undo last stroke
  const undo = useCallback(() => {
    const signaturePad = signaturePadRef.current;
    if (!signaturePad || history.length <= 1) return;

    // Get previous state (one before current)
    const previousState = history.at(-2);

    // Clear and restore previous state
    signaturePad.clear();
    if (previousState && previousState.length > 0) {
      signaturePad.fromData(previousState);
      onSignatureChange(signaturePad.toDataURL("image/png"));
    } else {
      setHasSignature(false);
      onSignatureChange(null);
    }

    // Remove last history entry
    setHistory((prev) => prev.slice(0, -1));
    setHasSignature(!signaturePad.isEmpty());
  }, [history, onSignatureChange]);

  return (
    <div className="space-y-2 w-full">
      <div ref={containerRef} className="relative w-full">
        <canvas
          ref={canvasRef}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 touch-none cursor-crosshair"
          style={{ height }}
        />
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-zinc-500 text-sm">
              Draw your signature here
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={undo}
          disabled={history.length <= 1}
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
          <Undo2 className="h-4 w-4 mr-1" />
          Undo
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearCanvas}
          disabled={!hasSignature}
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
          <Eraser className="h-4 w-4 mr-1" />
          Clear
        </Button>
      </div>
    </div>
  );
}
