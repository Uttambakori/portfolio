'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

interface DrawingCanvasProps {
    onSave: (imageDataUrl: string) => void;
    onClose: () => void;
}

export default function DrawingCanvas({ onSave, onClose }: DrawingCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#e5e5e0');
    const [lineWidth, setLineWidth] = useState(3);
    const [history, setHistory] = useState<ImageData[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    const colors = ['#e5e5e0', '#ff6b6b', '#4ecdc4', '#ffe66d', '#a29bfe', '#fd79a8', '#00cec9', '#636e72'];

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        canvas.width = 800;
        canvas.height = 500;

        // Dark background
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Save initial state
        const initialState = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setHistory([initialState]);
        setHistoryIndex(0);
    }, []);

    const saveState = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const state = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(state);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }, [history, historyIndex]);

    const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (canvas.width / rect.width),
            y: (e.clientY - rect.top) * (canvas.height / rect.height),
        };
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { x, y } = getPos(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        setIsDrawing(true);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { x, y } = getPos(e);
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (isDrawing) {
            setIsDrawing(false);
            saveState();
        }
    };

    const undo = () => {
        if (historyIndex <= 0) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const newIndex = historyIndex - 1;
        ctx.putImageData(history[newIndex], 0, 0);
        setHistoryIndex(newIndex);
    };

    const redo = () => {
        if (historyIndex >= history.length - 1) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const newIndex = historyIndex + 1;
        ctx.putImageData(history[newIndex], 0, 0);
        setHistoryIndex(newIndex);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        saveState();
    };

    const handleSave = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dataUrl = canvas.toDataURL('image/png');
        onSave(dataUrl);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-5 max-w-[880px] w-full mx-4 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[15px] text-[#e5e5e0] font-medium">Drawing Canvas</h3>
                    <button onClick={onClose} className="text-[13px] text-[#666] hover:text-[#e5e5e0] transition-colors">
                        ✕ Close
                    </button>
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-4 mb-3 p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
                    {/* Colors */}
                    <div className="flex gap-1.5">
                        {colors.map((c) => (
                            <button
                                key={c}
                                onClick={() => setColor(c)}
                                className={`w-6 h-6 rounded-full border-2 transition-all ${color === c ? 'border-[#e5e5e0] scale-110' : 'border-[#333] hover:border-[#555]'
                                    }`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>

                    <div className="w-px h-5 bg-[#333]" />

                    {/* Line width */}
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[#555] uppercase tracking-wider">Size</span>
                        <input
                            type="range"
                            min="1"
                            max="20"
                            value={lineWidth}
                            onChange={(e) => setLineWidth(parseInt(e.target.value))}
                            className="w-20 accent-[#e5e5e0]"
                        />
                        <span className="text-[11px] text-[#888] w-5">{lineWidth}</span>
                    </div>

                    <div className="w-px h-5 bg-[#333]" />

                    {/* Actions */}
                    <div className="flex gap-1.5">
                        <button onClick={undo} className="px-2.5 py-1.5 text-[11px] text-[#888] hover:text-[#e5e5e0]
                            bg-[#222] rounded border border-[#333] hover:border-[#444] transition-all" title="Undo">
                            ↩ Undo
                        </button>
                        <button onClick={redo} className="px-2.5 py-1.5 text-[11px] text-[#888] hover:text-[#e5e5e0]
                            bg-[#222] rounded border border-[#333] hover:border-[#444] transition-all" title="Redo">
                            ↪ Redo
                        </button>
                        <button onClick={clearCanvas} className="px-2.5 py-1.5 text-[11px] text-[#e34040] hover:text-[#ff5555]
                            bg-[#222] rounded border border-[#333] hover:border-[#3a2020] transition-all">
                            Clear
                        </button>
                    </div>
                </div>

                {/* Canvas */}
                <div className="border border-[#2a2a2a] rounded-lg overflow-hidden">
                    <canvas
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        className="w-full h-auto cursor-crosshair block"
                        style={{ maxHeight: '500px' }}
                    />
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 mt-4">
                    <button onClick={onClose} className="px-4 py-2.5 text-[13px] text-[#888] bg-[#1a1a1a]
                        border border-[#2a2a2a] rounded-md hover:text-[#e5e5e0] hover:border-[#333] transition-all">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="px-4 py-2.5 text-[13px] text-[#0e0e0e] bg-[#e5e5e0]
                        rounded-md font-medium hover:bg-[#d5d5d0] transition-all">
                        Save & Insert
                    </button>
                </div>
            </div>
        </div>
    );
}
