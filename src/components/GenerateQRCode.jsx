import React, { useState, useRef, useEffect } from "react";
import { Download, User, Phone, BookOpen, Mail, Loader2 } from "lucide-react";
import QRCode from "react-qr-code";
import { handleDownload } from "../../controllers/functions";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function GenerateQRCode() {
    const [userInfo, setUserInfo] = useState({
        name: "",
        email: "",
        phone: "",
        dept: "",
        imageUrl: "",
    });

    const [uploadingImage, setImageUploading] = useState(false);
    const [qrValue, setQrValue] = useState("");
    const qrRef = useRef();
    const generateBtnRef = useRef();

    const scrollToButton = () => {
        generateBtnRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    const handleChange = (e) => {
        setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
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
                setUserInfo((prev) => {
                    const updated = { ...prev, imageUrl: data.secure_url };
                    const { name, email, phone, dept } = updated;
                    if (name && email && phone && dept) scrollToButton();
                    return updated;
                });
                toast.success("Image uploaded successfully!");
            } catch (error) {
                console.error("Error uploading image:", error);
                toast.error("Failed to upload image.");
            } finally {
                setImageUploading(false);
            }
        }
    };

    const generateQRCode = (e) => {
        e.preventDefault();
        const jsonString = JSON.stringify(userInfo);
        setQrValue(jsonString);
        toast.success("QR Code generated!");
        setTimeout(() => {
            qrRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 300);
    };


    const isFormValid = Object.values(userInfo).every((val) => val !== "");

    return (
        <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-blue-100 p-4 relative">
            <form
                onSubmit={generateQRCode}
                className="w-full md:max-w-md py-4 px-6 md:px-8 space-y-3"
            >
                <h1 className="text-3xl md:text-5xl text-[#1C398E] font-bold text-shadow text-center md:text-left">
                    Generate QR for CAR OWNER
                </h1>

                {/* Name */}
                <div className="relative">
                    <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={userInfo.name}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <span className="absolute right-3 top-3.5 text-gray-400">
                        <User size={20} />
                    </span>
                </div>

                {/* Email */}
                <div className="relative">
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={userInfo.email}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <span className="absolute right-3 top-3.5 text-gray-400">
                        <Mail size={20} />
                    </span>
                </div>

                {/* Phone */}
                <div className="relative">
                    <input
                        type="tel"
                        name="phone"
                        placeholder="Phone"
                        value={userInfo.phone}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <span className="absolute right-3 top-3.5 text-gray-400">
                        <Phone size={20} />
                    </span>
                </div>

                {/* Dept */}
                <div className="relative">
                    <input
                        type="text"
                        name="dept"
                        placeholder="Dept"
                        value={userInfo.dept}
                        onChange={(e) => {
                            const value = e.target.value.replace(/[^a-zA-Z]/g, "");
                            handleChange({ target: { name: "dept", value } });
                        }}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <span className="absolute right-3 top-3.5 text-gray-400">
                        <BookOpen size={20} />
                    </span>
                </div>

                {/* Upload Image */}
                <div className="flex flex-col items-center justify-center w-full">
                    <label
                        htmlFor="dropzone-file"
                        className="flex flex-col items-center justify-center w-full p-4  border-2 border-dashed rounded-lg bg-white cursor-pointer hover:bg-gray-50"
                    >
                        {uploadingImage ? (
                            <div className="flex flex-col items-center text-gray-600">
                                <Loader2 className="animate-spin mb-2" size={24} />
                                Uploading...
                            </div>
                        ) : (
                            <>
                                <svg className="w-8 h-8 mb-2 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5A5.5 5.5 0 0 0 5.207 5.021A4 4 0 0 0 5 13h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                </svg>
                                <p className="text-sm text-gray-500"><span className="font-semibold">Click to upload</span> image</p>
                            </>
                        )}
                        <input id="dropzone-file" type="file" className="hidden" onChange={handleImageUpload} />
                    </label>
                </div>

                {/* Generate Button */}
                <button
                    type="submit"
                    disabled={!isFormValid || uploadingImage}
                    ref={generateBtnRef}
                    className={`w-full p-3 rounded-lg font-semibold transition-all ${
                        isFormValid && !uploadingImage
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-[#1C398E] text-white cursor-not-allowed"
                    }`}
                >
                    {uploadingImage ? "Please wait..." : "Generate QR Code"}
                </button>
            </form>

            {/* QR Code Section */}
            <div className="w-full bg-[#1C398E] py-16 rounded-xl md:w-auto flex flex-col items-center space-y-4 mt-10 md:mt-0 px-4 md:px-8">
                <div ref={qrRef} className="p-6 bg-white border border-gray-200 rounded-2xl shadow-lg">
                    <QRCode value={qrValue || "Dummy QR"} size={200} />
                </div>
                <p className="text-sm text-white text-center">
                    {qrValue ? "Scan this QR Code!" : "It's a Dummy QR. Generate Yours Using the Form."}
                </p>
                <div className="flex space-x-4 text-white text-lg">
                    <button
                        onClick={() => handleDownload(qrRef, 'jpg')}
                        className="flex items-center bg-blue-600 text-white px-4 py-1.5 rounded-lg space-x-2 hover:bg-blue-700"
                    >
                        <Download size={16} />
                        <span>JPG</span>
                    </button>
                    <button
                        onClick={() => handleDownload(qrRef, 'png')}
                        className="flex items-center bg-blue-600 text-white px-4 py-1.5 rounded-lg space-x-2 hover:bg-blue-700"
                    >
                        <Download size={16} />
                        <span>PNG</span>
                    </button>
                </div>
            </div>

            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
}

export default GenerateQRCode;
