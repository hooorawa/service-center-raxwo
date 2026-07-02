import React, { useRef, useState, useEffect } from 'react';
import { Trash2, Check } from 'lucide-react';

const SignatureCanvas = ({ onSave, initialImage = '' }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isEmpty, setIsEmpty] = useState(true);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#1e293b'; // Slate 800
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Load initial signature image if exists
        if (initialImage) {
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0);
                setIsEmpty(false);
            };
            img.src = initialImage;
        }
    }, [initialImage]);

    const getCoordinates = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        
        // Handle touch events vs mouse events
        if (e.touches && e.touches.length > 0) {
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
            };
        }
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const startDrawing = (e) => {
        e.preventDefault();
        const coords = getCoordinates(e);
        const ctx = canvasRef.current.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        e.preventDefault();
        const coords = getCoordinates(e);
        const ctx = canvasRef.current.getContext('2d');
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
        setIsEmpty(false);
    };

    const stopDrawing = () => {
        if (isDrawing) {
            setIsDrawing(false);
            saveSignature();
        }
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setIsEmpty(true);
        onSave('');
    };

    const saveSignature = () => {
        const canvas = canvasRef.current;
        if (!isEmpty) {
            const dataUrl = canvas.toDataURL('image/png');
            onSave(dataUrl);
        }
    };

    return (
        <div className="flex flex-col items-center border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl w-full">
            <canvas
                ref={canvasRef}
                width={400}
                height={150}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 cursor-crosshair touch-none shadow-inner"
            />
            <div className="flex gap-4 mt-3 w-full justify-between items-center px-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {isEmpty ? 'Sign inside the box' : 'Signature Captured'}
                </span>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={clearCanvas}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-wider transition-colors"
                        title="Clear Signature"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        Clear
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SignatureCanvas;
