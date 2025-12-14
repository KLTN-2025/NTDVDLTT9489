import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    Dialog,
    TextField,
    CircularProgress,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Avatar,
    IconButton,
    DialogContent,
    Pagination,
    DialogTitle,
    DialogActions,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { toast } from "react-toastify";
import { Formik } from "formik";
import * as yup from "yup";
import { getHotels, getRooms, createRoom, updateRoom, deleteRoom, changeRoomStatus } from "./HotelApi";
import { useAdminAuth } from "../../context/AdminContext";
import { useNavigate } from "react-router-dom";

const FALLBACK_IMAGE = "https://placehold.co/60x40";

const RoomManagement = ({ open = false, onClose, hotel: propHotel, selectedHotelId, selectedHotelName, onSuccess }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { adminToken } = useAdminAuth();
    const navigate = useNavigate();
    const [hotels, setHotels] = useState([]);
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openForm, setOpenForm] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [isView, setIsView] = useState(false);
    const [currentRoomId, setCurrentRoomId] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [openImageDialog, setOpenImageDialog] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const limitItems = 10;
    const [totalPages, setTotalPages] = useState(1);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [roomToDelete, setRoomToDelete] = useState(null);

    const fetchHotels = async () => {
        setLoading(true);
        try {
            const token = adminToken || localStorage.getItem("adminToken");
            const response = await getHotels(token);
            if (response.code === 200 && Array.isArray(response.data)) {
                setHotels(response.data);
                if (selectedHotelId) {
                    const matchedHotel = response.data.find(h => h._id === selectedHotelId);
                    if (matchedHotel) {
                        setSelectedHotel(matchedHotel);
                    } else {
                        toast.error("Khách sạn không tồn tại!");
                    }
                }
                if (response.data.length === 0) {
                    toast.info("Không có khách sạn nào để hiển thị!");
                }
            } else {
                toast.error(response.message || "Không thể tải danh sách khách sạn!");
                setHotels([]);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Không thể tải danh sách khách sạn!";
            toast.error(errorMessage);
            setHotels([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchRooms = async (hotelId, page = 1) => {
        if (!hotelId) {
            setRooms([]);
            setTotalPages(1);
            return;
        }
        setLoading(true);
        try {
            const token = adminToken || localStorage.getItem("adminToken");
            const params = { page, limit: limitItems };
            const response = await getRooms(hotelId, token, params);
            if (response.code === 200 && Array.isArray(response.data)) {
                const formattedData = response.data.map((item, index) => ({
                    ...item,
                    id: item._id,
                    stt: (page - 1) * limitItems + index + 1,
                    images: Array.isArray(item.images) ? item.images.filter(img => typeof img === 'string' && img.trim() !== '') : [],
                }));
                setRooms(formattedData);
                setTotalPages(response.totalPage || 1);
                if (formattedData.length === 0) {
                    toast.info("Không có phòng nào để hiển thị!", { position: "top-right" });
                }
            } else {
                toast.error(response.message || "Không thể tải danh sách phòng!");
                setRooms([]);
                setTotalPages(1);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Không thể tải danh sách phòng!";
            toast.error(errorMessage);
            setRooms([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open && adminToken) {
            fetchHotels();
        }
    }, [open, adminToken]);

    useEffect(() => {
        if (open && selectedHotel?._id) {
            fetchRooms(selectedHotel._id, currentPage);
        }
    }, [open, selectedHotel, currentPage]);

    const handleHotelChange = (event) => {
        const hotelId = event.target.value;
        const hotel = hotels.find((h) => h._id === hotelId) || null;
        setSelectedHotel(hotel);
        setCurrentPage(1);
        if (hotel) {
            fetchRooms(hotel._id, 1);
        } else {
            setRooms([]);
            setTotalPages(1);
        }
    };

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
        if (selectedHotel?._id) {
            fetchRooms(selectedHotel._id, value);
        }
    };

    const handleChangeStatus = async (roomId, currentStatus) => {
        try {
            const token = adminToken || localStorage.getItem("adminToken");
            const newStatus = currentStatus === "active" ? "inactive" : "active";
            const response = await changeRoomStatus(selectedHotel._id, roomId, newStatus, token);
            if (response.code === 200) {
                fetchRooms(selectedHotel._id, currentPage);
                toast.success("Cập nhật trạng thái phòng thành công!", { position: "top-right" });
            } else {
                toast.error(response.message || "Cập nhật trạng thái thất bại!", { position: "top-right" });
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Cập nhật trạng thái thất bại!", { position: "top-right" });
        }
    };

    const handleOpenForm = (room = null, mode = 'edit') => {
        if (!selectedHotel?._id) {
            toast.error("Vui lòng chọn một khách sạn trước!");
            return;
        }
        setCurrentRoomId(room?._id || null);
        setIsEdit(mode === 'edit' && room !== null);
        setIsView(mode === 'view');
        setOpenForm(true);
    };

    const handleCloseForm = () => {
        setOpenForm(false);
        setCurrentRoomId(null);
        setIsEdit(false);
        setIsView(false);
    };

    const handleOpenDeleteDialog = (roomId) => {
        setRoomToDelete(roomId);
        setOpenDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setRoomToDelete(null);
    };

    const handleConfirmDelete = async () => {
        if (!selectedHotel?._id || !roomToDelete) {
            toast.error("Vui lòng chọn một khách sạn trước!");
            return;
        }
        try {
            const token = adminToken || localStorage.getItem("adminToken");
            const response = await deleteRoom(selectedHotel._id, roomToDelete, token);
            if (response.code === 200) {
                fetchRooms(selectedHotel._id, currentPage);
                toast.success("Xóa phòng thành công!");
                onSuccess();
            } else {
                toast.error(response.message || "Xóa phòng thất bại!");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Xóa phòng thất bại!");
        } finally {
            handleCloseDeleteDialog();
        }
    };

    const handleImageClick = (images, index) => {
        setSelectedImage(images[index]);
        setCurrentImageIndex(index);
        setOpenImageDialog(true);
    };

    const handleNextImage = (images) => {
        const nextIndex = (currentImageIndex + 1) % images.length;
        setSelectedImage(images[nextIndex]);
        setCurrentImageIndex(nextIndex);
    };

    const handlePrevImage = (images) => {
        const prevIndex = (currentImageIndex - 1 + images.length) % images.length;
        setSelectedImage(images[prevIndex]);
        setCurrentImageIndex(prevIndex);
    };

    const handleCloseImageDialog = () => {
        setOpenImageDialog(false);
        setSelectedImage(null);
        setCurrentImageIndex(0);
    };

    const tryLoadImage = (images, index, retries = 3) => {
        return new Promise((resolve) => {
            if (!images || !Array.isArray(images) || images.length === 0) {
                return resolve(FALLBACK_IMAGE);
            }

            let currentIndex = index % images.length;
            let attempts = retries;

            const loadImage = (url) => {
                if (typeof url !== 'string' || url.trim() === '' || !url.match(/\.(jpeg|jpg|png|gif|webp)$/i)) {
                    return tryNextImage();
                }

                const img = new Image();
                img.src = url;
                img.onload = () => {
                    resolve(url);
                };
                img.onerror = () => {
                    if (attempts > 0) {
                        attempts--;
                        setTimeout(() => loadImage(url), 2000);
                    } else {
                        tryNextImage();
                    }
                };
            };

            const tryNextImage = () => {
                const nextIndex = (currentIndex + 1) % images.length;
                if (nextIndex === index) {
                    resolve(FALLBACK_IMAGE);
                } else {
                    tryLoadImage(images, nextIndex, retries).then(resolve);
                }
            };

            loadImage(images[currentIndex]);
        });
    };

    const columns = [
        { field: "stt", headerName: "STT", flex: 0.3 },
        { field: "name", headerName: "Tên phòng", flex: 1 },
        {
            field: "price",
            headerName: "Giá (VND)",
            flex: 0.6,
            renderCell: ({ value }) => (value ? value.toLocaleString("vi-VN") : "N/A"),
        },
        { field: "amenities", headerName: "Tiện nghi", flex: 1 },
        { field: "availableRooms", headerName: "Số phòng sẵn có", flex: 1 },
        {
            field: "images",
            headerName: "Ảnh",
            flex: 1,
            renderCell: ({ value }) => (
                <Box display="flex" gap={1} sx={{ py: 1 }}>
                    {value && value.length > 0 ? (
                        <Box display="flex" alignItems="center" gap={1}>
                            <IconButton
                                onClick={() => handlePrevImage(value)}
                                disabled={value.length <= 1}
                                sx={{
                                    color: colors.grey[100],
                                    "&:hover": {
                                        backgroundColor: colors.blueAccent[700],
                                    },
                                }}
                            >
                                <ChevronLeftIcon />
                            </IconButton>
                            <Box
                                component="img"
                                src={value[currentImageIndex % value.length] || FALLBACK_IMAGE}
                                alt={`Room ${currentImageIndex}`}
                                onError={(e) => {
                                    tryLoadImage(value, (currentImageIndex + 1) % value.length).then((url) => {
                                        e.target.src = url;
                                    });
                                }}
                                sx={{
                                    width: 60,
                                    height: 40,
                                    objectFit: "cover",
                                    borderRadius: 1,
                                    cursor: "pointer",
                                    "&:hover": {
                                        opacity: 0.8,
                                    },
                                }}
                                onClick={() => handleImageClick(value, currentImageIndex % value.length)}
                            />
                            <IconButton
                                onClick={() => handleNextImage(value)}
                                disabled={value.length <= 1}
                                sx={{
                                    color: colors.grey[100],
                                    "&:hover": {
                                        backgroundColor: colors.blueAccent[700],
                                    },
                                }}
                            >
                                <ChevronRightIcon />
                            </IconButton>
                        </Box>
                    ) : (
                        <Typography variant="caption" sx={{ py: 1 }}>Chưa có ảnh</Typography>
                    )}
                </Box>
            ),
        },
        {
            field: "status",
            headerName: "Trạng thái",
            flex: 1,
            renderCell: ({ row }) => (
                <Button
                    size="small"
                    variant="contained"
                    color={row.status === "active" ? "success" : "warning"}
                    onClick={() => handleChangeStatus(row._id, row.status)}
                >
                    {row.status === "active" ? "Hoạt động" : "Tạm ngưng"}
                </Button>
            ),
        },
        {
            field: "actions",
            headerName: "Hành động",
            flex: 1.5,
            renderCell: ({ row }) => (
                <Box display="flex" gap={1} sx={{ alignItems: "center", mt: "20px" }}>
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleOpenForm(row, 'view')}
                    >
                        Xem
                    </Button>
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: colors.blueAccent[300],
                            color: "white",
                            "&:hover": {
                                backgroundColor: colors.blueAccent[200],
                            },
                        }}
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenForm(row, 'edit')}
                    >
                        Sửa
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleOpenDeleteDialog(row._id)}
                    >
                        Xóa
                    </Button>
                </Box>
            ),
        },
    ];

    const RoomForm = ({ room, onClose, onSuccess }) => {
        const [imagePreviews, setImagePreviews] = useState(room?.images || []);
        const [imageFiles, setImageFiles] = useState(room?.images ? room.images.map(url => ({ url })) : []);
        const [formLoading, setFormLoading] = useState(false);

        const handleImagesChange = (event, setFieldValue) => {
            const files = Array.from(event.target.files);
            const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
            const validFiles = files.filter(file => validImageTypes.includes(file.type));

            if (validFiles.length + imageFiles.length > 10) {
                toast.error("Tối đa 10 ảnh!");
                return;
            }

            if (validFiles.length < files.length) {
                toast.warn("Một số file không phải định dạng ảnh hợp lệ!");
            }

            setImageFiles(prev => [...prev, ...validFiles]);
            setFieldValue("images", [...imageFiles, ...validFiles]);
            const previews = validFiles.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...previews]);
        };

        const handleRemoveImage = (index, setFieldValue) => {
            const newPreviews = imagePreviews.filter((_, i) => i !== index);
            const newFiles = imageFiles.filter((_, i) => i !== index);
            setImagePreviews(newPreviews);
            setImageFiles(newFiles);
            setFieldValue("images", newFiles);
        };

        const handleFormSubmit = async (values) => {
            setFormLoading(true);
            try {
                // Kiểm tra ít nhất một ảnh
                if (imageFiles.length === 0) {
                    toast.error("Vui lòng chọn ít nhất một ảnh hợp lệ!");
                    setFormLoading(false);
                    return;
                }

                const formData = new FormData();
                formData.append("name", values.name);
                formData.append("price", parseFloat(values.price));
                formData.append("amenities", values.amenities);
                formData.append("availableRooms", parseInt(values.availableRooms));

                // Gửi tất cả ảnh (mới và cũ)
                imageFiles.forEach((file, index) => {
                    if (file.url) {
                        formData.append(`images[${index}]`, file.url);
                    } else {
                        formData.append("images", file);
                    }
                });

                // Log dữ liệu gửi đi để debug
                console.log("FormData gửi đi:", [...formData.entries()]);

                const token = adminToken || localStorage.getItem("adminToken");
                let response;
                if (room && isEdit) {
                    response = await updateRoom(selectedHotel._id, room._id, formData, token);
                } else {
                    response = await createRoom(selectedHotel._id, formData, token);
                }

                console.log("Phản hồi từ server:", response);

                if (response.code === 200) {
                    toast.success(room && isEdit ? "Cập nhật phòng thành công!" : "Thêm phòng thành công!");
                    onSuccess(response.data);
                    onClose();
                    fetchRooms(selectedHotel._id, currentPage);
                } else {
                    toast.error(response.message || "Thao tác thất bại!");
                }
            } catch (err) {
                if (err.response?.status === 400) {
                    const errorMessage =
                        err.response?.data?.message ||
                        err.response?.data?.errors?.join(", ") ||
                        "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại!";
                    toast.error(errorMessage);
                } else if (err.response?.status === 401) {
                    toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
                    localStorage.removeItem("adminToken");
                    navigate("/loginadmin");
                } else {
                    toast.error(err.response?.data?.message || "Thao tác thất bại!");
                }
                console.error("Lỗi khi gửi yêu cầu:", err.response?.data || err);
            } finally {
                setFormLoading(false);
            }
        };

        return (
            <Box>
                <DialogTitle>
                    {isView ? "Chi tiết phòng" : (room && isEdit ? "Chỉnh sửa phòng" : "Thêm phòng mới")}
                </DialogTitle>
                <DialogContent>
                    <Formik
                        onSubmit={handleFormSubmit}
                        initialValues={
                            room
                                ? {
                                    name: room.name || "",
                                    price: room.price ? room.price.toString() : "",
                                    amenities: room.amenities || "",
                                    availableRooms: room.availableRooms ? room.availableRooms.toString() : "",
                                    images: [],
                                }
                                : initialValues
                        }
                        validationSchema={roomSchema}
                        enableReinitialize
                    >
                        {({
                            values,
                            errors,
                            touched,
                            handleBlur,
                            handleChange,
                            handleSubmit,
                            setFieldValue,
                        }) => (
                            <form onSubmit={handleSubmit}>
                                <Box
                                    display="grid"
                                    gap="20px"
                                    gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                                    sx={{ "& > div": { gridColumn: "span 4" } }}
                                >
                                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <Typography variant="body1" mb={1}>
                                            Ảnh phòng
                                        </Typography>
                                        <Box display="flex" flexWrap="wrap" gap={1} mb={1}>
                                            {imagePreviews.length > 0 ? (
                                                imagePreviews.map((preview, index) => (
                                                    <Box key={index} sx={{ position: "relative" }}>
                                                        <Avatar
                                                            src={preview}
                                                            alt={`Preview ${index}`}
                                                            sx={{ width: 60, height: 60 }}
                                                            onError={(e) => {
                                                                e.target.src = FALLBACK_IMAGE;
                                                            }}
                                                        />
                                                        {!isView && (
                                                            <IconButton
                                                                size="small"
                                                                sx={{
                                                                    position: "absolute",
                                                                    top: -10,
                                                                    right: -10,
                                                                    backgroundColor: colors.redAccent[500],
                                                                    color: "white",
                                                                    "&:hover": {
                                                                        backgroundColor: colors.redAccent[700],
                                                                    },
                                                                }}
                                                                onClick={() => handleRemoveImage(index, setFieldValue)}
                                                            >
                                                                <CloseIcon fontSize="small" />
                                                            </IconButton>
                                                        )}
                                                    </Box>
                                                ))
                                            ) : (
                                                <Typography variant="caption">Chưa có ảnh</Typography>
                                            )}
                                        </Box>
                                        {!isView && (
                                            <Button
                                                variant="contained"
                                                component="label"
                                                color="primary"
                                                sx={{ mb: 1 }}
                                            >
                                                Chọn ảnh (tối đa 10)
                                                <input
                                                    type="file"
                                                    hidden
                                                    multiple
                                                    accept="image/*"
                                                    onChange={(e) => handleImagesChange(e, setFieldValue)}
                                                />
                                            </Button>
                                        )}
                                    </Box>

                                    <TextField
                                        fullWidth
                                        variant="filled"
                                        type="text"
                                        label="Tên phòng"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        value={values.name}
                                        name="name"
                                        error={!!touched.name && !!errors.name}
                                        helperText={touched.name && errors.name}
                                        disabled={isView}
                                    />
                                    <TextField
                                        fullWidth
                                        variant="filled"
                                        type="number"
                                        label="Giá phòng (VND)"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        value={values.price}
                                        name="price"
                                        error={!!touched.price && !!errors.price}
                                        helperText={touched.price && errors.price}
                                        disabled={isView}
                                    />
                                    <TextField
                                        fullWidth
                                        variant="filled"
                                        type="text"
                                        label="Tiện nghi"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        value={values.amenities}
                                        name="amenities"
                                        error={!!touched.amenities && !!errors.amenities}
                                        helperText={touched.amenities && errors.amenities}
                                        multiline
                                        rows={3}
                                        disabled={isView}
                                    />
                                    <TextField
                                        fullWidth
                                        variant="filled"
                                        type="number"
                                        label="Số phòng sẵn có"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        value={values.availableRooms}
                                        name="availableRooms"
                                        error={!!touched.availableRooms && !!errors.availableRooms}
                                        helperText={touched.availableRooms && errors.availableRooms}
                                        disabled={isView}
                                    />
                                </Box>
                                <Box display="flex" justifyContent="end" mt="20px" gap={2}>
                                    <Button
                                        variant="contained"
                                        onClick={onClose}
                                        disabled={formLoading}
                                    >
                                        {isView ? "Đóng" : "Hủy"}
                                    </Button>
                                    {!isView && (
                                        <Button
                                            type="submit"
                                            color="secondary"
                                            variant="contained"
                                            disabled={formLoading}
                                        >
                                            {formLoading ? "Đang xử lý..." : (room && isEdit ? "Cập nhật" : "Thêm")}
                                        </Button>
                                    )}
                                </Box>
                            </form>
                        )}
                    </Formik>
                </DialogContent>
            </Box>
        );
    };

    return (
        <Box m="20px">
            <Typography variant="h3" color={colors.grey[100]} mb={2}>
                Quản lý phòng
            </Typography>
            <Box display="flex" justifyContent="space-between" mb={2} gap={2}>
                <Box display="flex" gap={2}>
                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel id="hotel-select-label">Chọn khách sạn</InputLabel>
                        <Select
                            labelId="hotel-select-label"
                            value={selectedHotel?._id || ""}
                            label="Chọn khách sạn"
                            onChange={handleHotelChange}
                            disabled={loading || !!selectedHotelId}
                        >
                            <MenuItem value="">
                                <em>{loading ? "Đang tải..." : "Chọn khách sạn"}</em>
                            </MenuItem>
                            {hotels.map((hotel) => (
                                <MenuItem key={hotel._id} value={hotel._id}>
                                    {hotel.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
                <Box display="flex" gap={2}>
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenForm()}
                        disabled={!selectedHotel?._id || loading}
                    >
                        Thêm phòng
                    </Button>
                </Box>
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
                    <CircularProgress />
                    <Typography ml={2}>Đang tải danh sách phòng...</Typography>
                </Box>
            ) : hotels.length === 0 ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
                    <Typography variant="h4" color={colors.grey[100]}>
                        Không có khách sạn nào để quản lý phòng!
                    </Typography>
                </Box>
            ) : !selectedHotel?._id ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
                    <Typography variant="h4" color={colors.grey[100]}>
                        Vui lòng chọn một khách sạn để quản lý phòng!
                    </Typography>
                </Box>
            ) : rooms.length === 0 ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
                    <Typography variant="h4" color={colors.grey[100]}>
                        Không có phòng nào để hiển thị
                    </Typography>
                </Box>
            ) : (
                <Box
                    height="60vh"
                    sx={{
                        "& .MuiDataGrid-root": {
                            border: "none",
                        },
                        "& .MuiDataGrid-cell": {
                            borderBottom: "none",
                        },
                        "& .MuiDataGrid-columnHeaders": {
                            backgroundColor: colors.blueAccent[700],
                            borderBottom: "none",
                            color: colors.grey[100],
                            fontSize: "14px",
                            fontWeight: "bold",
                        },
                        "& .MuiDataGrid-columnHeader": {
                            backgroundColor: colors.blueAccent[700],
                            color: colors.grey[100],
                            fontSize: "14px",
                            fontWeight: "bold",
                        },
                        "& .MuiDataGrid-columnHeaderTitle": {
                            color: colors.grey[100],
                            fontWeight: "bold",
                        },
                        "& .MuiDataGrid-virtualScroller": {
                            backgroundColor: colors.primary[400],
                        },
                        "& .MuiDataGrid-footerContainer": {
                            borderTop: "none",
                            backgroundColor: colors.blueAccent[700],
                        },
                        "& .MuiCheckbox-root": {
                            color: `${colors.greenAccent[200]} !important`,
                        },
                    }}
                >
                    <DataGrid
                        rows={rooms}
                        columns={columns}
                        getRowId={(row) => row._id}
                        pagination={false}
                        hideFooter={true}
                    />
                    <Box display="flex" justifyContent="center" mt={2}>
                        <Pagination
                            count={totalPages}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="primary"
                        />
                    </Box>
                </Box>
            )}

            <Dialog open={openForm} onClose={handleCloseForm} maxWidth="md" fullWidth>
                <Box
                    sx={{
                        bgcolor: colors.primary[400],
                        p: 4,
                        borderRadius: 2,
                    }}
                >
                    <RoomForm
                        room={selectedHotel ? rooms.find(r => r._id === currentRoomId) : null}
                        onClose={handleCloseForm}
                        onSuccess={(newRoom) => {
                            fetchRooms(selectedHotel._id, currentPage);
                            handleCloseForm();
                            onSuccess();
                        }}
                    />
                </Box>
            </Dialog>

            <Dialog
                open={openImageDialog}
                onClose={handleCloseImageDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogContent sx={{ p: 0, position: "relative" }}>
                    <Box
                        component="img"
                        src={selectedImage || FALLBACK_IMAGE}
                        alt="Room image"
                        onError={(e) => {
                            const images = rooms.find(r => r.images.includes(selectedImage))?.images || [];
                            tryLoadImage(images, (currentImageIndex + 1) % images.length).then((url) => {
                                setSelectedImage(url);
                            });
                        }}
                        sx={{
                            width: "100%",
                            height: "auto",
                            objectFit: "contain",
                        }}
                    />
                    <IconButton
                        onClick={handleCloseImageDialog}
                        sx={{
                            position: "absolute",
                            right: 8,
                            top: 8,
                            color: "white",
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                            "&:hover": {
                                backgroundColor: "rgba(0, 0, 0, 0.7)",
                            },
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                    {selectedImage && rooms.find(r => r.images.includes(selectedImage))?.images.length > 1 && (
                        <>
                            <IconButton
                                onClick={() => handlePrevImage(rooms.find(r => r.images.includes(selectedImage)).images)}
                                sx={{
                                    position: "absolute",
                                    left: 8,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: "white",
                                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                                    "&:hover": {
                                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                                    },
                                }}
                            >
                                <ChevronLeftIcon />
                            </IconButton>
                            <IconButton
                                onClick={() => handleNextImage(rooms.find(r => r.images.includes(selectedImage)).images)}
                                sx={{
                                    position: "absolute",
                                    right: 8,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: "white",
                                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                                    "&:hover": {
                                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                                    },
                                }}
                            >
                                <ChevronRightIcon />
                            </IconButton>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog
                open={openDeleteDialog}
                onClose={handleCloseDeleteDialog}
            >
                <DialogTitle style={{ fontWeight: 'bold' }}>Xác nhận xóa phòng</DialogTitle>
                <DialogContent>
                    <Typography>
                        Bạn có chắc chắn muốn xóa phòng này? Hành động này không thể hoàn tác.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog} variant="contained">
                        Hủy
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        color="error"
                        variant="contained"
                        autoFocus
                    >
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

const roomSchema = yup.object().shape({
    name: yup.string().required("Vui lòng nhập tên phòng"),
    price: yup
        .number()
        .required("Vui lòng nhập giá phòng")
        .positive("Giá phòng phải là số dương"),
    amenities: yup.string().required("Vui lòng nhập tiện nghi"),
    availableRooms: yup
        .number()
        .required("Vui lòng nhập số phòng sẵn có")
        .integer("Số phòng phải là số nguyên")
        .min(0, "Số phòng không được âm"),
});

const initialValues = {
    name: "",
    price: "",
    amenities: "",
    availableRooms: "",
    images: [],
};

export default RoomManagement;