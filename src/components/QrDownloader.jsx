import React, { useRef } from 'react';
import QRCode from 'qrcode.react';

export default QrDownloader = () => {
  const qrRef = useRef(null);

  const CONFIG = {
    colors: {
      primary: "#48297B", // Purple color
      secondary: "#FFFFFF", // White
      background: "#FFFFFF", // White background
    },
    dimensions: {
      cardWidth: 132,
      cardHeight: 132,
      qrContainerSize: 60,
      cornerRadius: 32,
      logoWidth: 36,
      logoHeight: 24,
      headerHeight: 30,
      contentPadding: 12,
    },
    text: {
      header: {
        content: "CABS FILIG", // Updated to match image
        yPosition: 21,
        fontSize: "12px",
        fontWeight: "bold",
      },
      footer: {
        content: "CUI-faculty.scanner",
        yPosition: 114,
        fontSize: "6px",
      },
    },
    rendering: {
      pngScale: 3,
    },
  };

  const handleDownload = async (format = "svg") => {
    const createCardBase = () => {
      const size = CONFIG.dimensions.cardWidth;
      const radius = size / 2;

      return (
        <svg 
          viewBox={`0 0 ${size} ${size}`} 
          width={size} 
          height={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <clipPath id="clipCircle">
              <circle cx={radius} cy={radius} r={radius} />
            </clipPath>
          </defs>
          
          <g clipPath="url(#clipCircle)">
            {/* Background circle */}
            <circle
              cx={radius}
              cy={radius}
              r={radius}
              fill={CONFIG.colors.background}
              stroke={CONFIG.colors.primary}
              strokeWidth="1.5"
            />
            
            {/* Header with curved bottom */}
            <rect
              x="0"
              y="0"
              width="100%"
              height={CONFIG.dimensions.headerHeight}
              rx={`${CONFIG.dimensions.cornerRadius} ${CONFIG.dimensions.cornerRadius} 0 0`}
              fill={CONFIG.colors.primary}
            />
          </g>
        </svg>
      );
    };

    const createTextElement = (textConfig) => {
      return (
        <text
          x={textConfig.x || "50%"}
          y={textConfig.yPosition}
          fontFamily="'Segoe UI', sans-serif"
          fontSize={textConfig.fontSize}
          fontWeight={textConfig.fontWeight}
          fill={textConfig.color || CONFIG.colors.primary}
          textAnchor={textConfig.textAnchor || "middle"}
          dominantBaseline="middle"
        >
          {textConfig.content}
        </text>
      );
    };

    const createQRContainer = () => {
      const { qrContainerSize, contentPadding } = CONFIG.dimensions;
      const size = qrContainerSize - 6;
      
      return (
        <g
          transform={`translate(
            ${(CONFIG.dimensions.cardWidth - qrContainerSize) / 2},
            ${CONFIG.dimensions.headerHeight + 20}
          )`}
        >
          <rect
            width={qrContainerSize}
            height={qrContainerSize}
            rx="4"
            fill={CONFIG.colors.secondary}
          />
          <QRCode
            value="https://example.com" // Replace with your actual QR value
            size={size}
            level="H"
            includeMargin={false}
            renderAs="svg"
            x="3"
            y="3"
          />
        </g>
      );
    };

    const exportAsSVG = () => {
      const cardSvg = (
        <svg 
          viewBox={`0 0 ${CONFIG.dimensions.cardWidth} ${CONFIG.dimensions.cardHeight}`} 
          width={CONFIG.dimensions.cardWidth} 
          height={CONFIG.dimensions.cardHeight}
          xmlns="http://www.w3.org/2000/svg"
        >
          {createCardBase().props.children}
          {createTextElement({ 
            ...CONFIG.text.header, 
            color: "#FFFFFF",
          })}
          {createQRContainer()}
          {createTextElement({ 
            ...CONFIG.text.footer, 
            textAnchor: "middle" 
          })}
        </svg>
      );

      const svgString = new XMLSerializer().serializeToString(
        document.createElement('div').appendChild(cardSvg)
      );
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      triggerDownload(blob, "CABS_FILIG.svg");
    };

    const exportAsRaster = async () => {
      const cardSvg = (
        <svg 
          viewBox={`0 0 ${CONFIG.dimensions.cardWidth} ${CONFIG.dimensions.cardHeight}`} 
          width={CONFIG.dimensions.cardWidth} 
          height={CONFIG.dimensions.cardHeight}
          xmlns="http://www.w3.org/2000/svg"
        >
          {createCardBase().props.children}
          {createTextElement({ 
            ...CONFIG.text.header, 
            color: "#FFFFFF",
          })}
          {createQRContainer()}
          {createTextElement({ 
            ...CONFIG.text.footer, 
            textAnchor: "middle" 
          })}
        </svg>
      );

      const { pngScale } = CONFIG.rendering;
      const canvas = document.createElement("canvas");
      const size = CONFIG.dimensions.cardWidth * pngScale;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      
      // Create circular background
      ctx.beginPath();
      ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
      ctx.fillStyle = CONFIG.colors.background;
      ctx.fill();
      
      // Draw rounded clipping mask
      ctx.beginPath();
      ctx.arc(size/2, size/2, size/2 - 1, 0, Math.PI * 2);
      ctx.clip();

      const svgString = new XMLSerializer().serializeToString(
        document.createElement('div').appendChild(cardSvg)
      );
      const img = new Image();
      img.src = `data:image/svg+xml;base64,${btoa(svgString)}`;
      await new Promise((resolve) => (img.onload = resolve));
      
      // Draw SVG image
      ctx.drawImage(img, 0, 0, size, size);
      
      // Add circular border
      ctx.beginPath();
      ctx.arc(size/2, size/2, size/2 - 1, 0, Math.PI * 2);
      ctx.strokeStyle = CONFIG.colors.primary;
      ctx.lineWidth = 1.5 * pngScale;
      ctx.stroke();

      canvas.toBlob((blob) => triggerDownload(blob, `CABS_FILIG.${format}`), `image/${format}`);
    };

    const triggerDownload = (blob, filename) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    format === "svg" ? exportAsSVG() : await exportAsRaster();
  };

  return (
    <div>
      <div ref={qrRef} style={{ display: 'none' }}>
        <QRCode 
          value="https://example.com" // Replace with your actual QR value
          size={CONFIG.dimensions.qrContainerSize - 6}
          level="H"
          includeMargin={false}
        />
      </div>
      
      <button onClick={() => handleDownload('svg')}>Download as SVG</button>
      <button onClick={() => handleDownload('png')}>Download as PNG</button>
    </div>
  );
};

