import { useReactToPrint } from "react-to-print";
import html2canvas from "html2canvas";



export const handleDownload = (qrRef, format = "svg") => {
    const svgElement = qrRef.current.querySelector("svg");

    if (format === "svg") {
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
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);
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