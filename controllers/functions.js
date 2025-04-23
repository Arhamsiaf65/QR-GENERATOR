export const handleDownload = async (qrRef, teacherInfo = {}, format = "svg") => {
  const defaultTeacherInfo = {
    validity: "Dec 2025"
  };

  const mergedTeacherInfo = {
    ...defaultTeacherInfo,
    ...teacherInfo
  };

  const CONFIG = {
    colors: {
      primary: "#48297B",       // Dark purple (university color)
      secondary: "#FFFFFF",     // White
      background: "#F9F9F9",    // Light gray background
      accent: "#F5A623",        // Gold accent
      textDark: "#333333",      // Dark text
      lightText: "#FFFFFF",     // White text
      subtleText: "#666666"     // Gray for less important info
    },
    dimensions: {
      cardWidth: 180,
      cardHeight: 120,
      qrContainerSize: 70,
      cornerRadius: 12,
      logoWidth: 42,
      logoHeight: 32,
      headerHeight: 38,
      contentPadding: 16,
      textSpacing: 4,
      lineHeight: 1.4
    },
    text: {
      university: {
        content: "COMSATS UNIVERSITY",
        yPosition: 16,
        fontSize: "8px",
        fontWeight: "500",
        letterSpacing: "0.5px"
      },
      campus: {
        content: "SAHIWAL CAMPUS",
        yPosition: 28,
        fontSize: "10px",
        fontWeight: "700",
        letterSpacing: "0.3px"
      },
      permitType: {
        content: "PARKING  CARD",
        yPosition: 72,
        fontSize: "10px",
        fontWeight: "500",
        letterSpacing: "0.2px",
        maxWidth: 40
        // max width 50 
        // margin top 30px 
        
      },
  
      // Slightly below the permit type.
      authorization: {
        content: "Scan QR code",
        yPosition: 90,
        fontSize: "8px",
        fontWeight: "400",
        fontStyle: "italic",
        opacity: "0.9"
      },
      // Info message takes up the left part of the card.
      infoMessage: {
        content: "at arham.scanner",
        yPosition: 80,
        fontSize: "7.5px",
        fontWeight: "400",
        color: "textDark",
        maxWidth: 110
      },
      // Footer text is centered horizontally at the bottom.
      footer: {
        content: ``,
        yPosition: 112,
        fontSize: "8.5px",
        fontWeight: "500",
        color: "subtleText"
      }
    },
    rendering: {
      pngScale: 3
    }
  };

  // Create an SVG element with given attributes.
  const createSVGElement = (tag, attributes = {}) => {
    const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    return element;
  };

  // Create a text element with specified styles.
  const createTextElement = (content, x, y, fontSize, fontWeight, color, anchor = "start", additionalStyles = {}) => {
    const text = createSVGElement("text", {
      x,
      y,
      "font-family": "'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
      "font-size": fontSize,
      "font-weight": fontWeight,
      fill: CONFIG.colors[color] || color,
      "text-anchor": anchor,
      ...additionalStyles
    });
    text.textContent = content;
    return text;
  };

  // Create multiline text by splitting words and ensuring max width.
  const createMultilineText = (content, x, y, fontSize, fontWeight, color, maxWidth, lineHeight = 1.2) => {
    const group = createSVGElement("g");
    const words = content.split(" ");
    let line = "";
    let lineCount = 0;
    
    words.forEach((word) => {
      const testLine = line + word + " ";
      const testElement = createTextElement(testLine, 0, 0, fontSize, fontWeight, color);
      document.body.appendChild(testElement);
      const testWidth = testElement.getComputedTextLength();
      document.body.removeChild(testElement);
      
      if (testWidth > maxWidth && line !== "") {
        group.appendChild(createTextElement(
          line.trim(),
          x,
          y + (lineCount * parseInt(fontSize) * lineHeight),
          fontSize,
          fontWeight,
          color
        ));
        line = word + " ";
        lineCount++;
      } else {
        line = testLine;
      }
    });
    
    group.appendChild(createTextElement(
      line.trim(),
      x,
      y + (lineCount * parseInt(fontSize) * lineHeight),
      fontSize,
      fontWeight,
      color
    ));
    
    return group;
  };

  // Base card with background, header, and accent stripe.
  const createCardBase = () => {
    const { cardWidth, cardHeight, cornerRadius, headerHeight } = CONFIG.dimensions;
    const svg = createSVGElement("svg", {
      viewBox: `0 0 ${cardWidth} ${cardHeight}`,
      width: cardWidth,
      height: cardHeight
    });

    // Card background with a subtle shadow.
    svg.appendChild(createSVGElement("rect", {
      x: "0",
      y: "0",
      width: cardWidth,
      height: cardHeight,
      rx: cornerRadius,
      fill: CONFIG.colors.background,
      stroke: CONFIG.colors.primary,
      "stroke-width": "1.5",
      filter: "url(#shadow)"
    }));

    // Header rectangle.
    svg.appendChild(createSVGElement("rect", {
      x: "0",
      y: "0",
      width: "100%",
      height: headerHeight,
      rx: `${cornerRadius} ${cornerRadius} 0 0`,
      fill: CONFIG.colors.primary
    }));

    // Accent stripe just below the header.
    svg.appendChild(createSVGElement("rect", {
      x: "0",
      y: headerHeight - 4,
      width: "100%",
      height: "5",
      fill: CONFIG.colors.accent
    }));

    return svg;
  };

  // Create the container for the QR code.
  const createQRContainer = () => {
    const { qrContainerSize, contentPadding, headerHeight } = CONFIG.dimensions;
    const group = createSVGElement("g", {
      transform: `translate(${CONFIG.dimensions.cardWidth - qrContainerSize - contentPadding}, ${contentPadding + headerHeight - 10})`
    });

    // Background for the QR container with a subtle shadow.
    group.appendChild(createSVGElement("rect", {
      width: qrContainerSize,
      height: qrContainerSize,
      rx: "6",
      fill: CONFIG.colors.secondary,
      stroke: CONFIG.colors.primary,
      "stroke-width": "0.8",
      filter: "url(#smallShadow)"
    }));

    const originalQR = qrRef.current?.querySelector("svg");
    if (!originalQR) throw new Error("QR code element not found");
    
    const clonedQR = originalQR.cloneNode(true);
    const size = qrContainerSize - 8;
    clonedQR.setAttribute("width", size);
    clonedQR.setAttribute("height", size);
    clonedQR.setAttribute("x", "4");
    clonedQR.setAttribute("y", "4");
    group.appendChild(clonedQR);

    return group;
  };

  // Create the university logo element.
  const createUniversityLogo = async () => {
    const logoGroup = createSVGElement("g", {
      transform: `translate(${CONFIG.dimensions.contentPadding}, ${CONFIG.dimensions.contentPadding})`
    });
  
    logoGroup.appendChild(createSVGElement("rect", {
      width: CONFIG.dimensions.logoWidth,
      height: CONFIG.dimensions.logoHeight,
      rx: "5",
      fill: CONFIG.colors.secondary,
      stroke: CONFIG.colors.accent,
      "stroke-width": "1.2"
    }));
  
    try {
      // Use rotating proxy servers
      const proxies = [
        "https://cors.zimjs.com/",
        "https://api.allorigins.win/raw?url=",
        "https://proxy.cors.sh/"
      ];
      
      const imageUrl = "./logo.png";
      const response = await fetch(
        proxies[Math.floor(Math.random() * proxies.length)] + 
        encodeURIComponent(imageUrl),
        {
          headers: {
            "Origin": window.location.origin,
            "X-Requested-With": "XMLHttpRequest"
          }
        }
      );
  
      if (!response.ok) throw new Error("Failed to fetch image");
      
      const blob = await response.blob();
      const dataUrl = await new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
  
      const image = createSVGElement("image", {
        href: dataUrl,
        x: "0",
        y: "0",
        width: CONFIG.dimensions.logoWidth,
        height: CONFIG.dimensions.logoHeight
      });
  
      logoGroup.appendChild(image);
    } catch (error) {
      console.error("Image load failed:", error);
      // Fallback to text
      logoGroup.appendChild(createTextElement(
        "CUI",
        CONFIG.dimensions.logoWidth / 2,
        CONFIG.dimensions.logoHeight / 2 + 4,
        "11px",
        "700",
        "primary",
        "middle",
        { "letter-spacing": "0.5px" }
      ));
    }
  
    return logoGroup;
  };

  // Build the base card.
  const cardSvg = createCardBase();
  
  // Define SVG filters for shadows.
  const defs = createSVGElement("defs");
  
  // Main card shadow.
  const cardFilter = createSVGElement("filter", { id: "shadow", x: "0", y: "0", width: "200%", height: "200%" });
  cardFilter.appendChild(createSVGElement("feDropShadow", {
    dx: "1.5",
    dy: "1.5",
    stdDeviation: "2",
    "flood-color": "rgba(0,0,0,0.15)",
    "flood-opacity": "0.8"
  }));
  defs.appendChild(cardFilter);
  
  // QR code shadow.
  const qrFilter = createSVGElement("filter", { id: "smallShadow", x: "0", y: "0", width: "200%", height: "200%" });
  qrFilter.appendChild(createSVGElement("feDropShadow", {
    dx: "0.8",
    dy: "0.8",
    stdDeviation: "1",
    "flood-color": "rgba(0,0,0,0.1)"
  }));
  defs.appendChild(qrFilter);
  
  cardSvg.appendChild(defs);
  
  // Header text: placed to the right of the logo.
  const headerTextX = CONFIG.dimensions.contentPadding + CONFIG.dimensions.logoWidth + 12;
  cardSvg.appendChild(createTextElement(
    CONFIG.text.university.content,
    headerTextX,
    CONFIG.text.university.yPosition,
    CONFIG.text.university.fontSize,
    CONFIG.text.university.fontWeight,
    "lightText",
    "start",
    { "letter-spacing": CONFIG.text.university.letterSpacing }
  ));
  
  cardSvg.appendChild(createTextElement(
    CONFIG.text.campus.content,
    headerTextX,
    CONFIG.text.campus.yPosition,
    CONFIG.text.campus.fontSize,
    CONFIG.text.campus.fontWeight,
    "lightText",
    "start",
    { "letter-spacing": CONFIG.text.campus.letterSpacing }
  ));
  
  // Body text (below header)
  cardSvg.appendChild(createTextElement(
    CONFIG.text.permitType.content,
    CONFIG.dimensions.contentPadding,
    CONFIG.text.permitType.yPosition,
    CONFIG.text.permitType.fontSize,
    CONFIG.text.permitType.fontWeight,
    CONFIG.colors.primary
  ));
  
  cardSvg.appendChild(createTextElement(
    CONFIG.text.authorization.content,
    CONFIG.dimensions.contentPadding,
    CONFIG.text.authorization.yPosition,
    CONFIG.text.authorization.fontSize,
    CONFIG.text.authorization.fontWeight,
    CONFIG.colors.primary,
    "start",
    {
      "font-style": CONFIG.text.authorization.fontStyle,
      "opacity": CONFIG.text.authorization.opacity
    }
  ));
  
  // Add the multi-line info message.
  const infoMessage = createMultilineText(
    CONFIG.text.infoMessage.content,
    CONFIG.dimensions.contentPadding,
    CONFIG.text.infoMessage.yPosition,
    CONFIG.text.infoMessage.fontSize,
    CONFIG.text.infoMessage.fontWeight,
    CONFIG.text.infoMessage.color,
    CONFIG.text.infoMessage.maxWidth
  );
  cardSvg.appendChild(infoMessage);
  
  // Footer text, centered horizontally.
  cardSvg.appendChild(createTextElement(
    CONFIG.text.footer.content,
    CONFIG.dimensions.cardWidth / 2,
    CONFIG.text.footer.yPosition,
    CONFIG.text.footer.fontSize,
    CONFIG.text.footer.fontWeight,
    CONFIG.text.footer.color,
    "middle"
  ));
  
  // Add the logo and QR code.
  cardSvg.appendChild(await createUniversityLogo());
  cardSvg.appendChild(createQRContainer());

  // Function to export the card as a PNG.
  const exportAsPNG = async () => {
    const clonedSvg = cardSvg.cloneNode(true);
    const canvas = document.createElement("canvas");
    const width = CONFIG.dimensions.cardWidth * CONFIG.rendering.pngScale;
    const height = CONFIG.dimensions.cardHeight * CONFIG.rendering.pngScale;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    const tempSvg = cardSvg.cloneNode(true);
  
  // Force re-render of all images
  const images = tempSvg.querySelectorAll('image');
  await Promise.all(Array.from(images).map(img => {
    return new Promise((resolve) => {
      img.onload = resolve;
      img.dispatchEvent(new Event('load'));
    });
  }));
  
    const svgData = new XMLSerializer().serializeToString(clonedSvg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
  
    const img = new Image();
    img.src = url;
    await new Promise((resolve) => {
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        resolve();
      };
    });
  
    canvas.toBlob((blob) => {
      triggerDownload(blob, `Parking_Contact_Card.png`);
    }, "image/png");
  };

  const triggerDownload = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };

  try {
    await exportAsPNG();
  } catch (error) {
    console.error("Error generating parking contact card:", error);
    throw error;
  }
};
