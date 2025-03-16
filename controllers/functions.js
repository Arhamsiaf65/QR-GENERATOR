import { useReactToPrint } from "react-to-print";
import html2canvas from "html2canvas";



export const handleDownload = (qrRef, format = "svg") => {
    const svgElement = qrRef.current.querySelector("svg");

    if (format === "svg") {
        const viewBox = svgElement.getAttribute("viewBox");
        const [x, y, width, height] = viewBox.split(" ").map(Number);

        // Add padding to the rectangle (e.g., 10% of the width and height)
        const padding = Math.max(width, height) * 0.1; // 10% padding
        const rectWidth = width + 2 * padding;
        const rectHeight = height + 2 * padding;

        // Create a white background rectangle with padding
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", x - padding);
        rect.setAttribute("y", y - padding);
        rect.setAttribute("width", rectWidth);
        rect.setAttribute("height", rectHeight);
        rect.setAttribute("fill", "white");

        // Insert the rectangle behind the QR code
        svgElement.insertBefore(rect, svgElement.firstChild);

        // Serialize and download the SVG
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgElement);
        const blob = new Blob([svgString], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "QRCode.svg";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } else {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        const img = new Image();
        img.src = `data:image/svg+xml;base64,${btoa(new XMLSerializer().serializeToString(svgElement))}`;
        img.onload = () => {
            // Add padding to the canvas (e.g., 10% of the image size)
            const padding = Math.max(img.width, img.height) * 0.1; // 10% padding
            canvas.width = img.width + 2 * padding;
            canvas.height = img.height + 2 * padding;

            // Fill the canvas with a white background
            context.fillStyle = "white";
            context.fillRect(0, 0, canvas.width, canvas.height);

            // Draw the QR code image on top of the white background with padding
            context.drawImage(img, padding, padding);

            const url = canvas.toDataURL(`image/${format}`);
            const link = document.createElement("a");
            link.href = url;
            link.download = `QRCode.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };
    }
};