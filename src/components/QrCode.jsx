import React from "react";
import QRCode from "react-qr-code";

function QRCodeComponent({ value, className = "" }) {
    return (
        <div className={`w-full max-w-full ${className}`}>
            <div className="w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-72 lg:h-72">
                <QRCode
                    size={256} 
                    style={{ 
                        height: "100%", 
                        width: "100%", 
                        aspectRatio: "1/1" // Ensures the QR code remains square
                    }}
                    value={value || "Dummy QR Code"}
                    viewBox="0 0 256 256"
                />
            </div>
        </div>
    );
}

export default QRCodeComponent;