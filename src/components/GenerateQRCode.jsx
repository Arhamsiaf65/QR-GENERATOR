import React, { useState, useRef } from "react";
import { Download, User, Phone, BookOpen } from "lucide-react";
import Button from "./sparkeButton";
import { handleDownload } from "../../controllers/functions";
import QRCodeComponent from "./QrCode";

function GenerateQRCode() {
    const [userInfo, setUserInfo] = useState({
        name: "",
        contact: "",
        dept: "",
        imageUrl: "",
    });
    const [uploadingImage, setImageUploading] = useState(false);
    const [qrValue, setQrValue] = useState("");
    const qrRef = useRef();

    const handleChange = (e) => {
        setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0]; // This will now work
        setImageUploading(true);
    
        if (file) {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", "parking");
            formData.append("effect", "background_removal");
            try {
                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/dw8zsmfy3/image/upload`,
                    {
                        method: "POST",
                        body: formData,
                    }
                );
                const data = await response.json();
                console.log(data.secure_url);
                setUserInfo({ ...userInfo, imageUrl: data.secure_url });
            } catch (error) {
                console.error("Error uploading image:", error);
            } finally {
                setImageUploading(false);
            }
        }
    };

    const generateQRCode = (e) => {
        e.preventDefault();
        const jsonString = JSON.stringify(userInfo);
        console.log(jsonString);
        setQrValue(jsonString);
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-blue-100 p-4">
            <div className="w-full md:max-w-md py-4 px-4 md:px-8 space-y-6 transform transition-all duration-300 hover:scale-105">
                <form onSubmit={generateQRCode} className="space-y-4">
                    <h1 className="text-3xl md:text-5xl text-[#1C398E] py-6 md:py-3 font-bold text-shadow">
                        Generate QR for CAR OWNER
                    </h1>
                    <div className="relative">
                        <input
                            type="text"
                            name="name"
                            placeholder="Name"
                            value={userInfo.name}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300"
                            required
                        />
                        <span className="absolute inset-y-0 right-3 flex items-center text-gray-400">
                            <User size={20} />
                        </span>
                    </div>
                    <div className="relative">
                        <input
                            type="contact"
                            name="contact"
                            placeholder="email / mobile"
                            value={userInfo.contact}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                            required
                        />
                        <span className="absolute inset-y-0 right-3 flex items-center text-gray-400">
                            <Phone size={20} />
                        </span>
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            pattern="[a-zA-Z]+"
                            name="dept"
                            placeholder="Dept"
                            value={userInfo.dept}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^a-zA-Z]/g, "");
                                handleChange({ target: { name: "dept", value } });
                            }}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                            required
                        />
                        <span className="absolute inset-y-0 right-3 flex items-center text-gray-400">
                            <BookOpen size={20} />
                        </span>
                    </div>

                    <div className="flex items-center justify-center w-full">
    <label
        htmlFor="dropzone-file"
        className="flex flex-col items-center justify-center w-full rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
    >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
            </svg>
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span></p>
        </div>
        <input
            id="dropzone-file"
            type="file"
            className="hidden"
            onChange={handleImageUpload} // Add onChange here
        />
    </label>
</div>

                    <Button
                        disabled={uploadingImage}
                        type="submit"
                    >
                        {uploadingImage ? "Uploading..." : "Generate QR Code"}
                    </Button>
                </form>
            </div>

            {/* QR Code Section */}
            <div className="w-full md:w-auto flex flex-col items-center space-y-4 animate-fade-in shadow-2xl shadow-blue-800 sm:shadow-none py-8 px-4 md:px-8 md:ml-4 lg:ml-16 rounded-xl md:rounded-3xl mt-6 md:mt-0 md:bg-blue-500">
                <div ref={qrRef} className="p-4 md:p-6 bg-white border border-gray-200 rounded-2xl shadow-lg relative">
                    <QRCodeComponent value={qrValue} />
                </div>

                <p className="text-sm text-blue-950 sm:text-white text-center">
                    {qrValue ? "Scan this QR Code!" : "It's a Dummy QR. Generate Yours Using the Form."}
                </p>

                <div className="flex space-x-4 text-white text-lg">
                    <button
                        onClick={() => handleDownload(qrRef, 'jpg')} className="flex text-blue-950 bg-white sm:bg-transparent rounded-full sm:rounded-none px-4 py-0.5 sm:text-white items-center space-x-2">
                        <Download size={16} />
                        <span>JPG</span>
                    </button>

                    <button
                        onClick={() => handleDownload(qrRef, 'png')} className="flex items-center bg-blue-950 text-white sm:text-white sm:bg-transparent rounded-full sm:rounded-none px-4 py-0.5 space-x-2">
                        <Download size={16} />
                        <span>PNG</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default GenerateQRCode;