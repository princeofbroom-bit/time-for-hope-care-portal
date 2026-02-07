'use client';

import React, { useRef, useEffect, useState } from 'react';
import SignaturePadLib from 'signature_pad';

export interface SignaturePadProps {
  onSignatureChange?: (dataUrl: string | null) => void;
  onSignatureSave?: (dataUrl: string) => void;
  width?: number;
  height?: number;
  penColor?: string;
  backgroundColor?: string;
  className?: string;
  disabled?: boolean;
}

export default function SignaturePad({
  onSignatureChange,
  onSignatureSave,
  width = 500,
  height = 200,
  penColor = '#002d62',
  backgroundColor = '#ffffff',
  className = '',
  disabled = false,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePadLib | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Set canvas dimensions
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(ratio, ratio);

    // Fill background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Initialize signature pad
    signaturePadRef.current = new SignaturePadLib(canvas, {
      penColor,
      backgroundColor,
      minWidth: 0.5,
      maxWidth: 2.5,
    });

    // Handle signature changes
    signaturePadRef.current.addEventListener('endStroke', () => {
      const empty = signaturePadRef.current?.isEmpty() ?? true;
      setIsEmpty(empty);

      if (!empty && onSignatureChange) {
        const dataUrl = signaturePadRef.current?.toDataURL('image/png');
        onSignatureChange(dataUrl || null);
      }
    });

    // Disable if needed
    if (disabled) {
      signaturePadRef.current.off();
    }

    return () => {
      signaturePadRef.current?.off();
    };
  }, [width, height, penColor, backgroundColor, disabled, onSignatureChange]);

  const handleClear = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
      setIsEmpty(true);

      // Fill background after clear
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx && canvas) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      if (onSignatureChange) {
        onSignatureChange(null);
      }
    }
  };

  const handleSave = () => {
    if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
      const dataUrl = signaturePadRef.current.toDataURL('image/png');
      if (onSignatureSave) {
        onSignatureSave(dataUrl);
      }
    }
  };

  const handleUndo = () => {
    if (signaturePadRef.current) {
      const data = signaturePadRef.current.toData();
      if (data && data.length > 0) {
        data.pop();
        signaturePadRef.current.fromData(data);
        setIsEmpty(signaturePadRef.current.isEmpty());

        if (onSignatureChange) {
          const dataUrl = signaturePadRef.current.isEmpty()
            ? null
            : signaturePadRef.current.toDataURL('image/png');
          onSignatureChange(dataUrl);
        }
      }
    }
  };

  return (
    <div className={`signature-pad-container ${className}`}>
      <div className="signature-pad-wrapper">
        <canvas
          ref={canvasRef}
          className="signature-pad-canvas"
          style={{
            border: '2px solid #dee2e6',
            borderRadius: '8px',
            touchAction: 'none',
            cursor: disabled ? 'not-allowed' : 'crosshair',
          }}
        />
        {isEmpty && !disabled && (
          <div className="signature-placeholder">
            Sign here
          </div>
        )}
      </div>

      <div className="signature-pad-controls">
        <button
          type="button"
          onClick={handleUndo}
          disabled={isEmpty || disabled}
          className="signature-btn signature-btn-secondary"
        >
          Undo
        </button>
        <button
          type="button"
          onClick={handleClear}
          disabled={isEmpty || disabled}
          className="signature-btn signature-btn-secondary"
        >
          Clear
        </button>
        {onSignatureSave && (
          <button
            type="button"
            onClick={handleSave}
            disabled={isEmpty || disabled}
            className="signature-btn signature-btn-primary"
          >
            Save Signature
          </button>
        )}
      </div>

      <style jsx>{`
        .signature-pad-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .signature-pad-wrapper {
          position: relative;
          display: inline-block;
        }

        .signature-pad-canvas {
          display: block;
        }

        .signature-placeholder {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #adb5bd;
          font-size: 1.2rem;
          pointer-events: none;
          user-select: none;
        }

        .signature-pad-controls {
          display: flex;
          gap: 8px;
        }

        .signature-btn {
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .signature-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .signature-btn-primary {
          background: #002d62;
          color: white;
          border: none;
        }

        .signature-btn-primary:hover:not(:disabled) {
          background: #003d82;
        }

        .signature-btn-secondary {
          background: white;
          color: #495057;
          border: 1px solid #dee2e6;
        }

        .signature-btn-secondary:hover:not(:disabled) {
          background: #f8f9fa;
        }
      `}</style>
    </div>
  );
}

/**
 * Typed Signature Component
 * Generates a signature from typed text
 */
export interface TypedSignatureProps {
  name: string;
  onNameChange: (name: string) => void;
  onSignatureGenerate?: (dataUrl: string) => void;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  className?: string;
}

export function TypedSignature({
  name,
  onNameChange,
  onSignatureGenerate,
  fontFamily = 'cursive',
  fontSize = 48,
  color = '#002d62',
  className = '',
}: TypedSignatureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fonts = [
    { name: 'Cursive', value: 'cursive' },
    { name: 'Script', value: "'Brush Script MT', cursive" },
    { name: 'Elegant', value: "'Lucida Handwriting', cursive" },
    { name: 'Classic', value: 'serif' },
  ];

  const [selectedFont, setSelectedFont] = useState(fontFamily);

  useEffect(() => {
    if (!canvasRef.current || !name) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw text
    ctx.fillStyle = color;
    ctx.font = `${fontSize}px ${selectedFont}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, canvas.width / 2, canvas.height / 2);

    // Generate data URL
    if (onSignatureGenerate && name.trim()) {
      const dataUrl = canvas.toDataURL('image/png');
      onSignatureGenerate(dataUrl);
    }
  }, [name, selectedFont, fontSize, color, onSignatureGenerate]);

  return (
    <div className={`typed-signature-container ${className}`}>
      <input
        type="text"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Type your full name"
        className="typed-signature-input"
      />

      <div className="font-selector">
        {fonts.map((font) => (
          <button
            key={font.value}
            type="button"
            onClick={() => setSelectedFont(font.value)}
            className={`font-btn ${selectedFont === font.value ? 'active' : ''}`}
            style={{ fontFamily: font.value }}
          >
            {font.name}
          </button>
        ))}
      </div>

      <div className="signature-preview">
        <canvas
          ref={canvasRef}
          width={500}
          height={100}
          style={{
            border: '2px solid #dee2e6',
            borderRadius: '8px',
            width: '100%',
            maxWidth: '500px',
          }}
        />
      </div>

      <style jsx>{`
        .typed-signature-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .typed-signature-input {
          padding: 12px 16px;
          font-size: 1rem;
          border: 2px solid #dee2e6;
          border-radius: 8px;
          outline: none;
          transition: border-color 0.2s;
        }

        .typed-signature-input:focus {
          border-color: #002d62;
        }

        .font-selector {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .font-btn {
          padding: 8px 16px;
          border: 2px solid #dee2e6;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 1rem;
        }

        .font-btn:hover {
          border-color: #002d62;
        }

        .font-btn.active {
          border-color: #002d62;
          background: #f0f4ff;
        }

        .signature-preview {
          background: #f8f9fa;
          padding: 16px;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}
