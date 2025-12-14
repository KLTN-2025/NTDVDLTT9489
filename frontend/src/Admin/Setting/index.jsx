import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Button,
    TextField,
    useTheme,
    CircularProgress,
    Card,
    CardContent,
    CardHeader,
    Divider,
    Avatar,
    IconButton
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { tokens } from "../../theme";
import { useAdminAuth } from "../../context/AdminContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getGeneralSettings, updateGeneralSettings, updateSliderSettings } from "./SettingApi";

const Setting = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { adminToken } = useAdminAuth();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false); // Separate loading state for banner uploads
    const [settings, setSettings] = useState({
        websiteName: "",
        logo: "",
        phone: "",
        email: "",
        address: "",
        slogan: "",
        copyright: "",
        imageSliders: []
    });
    const [logoPreview, setLogoPreview] = useState("");
    const [sliderPreviews, setSliderPreviews] = useState([]);
    const [originalSliders, setOriginalSliders] = useState([]); // Track original sliders for change detection
    const [errorMessage, setErrorMessage] = useState(""); // Inline error message for banner

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const data = await getGeneralSettings();
            console.log("Settings data:", data);
            if (data) {
                setSettings({
                    websiteName: data.websiteName || "",
                    logo: data.logo || "",
                    phone: data.phone || "",
                    email: data.email || "",
                    address: data.address || "",
                    slogan: data.slogan || "",
                    copyright: data.copyright || "",
                    imageSliders: Array.isArray(data.imageSliders) ? data.imageSliders : []
                });
                if (data.logo) {
                    setLogoPreview(data.logo);
                }
                if (data.imageSliders) {
                    setSliderPreviews(data.imageSliders);
                    setOriginalSliders(data.imageSliders); // Store original sliders
                }
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
            toast.error("Không thể tải cài đặt!", { position: "top-right" });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSettings(prev => ({
                ...prev,
                logo: file
            }));
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSliderChange = (e) => {
        const files = Array.from(e.target.files);
        const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        const validFiles = files.filter(file => validImageTypes.includes(file.type));

        if (validFiles.length + settings.imageSliders.length > 10) {
            setErrorMessage("Tối đa 10 ảnh banner!");
            return;
        }

        if (validFiles.length < files.length) {
            setErrorMessage("Một số file không phải định dạng ảnh hợp lệ!");
            const validOnly = validFiles.filter(file => validImageTypes.includes(file.type));
            if (validOnly.length + settings.imageSliders.length <= 10) {
                setSettings(prev => ({
                    ...prev,
                    imageSliders: [...prev.imageSliders, ...validOnly]
                }));
                const previews = validOnly.map(file => URL.createObjectURL(file));
                setSliderPreviews(prev => [...prev, ...previews]);
                setErrorMessage("");
            }
            return;
        }

        setSettings(prev => ({
            ...prev,
            imageSliders: [...prev.imageSliders, ...validFiles]
        }));
        const previews = validFiles.map(file => URL.createObjectURL(file));
        setSliderPreviews(prev => [...prev, ...previews]);
        setErrorMessage("");
    };

    const handleRemoveSlider = (index) => {
        setSettings(prev => ({
            ...prev,
            imageSliders: prev.imageSliders.filter((_, i) => i !== index)
        }));
        setSliderPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (
            !settings.websiteName ||
            !settings.phone ||
            !settings.email ||
            !settings.address ||
            !settings.slogan ||
            !settings.copyright
        ) {
            toast.error("Vui lòng điền đầy đủ thông tin!", { position: "top-right" });
            return;
        }

        try {
            setLoading(true);

            // Update general settings
            const generalResponse = await updateGeneralSettings(settings);
            console.log("updateGeneralSettings response:", generalResponse);

            // Update sliders only if there are changes (new files or removed items)
            let sliderResponse = { code: 200 };
            const hasSliderChanges = settings.imageSliders.some(item => item instanceof File) ||
                JSON.stringify(settings.imageSliders.map(item =>
                    item instanceof File ? item.name : item)) !==
                JSON.stringify(originalSliders);
            if (hasSliderChanges) {
                setUploading(true);
                sliderResponse = await updateSliderSettings(settings.imageSliders);
                console.log("updateSliderSettings response:", sliderResponse);
            }

            // Show toast only if general settings update succeeds
            if (generalResponse.code === 200) {
                toast.success("Cập nhật thành công!", {
                    position: "top-right",
                    className: "success-toast",
                    style: {
                        backgroundColor: `${colors.greenAccent[500]} !important`,
                        color: "white",
                    }
                });
                // Update state with the latest data from the server
                const updatedData = await getGeneralSettings();
                if (updatedData) {
                    setSettings(prev => ({
                        ...prev,
                        imageSliders: Array.isArray(updatedData.imageSliders) ? updatedData.imageSliders : []
                    }));
                    setSliderPreviews(Array.isArray(updatedData.imageSliders) ? updatedData.imageSliders : []);
                    setOriginalSliders(Array.isArray(updatedData.imageSliders) ? updatedData.imageSliders : []);
                }
                // Reload the page after successful update
                window.location.reload();
            } else {
                toast.error(
                    generalResponse.message || "Cập nhật thất bại!",
                    { position: "top-right" }
                );
            }

            // If slider update fails, show error toast
            if (hasSliderChanges && sliderResponse.code !== 200) {

            }

        } catch (error) {
            console.error("Error updating settings:", error);
            toast.error(error.response?.data?.message || "Có lỗi xảy ra!", { position: "top-right" });
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    return (
        <Box>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                zIndex={9999}
            />
            <Box sx={{ margin: '40px' }}>
                <Card sx={{ backgroundColor: colors.primary[400] }}>
                    <CardHeader
                        title={
                            <Typography variant="h4" color={colors.grey[100]}>
                                Cài đặt website
                            </Typography>
                        }
                    />
                    <Divider />
                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                {/* Logo section */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                    {logoPreview && (
                                        <Box>
                                            <img
                                                src={logoPreview}
                                                alt="Logo preview"
                                                style={{
                                                    width: '250px',
                                                    height: '250px',
                                                    objectFit: 'contain',
                                                    borderRadius: '50%',
                                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                                                    border: '2px solid #000'
                                                }}
                                            />
                                        </Box>
                                    )}
                                    <Box sx={{ position: 'relative', display: 'inline-block' }}>
                                        <Button
                                            sx={{
                                                backgroundColor: colors.blueAccent[200],
                                                color: "white",
                                                "&:hover": {
                                                    backgroundColor: colors.blueAccent[1100],
                                                },
                                            }}
                                            variant="contained"
                                            component="label"
                                            disabled={loading}
                                        >
                                            Chọn logo
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleLogoChange}
                                                hidden
                                            />
                                        </Button>
                                    </Box>
                                </Box>

                                {/* Form fields */}
                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
                                    <TextField
                                        fullWidth
                                        label="Tên website"
                                        name="websiteName"
                                        value={settings.websiteName}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Số điện thoại"
                                        name="phone"
                                        value={settings.phone}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        name="email"
                                        type="email"
                                        value={settings.email}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Địa chỉ"
                                        name="address"
                                        value={settings.address}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Slogan"
                                        name="slogan"
                                        value={settings.slogan}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        sx={{ gridColumn: '1 / -1' }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Copyright"
                                        name="copyright"
                                        value={settings.copyright}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        sx={{ gridColumn: '1 / -1' }}
                                    />
                                </Box>

                                {/* Slider section */}
                                <Box sx={{ mt: 4 }}>
                                    <Typography variant="h5" color={colors.grey[100]} mb={2}>
                                        Banner
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                                        {sliderPreviews.length > 0 ? (
                                            sliderPreviews.map((preview, index) => (
                                                <Box key={index} sx={{ position: 'relative' }}>
                                                    <img
                                                        src={preview}
                                                        alt={`Slider ${index}`}
                                                        style={{
                                                            width: '200px',
                                                            height: '100px',
                                                            objectFit: 'cover',
                                                            borderRadius: '4px',
                                                            border: '1px solid #ccc'
                                                        }}
                                                        onError={(e) => {
                                                            e.target.src = "https://via.placeholder.com/200x100";
                                                        }}
                                                    />
                                                    <IconButton
                                                        size="small"
                                                        sx={{
                                                            position: 'absolute',
                                                            top: -10,
                                                            right: -10,
                                                            backgroundColor: colors.redAccent[500],
                                                            color: "white",
                                                            "&:hover": {
                                                                backgroundColor: colors.redAccent[700],
                                                            },
                                                        }}
                                                        onClick={() => handleRemoveSlider(index)}
                                                    >
                                                        <CloseIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            ))
                                        ) : (
                                            <Typography variant="caption" color={colors.grey[100]}>
                                                Chưa có banner
                                            </Typography>
                                        )}
                                    </Box>
                                    {errorMessage && (
                                        <Typography variant="caption" color={colors.redAccent[500]} mb={2}>
                                            {errorMessage}
                                        </Typography>
                                    )}
                                    <Button
                                        sx={{
                                            backgroundColor: colors.blueAccent[200],
                                            color: "white",
                                            "&:hover": {
                                                backgroundColor: colors.blueAccent[1100],
                                            },
                                        }}
                                        variant="contained"
                                        component="label"
                                        disabled={loading || uploading || settings.imageSliders.length >= 10}
                                    >
                                        {uploading ? <CircularProgress size={24} /> : "Thêm banner"}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleSliderChange}
                                            hidden
                                        />
                                    </Button>
                                </Box>

                                {/* Submit button */}
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="success"
                                        disabled={loading || uploading}
                                    >
                                        {loading ? <CircularProgress size={24} /> : "Cập nhật"}
                                    </Button>
                                </Box>
                            </Box>
                        </form>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};

export default Setting;