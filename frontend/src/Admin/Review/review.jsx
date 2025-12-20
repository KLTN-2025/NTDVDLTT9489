import React, { useState, useEffect, useCallback } from "react";
import {
    Box,
    Button,
    Typography,
    IconButton,
    useTheme,
    Paper,
    InputBase,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Pagination,
    CircularProgress,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import useMediaQuery from "@mui/material/useMediaQuery";
import { tokens } from "../../theme";
import Header from "../../components/Scenes/Header";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getHotelReviews, getHotels, deleteReview, getTours, getTourReviews, deleteTourReview } from "./reviewApi";
import { getContactDetail } from "../contacts/ContactsApi";
import { useAdminAuth } from "../../context/AdminContext";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";

const Reviews = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const { adminToken } = useAdminAuth();
    const navigate = useNavigate();
    const [reviewType, setReviewType] = useState("hotel"); // "hotel" or "tour"
    const [hotels, setHotels] = useState([]);
    const [tours, setTours] = useState([]);
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [selectedTour, setSelectedTour] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [sortOption, setSortOption] = useState("stt_asc");
    const [sortModel, setSortModel] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [userCache, setUserCache] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limitItems = 10;
    const [selectedReview, setSelectedReview] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);
    const [viewedReviews, setViewedReviews] = useState(() => {
        const saved = localStorage.getItem("viewedReviews");
        return saved ? JSON.parse(saved) : {};
    });

    useEffect(() => {
        localStorage.setItem("viewedReviews", JSON.stringify(viewedReviews));
    }, [viewedReviews]);

    const fetchHotels = async () => {
        setLoading(true);
        try {
            const response = await getHotels(adminToken);
            if (response.code === 200 && Array.isArray(response.data)) {
                setHotels(response.data);
                if (response.data.length === 0) {
                    toast.info("Không có khách sạn nào để hiển thị!", { position: "top-right" });
                } else {
                    setSelectedHotel(response.data[0]);
                }
            } else {
                toast.error(response.message || "Không thể tải danh sách khách sạn!", {
                    position: "top-right",
                });
                setHotels([]);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Không thể tải danh sách khách sạn!", {
                position: "top-right",
            });
            if (err.response?.status === 401) {
                toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
                localStorage.removeItem("adminToken");
                navigate("/loginadmin");
            }
            setHotels([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchTours = async () => {
        setLoading(true);
        try {
            const response = await getTours(adminToken);
            console.log("fetchTours response:", response);
            if (response.code === 200 && Array.isArray(response.tours)) {
                console.log("Tours data:", response.tours);
                setTours(response.tours);
                if (response.tours.length === 0) {
                    toast.info("Không có tour nào để hiển thị!", { position: "top-right" });
                } else {
                    setSelectedTour(response.tours[0]);
                    console.log("Selected tour:", response.tours[0]);
                }
            } else {
                toast.error(response.message || "Không thể tải danh sách tour!", {
                    position: "top-right",
                });
                setTours([]);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Không thể tải danh sách tour!", {
                position: "top-right",
            });
            if (err.response?.status === 401) {
                toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
                localStorage.removeItem("adminToken");
                navigate("/loginadmin");
            }
            setTours([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserDetails = async (userId) => {
        if (userCache[userId]) {
            return userCache[userId];
        }
        try {
            const response = await getContactDetail(userId, adminToken);
            if (response.code === 200 && response.data) {
                const userData = {
                    username: response.data.username || response.data.fullName || "N/A",
                    email: response.data.email || "N/A",
                };
                setUserCache((prev) => ({ ...prev, [userId]: userData }));
                return userData;
            }
            return { username: "N/A", email: "N/A" };
        } catch (err) {
            console.error(`Error fetching user ${userId}:`, err);
            return { username: "N/A", email: "N/A" };
        }
    };

    const fetchReviews = useCallback(
        async (type, itemId, page = 1, search = "", sortKey = "", sortValue = "") => {
            if (!itemId) return;
            console.log("fetchReviews called with:", { type, itemId, page, search, sortKey, sortValue });
            setLoading(true);
            try {
                const params = { page, limit: limitItems };
                if (search) params.search = search;
                if (sortKey && sortValue) {
                    params.sortKey = sortKey;
                    params.sortValue = sortValue;
                }
                
                const response = type === "hotel" 
                    ? await getHotelReviews(itemId, params, adminToken)
                    : await getTourReviews(itemId, params, adminToken);
                
                console.log("fetchReviews response:", response);
                    
                if (response && Array.isArray(response.reviews)) {
                    const totalRecords = response.totalRecords || response.reviews.length;
                    const reviewsWithUsers = await Promise.all(
                        response.reviews.map(async (review, index) => {
                            const userData = await fetchUserDetails(review.user_id);
                            let stt;
                            if (sortKey === "_id" && sortValue === "desc") {
                                stt = totalRecords - ((page - 1) * limitItems + index);
                            } else {
                                stt = (page - 1) * limitItems + index + 1;
                            }
                            return {
                                ...review,
                                id: review._id,
                                userData,
                                stt,
                                viewed: !!viewedReviews[review._id],
                                type: type
                            };
                        })
                    );
                    setReviews(reviewsWithUsers);
                    setTotalPages(response.totalPage || 1);
                    if (reviewsWithUsers.length === 0) {
                        toast.info(
                            search
                                ? `Không tìm thấy đánh giá nào với từ khóa "${search}"!`
                                : "Không có đánh giá nào để hiển thị!",
                            { position: "top-right" }
                        );
                    }
                } else {
                    toast.error("Dữ liệu đánh giá không hợp lệ!", { position: "top-right" });
                    setReviews([]);
                    setTotalPages(1);
                }
            } catch (err) {
                toast.error(err.response?.data?.message || "Không thể tải danh sách đánh giá!", {
                    position: "top-right",
                });
                if (err.response?.status === 401) {
                    toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
                    localStorage.removeItem("adminToken");
                    navigate("/loginadmin");
                }
                setReviews([]);
                setTotalPages(1);
            } finally {
                setLoading(false);
            }
        },
        [adminToken, viewedReviews, limitItems, navigate]
    );

    const refreshReviews = useCallback(
        async (page = 1, searchQuery = "", sortKey = "", sortValue = "") => {
            const itemId = reviewType === "hotel" ? selectedHotel?._id : selectedTour?._id;
            await fetchReviews(reviewType, itemId, page, searchQuery, sortKey, sortValue);
        },
        [fetchReviews, reviewType, selectedHotel, selectedTour]
    );

    useEffect(() => {
        const token = adminToken || localStorage.getItem("adminToken");
        if (token) {
            fetchHotels();
            fetchTours();
        } else {
            toast.error("Vui lòng đăng nhập để tiếp tục!", { position: "top-right" });
            setTimeout(() => {
                navigate("/loginadmin");
            }, 2000);
        }
    }, [adminToken, navigate]);

    // Auto-select first item when data is loaded
    useEffect(() => {
        if (reviewType === "hotel" && hotels.length > 0 && !selectedHotel) {
            setSelectedHotel(hotels[0]);
            console.log("Auto-selected first hotel:", hotels[0]);
        }
    }, [hotels, reviewType, selectedHotel]);

    useEffect(() => {
        if (reviewType === "tour" && tours.length > 0 && !selectedTour) {
            setSelectedTour(tours[0]);
            console.log("Auto-selected first tour:", tours[0]);
        }
    }, [tours, reviewType, selectedTour]);

    useEffect(() => {
        const itemId = reviewType === "hotel" ? selectedHotel?._id : selectedTour?._id;
        if (itemId) {
            setReviews([]);
            let sortKey = "";
            let sortValue = "";
            if (sortOption !== "stt_asc") {
                // Parse sortOption if needed
                const sortParts = sortOption.split("_");
                if (sortParts.length === 2) {
                    const field = sortParts[0];
                    sortValue = sortParts[1];
                    if (field === "stt") sortKey = "_id";
                    else if (field === "username" || field === "email") sortKey = "user_id";
                    else sortKey = field;
                }
            }
            fetchReviews(reviewType, itemId, currentPage, searchText, sortKey, sortValue);
        }
    }, [selectedHotel, selectedTour, reviewType, currentPage, searchText, sortOption, fetchReviews]);

    const handleReviewTypeChange = (event) => {
        const type = event.target.value;
        console.log("Switching review type to:", type);
        setReviewType(type);
        setReviews([]);
        setCurrentPage(1);
        setSearchText("");
        
        // Set default selection based on type
        if (type === "hotel") {
            if (hotels.length > 0) {
                setSelectedHotel(hotels[0]);
            }
        } else if (type === "tour") {
            if (tours.length > 0) {
                setSelectedTour(tours[0]);
            }
        }
    };

    const handleHotelChange = (event) => {
        const hotelId = event.target.value;
        const hotel = hotels.find((h) => h._id === hotelId) || null;
        setSelectedHotel(hotel);
        setReviews([]);
        setCurrentPage(1);
        setSearchText("");
    };

    const handleTourChange = (event) => {
        const tourId = event.target.value;
        const tour = tours.find((t) => t._id === tourId) || null;
        setSelectedTour(tour);
        setReviews([]);
        setCurrentPage(1);
        setSearchText("");
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setIsSearching(true);
        try {
            setCurrentPage(1);
            let sortKey = "";
            let sortValue = "";
            switch (sortOption) {
                case "stt_asc":
                    sortKey = "_id";
                    sortValue = "asc";
                    break;
                case "stt_desc":
                    sortKey = "_id";
                    sortValue = "desc";
                    break;
                case "username_asc":
                    sortKey = "user_id";
                    sortValue = "asc";
                    break;
                case "username_desc":
                    sortKey = "user_id";
                    sortValue = "desc";
                    break;
                case "email_asc":
                    sortKey = "user_id";
                    sortValue = "asc";
                    break;
                case "email_desc":
                    sortKey = "user_id";
                    sortValue = "desc";
                    break;
                case "rating_asc":
                    sortKey = "rating";
                    sortValue = "asc";
                    break;
                case "rating_desc":
                    sortKey = "rating";
                    sortValue = "desc";
                    break;
                case "comment_asc":
                    sortKey = "comment";
                    sortValue = "asc";
                    break;
                case "comment_desc":
                    sortKey = "comment";
                    sortValue = "desc";
                    break;
                case "createdAt_asc":
                    sortKey = "createdAt";
                    sortValue = "asc";
                    break;
                case "createdAt_desc":
                    sortKey = "createdAt";
                    sortValue = "desc";
                    break;
                default:
                    break;
            }
            await refreshReviews(1, searchText, sortKey, sortValue);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearchTextChange = (e) => {
        setSearchText(e.target.value);
    };

    const handleSortChange = (event) => {
        const value = event.target.value;
        setSortOption(value);
        setCurrentPage(1);
        let sortKey = "";
        let sortValue = "";
        let sortField = "";
        if (value !== "none") {
            switch (value) {
                case "stt_asc":
                    sortKey = "_id";
                    sortValue = "asc";
                    sortField = "stt";
                    break;
                case "stt_desc":
                    sortKey = "_id";
                    sortValue = "desc";
                    sortField = "stt";
                    break;
                case "username_asc":
                    sortKey = "user_id";
                    sortValue = "asc";
                    sortField = "user_id";
                    break;
                case "username_desc":
                    sortKey = "user_id";
                    sortValue = "desc";
                    sortField = "user_id";
                    break;
                case "email_asc":
                    sortKey = "user_id";
                    sortValue = "asc";
                    sortField = "email";
                    break;
                case "email_desc":
                    sortKey = "user_id";
                    sortValue = "desc";
                    sortField = "email";
                    break;
                case "rating_asc":
                    sortKey = "rating";
                    sortValue = "asc";
                    sortField = "rating";
                    break;
                case "rating_desc":
                    sortKey = "rating";
                    sortValue = "desc";
                    sortField = "rating";
                    break;
                case "comment_asc":
                    sortKey = "comment";
                    sortValue = "asc";
                    sortField = "comment";
                    break;
                case "comment_desc":
                    sortKey = "comment";
                    sortValue = "desc";
                    sortField = "comment";
                    break;
                case "createdAt_asc":
                    sortKey = "createdAt";
                    sortValue = "asc";
                    sortField = "createdAt";
                    break;
                case "createdAt_desc":
                    sortKey = "createdAt";
                    sortValue = "desc";
                    sortField = "createdAt";
                    break;
                default:
                    break;
            }
            setSortModel([{ field: sortField, sort: sortValue }]);
        } else {
            setSortModel([]);
        }
        refreshReviews(1, searchText, sortKey, sortValue);
    };

    const handleSortModelChange = (newSortModel) => {
        setSortModel(newSortModel);
        setCurrentPage(1);
        if (newSortModel.length > 0) {
            const { field, sort } = newSortModel[0];
            let sortKey = "";
            let sortOptionValue = "";
            switch (field) {
                case "stt":
                    sortKey = "_id";
                    sortOptionValue = sort === "asc" ? "stt_asc" : "stt_desc";
                    break;
                case "user_id":
                    sortKey = "user_id";
                    sortOptionValue = sort === "asc" ? "username_asc" : "username_desc";
                    break;
                case "email":
                    sortKey = "user_id";
                    sortOptionValue = sort === "asc" ? "email_asc" : "email_desc";
                    break;
                case "rating":
                    sortKey = "rating";
                    sortOptionValue = sort === "asc" ? "rating_asc" : "rating_desc";
                    break;
                case "comment":
                    sortKey = "comment";
                    sortOptionValue = sort === "asc" ? "comment_asc" : "comment_desc";
                    break;
                case "createdAt":
                    sortKey = "createdAt";
                    sortOptionValue = sort === "asc" ? "createdAt_asc" : "createdAt_desc";
                    break;
                default:
                    break;
            }
            if (sortKey) {
                setSortOption(sortOptionValue);
                refreshReviews(1, searchText, sortKey, sort);
            }
        } else {
            setSortOption("none");
            refreshReviews(1, searchText);
        }
    };

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
        let sortKey = "";
        let sortValue = "";
        if (sortOption !== "none") {
            switch (sortOption) {
                case "stt_asc":
                    sortKey = "_id";
                    sortValue = "asc";
                    break;
                case "stt_desc":
                    sortKey = "_id";
                    sortValue = "desc";
                    break;
                case "username_asc":
                    sortKey = "user_id";
                    sortValue = "asc";
                    break;
                case "username_desc":
                    sortKey = "user_id";
                    sortValue = "desc";
                    break;
                case "email_asc":
                    sortKey = "user_id";
                    sortValue = "asc";
                    break;
                case "email_desc":
                    sortKey = "user_id";
                    sortValue = "desc";
                    break;
                case "rating_asc":
                    sortKey = "rating";
                    sortValue = "asc";
                    break;
                case "rating_desc":
                    sortKey = "rating";
                    sortValue = "desc";
                    break;
                case "comment_asc":
                    sortKey = "comment";
                    sortValue = "asc";
                    break;
                case "comment_desc":
                    sortKey = "comment";
                    sortValue = "desc";
                    break;
                case "createdAt_asc":
                    sortKey = "createdAt";
                    sortValue = "asc";
                    break;
                case "createdAt_desc":
                    sortKey = "createdAt";
                    sortValue = "desc";
                    break;
                default:
                    break;
            }
        }
        refreshReviews(value, searchText, sortKey, sortValue);
    };

    const handleDelete = async (reviewId, type) => {
        try {
            const response = type === "hotel" 
                ? await deleteReview(reviewId, adminToken)
                : await deleteTourReview(reviewId, adminToken);
                
            if (response.code === 200) {
                refreshReviews(currentPage, searchText);
                setViewedReviews((prev) => {
                    const newViewed = { ...prev };
                    delete newViewed[reviewId];
                    return newViewed;
                });
                toast.success("Xóa đánh giá thành công!", { position: "top-right" });
            } else {
                toast.error(response.message || "Xóa đánh giá thất bại!", { position: "top-right" });
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Xóa đánh giá thất bại!", {
                position: "top-right",
            });
        }
    };

    const handleOpenDeleteModal = (reviewId) => {
        setReviewToDelete(reviewId);
        setOpenDeleteModal(true);
    };

    const handleCloseDeleteModal = () => {
        setOpenDeleteModal(false);
        setReviewToDelete(null);
    };

    const handleConfirmDelete = () => {
        if (reviewToDelete) {
            const review = reviews.find(r => r._id === reviewToDelete);
            handleDelete(reviewToDelete, review?.type || reviewType);
            handleCloseDeleteModal();
        }
    };

    const handleViewReview = (review) => {
        setSelectedReview(review);
        setOpenModal(true);
        if (!viewedReviews[review._id]) {
            setViewedReviews((prev) => ({
                ...prev,
                [review._id]: true,
            }));
        }
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedReview(null);
    };

    const columns = [
        {
            field: "stt",
            headerName: "STT",
            flex: isMobile ? 0.3 : 0.5,
            hide: isMobile,
            sortable: true,
            renderCell: ({ row }) => row.stt,
        },
        {
            field: "user_id",
            headerName: "Người dùng",
            flex: isMobile ? 0.8 : 1,
            sortable: true,
            renderCell: ({ row }) => row.userData?.username || "N/A",
        },
        {
            field: "email",
            headerName: "Email",
            flex: isMobile ? 0.8 : 1,
            hide: isMobile,
            sortable: true,
            renderCell: ({ row }) => row.userData?.email || "N/A",
        },
        {
            field: "service",
            headerName: "Dịch vụ",
            flex: isMobile ? 1 : 1.5,
            sortable: false,
            renderCell: ({ row }) => {
                if (row.type === "hotel" || row.hotel_info) {
                    return (
                        <Box>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                                {row.hotel_info?.name || "N/A"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Phòng: {row.room_info?.name || "N/A"}
                            </Typography>
                        </Box>
                    );
                } else if (row.type === "tour" || row.tour_info) {
                    return (
                        <Box>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                                {row.tour_info?.title || "N/A"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Mã: {row.tour_info?.code || "N/A"}
                            </Typography>
                        </Box>
                    );
                }
                return "N/A";
            },
        },
        {
            field: "rating",
            headerName: "Điểm đánh giá",
            flex: isMobile ? 0.5 : 0.7,
            sortable: true,
            renderCell: ({ row }) => `${row.rating || 0}/5`,
        },
        {
            field: "comment",
            headerName: "Bình luận",
            flex: isMobile ? 1.5 : 2,
            sortable: true,
            renderCell: ({ row }) => row.comment || "Không có bình luận",
        },
        {
            field: "createdAt",
            headerName: "Ngày tạo",
            flex: isMobile ? 0.8 : 1,
            hide: isMobile,
            sortable: true,
            renderCell: ({ row }) => {
                const date = new Date(row.createdAt);
                return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString("vi-VN");
            },
        },
        {
            field: "viewed",
            headerName: "Đã xem",
            flex: isMobile ? 0.5 : 0.7,
            sortable: false,
            renderCell: ({ row }) => (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                    {row.viewed ? <VisibilityIcon color="success" /> : <VisibilityOffIcon color="error" />}
                </Box>
            ),
        },
        {
            field: "actions",
            headerName: "Hành động",
            flex: isMobile ? 0.8 : 1,
            sortable: false,
            renderCell: ({ row }) => (
                <Box display="flex" gap={1} sx={{ alignItems: "center", height: "100%" }}>
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewReview(row)}
                    >
                        Xem
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleOpenDeleteModal(row._id)}
                    >
                        Xóa
                    </Button>
                </Box>
            ),
        },
    ];

    return (
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 2, m: "20px" }}>
            <Box sx={{ gridColumn: "span 12" }}>
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
                    theme="light"
                    limit={3}
                />
                <Header title="Quản lý đánh giá" />
                <Box
                    display="flex"
                    justifyContent="space-between"
                    mb="20px"
                    gap={2}
                    flexWrap={isMobile ? "wrap" : "nowrap"}
                >
                    <Box display="flex" gap={2} flexWrap={isMobile ? "wrap" : "nowrap"} width={isMobile ? "100%" : "auto"}>
                        <FormControl sx={{ minWidth: isMobile ? "100%" : 150 }}>
                            <InputLabel id="review-type-label" sx={{ color: "black" }}>
                                Loại dịch vụ
                            </InputLabel>
                            <Select
                                labelId="review-type-label"
                                value={reviewType}
                                label="Loại dịch vụ"
                                onChange={handleReviewTypeChange}
                                disabled={loading}
                                sx={{
                                    backgroundColor: colors.primary[400],
                                    color: colors.grey[100],
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        borderColor: colors.grey[300],
                                    },
                                    "&:hover .MuiOutlinedInput-notchedOutline": {
                                        borderColor: colors.grey[100],
                                    },
                                    "& .MuiSvgIcon-root": {
                                        color: colors.grey[100],
                                    },
                                    "& .MuiInputBase-input": {
                                        padding: "10px 14px",
                                    },
                                }}
                            >
                                <MenuItem value="hotel">Khách sạn</MenuItem>
                                <MenuItem value="tour">Tour</MenuItem>
                            </Select>
                        </FormControl>
                        
                        {reviewType === "hotel" ? (
                            <FormControl sx={{ minWidth: isMobile ? "100%" : 250 }}>
                                <InputLabel id="hotel-select-label" sx={{ color: "black" }}>
                                    Chọn khách sạn
                                </InputLabel>
                                <Select
                                    labelId="hotel-select-label"
                                    value={selectedHotel?._id || ""}
                                    label="Chọn khách sạn"
                                    onChange={handleHotelChange}
                                    disabled={loading}
                                    sx={{
                                        backgroundColor: colors.primary[400],
                                        color: colors.grey[100],
                                        "& .MuiOutlinedInput-notchedOutline": {
                                            borderColor: colors.grey[300],
                                        },
                                        "&:hover .MuiOutlinedInput-notchedOutline": {
                                            borderColor: colors.grey[100],
                                        },
                                        "& .MuiSvgIcon-root": {
                                            color: colors.grey[100],
                                        },
                                        "& .MuiInputBase-input": {
                                            padding: "10px 14px",
                                        },
                                    }}
                                >
                                    {hotels.length === 0 && (
                                        <MenuItem value="">
                                            <em>{loading ? "Đang tải..." : "Không có khách sạn"}</em>
                                        </MenuItem>
                                    )}
                                    {hotels.map((hotel) => (
                                        <MenuItem key={hotel._id} value={hotel._id}>
                                            {hotel.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        ) : (
                            <FormControl sx={{ minWidth: isMobile ? "100%" : 250 }}>
                                <InputLabel id="tour-select-label" sx={{ color: "black" }}>
                                    Chọn tour
                                </InputLabel>
                                <Select
                                    labelId="tour-select-label"
                                    value={selectedTour?._id || ""}
                                    label="Chọn tour"
                                    onChange={handleTourChange}
                                    disabled={loading}
                                    sx={{
                                        backgroundColor: colors.primary[400],
                                        color: colors.grey[100],
                                        "& .MuiOutlinedInput-notchedOutline": {
                                            borderColor: colors.grey[300],
                                        },
                                        "&:hover .MuiOutlinedInput-notchedOutline": {
                                            borderColor: colors.grey[100],
                                        },
                                        "& .MuiSvgIcon-root": {
                                            color: colors.grey[100],
                                        },
                                        "& .MuiInputBase-input": {
                                            padding: "10px 14px",
                                        },
                                    }}
                                >
                                    {tours.length === 0 && (
                                        <MenuItem value="">
                                            <em>{loading ? "Đang tải..." : "Không có tour"}</em>
                                        </MenuItem>
                                    )}
                                    {tours.map((tour) => (
                                        <MenuItem key={tour._id} value={tour._id}>
                                            {tour.title} - {tour.code}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                    </Box>
                    <Box display="flex" gap={2} flexWrap={isMobile ? "wrap" : "nowrap"} width={isMobile ? "100%" : "auto"}>
                        <FormControl sx={{ minWidth: isMobile ? "100%" : 200 }}>
                            <InputLabel id="sort-select-label" sx={{ color: "black" }}>
                                Sắp xếp
                            </InputLabel>
                            <Select
                                labelId="sort-select-label"
                                value={sortOption}
                                label="Sắp xếp"
                                onChange={handleSortChange}
                                sx={{
                                    backgroundColor: colors.primary[400],
                                    color: colors.grey[100],
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        borderColor: colors.grey[300],
                                    },
                                    "&:hover .MuiOutlinedInput-notchedOutline": {
                                        borderColor: colors.grey[100],
                                    },
                                    "& .MuiSvgIcon-root": {
                                        color: colors.grey[100],
                                    },
                                    "& .MuiInputBase-input": {
                                        padding: "10px 14px",
                                    },
                                }}
                            >
                                <MenuItem value="stt_asc">STT: Tăng dần</MenuItem>
                                <MenuItem value="stt_desc">STT: Giảm dần</MenuItem>
                                <MenuItem value="username_asc">Người dùng: Tăng dần</MenuItem>
                                <MenuItem value="username_desc">Người dùng: Giảm dần</MenuItem>
                                <MenuItem value="email_asc">Email: Tăng dần</MenuItem>
                                <MenuItem value="email_desc">Email: Giảm dần</MenuItem>
                                <MenuItem value="rating_asc">Điểm đánh giá: Tăng dần</MenuItem>
                                <MenuItem value="rating_desc">Điểm đánh giá: Giảm dần</MenuItem>
                                <MenuItem value="comment_asc">Bình luận: Tăng dần</MenuItem>
                                <MenuItem value="comment_desc">Bình luận: Giảm dần</MenuItem>
                                <MenuItem value="createdAt_asc">Ngày tạo: Tăng dần</MenuItem>
                                <MenuItem value="createdAt_desc">Ngày tạo: Giảm dần</MenuItem>
                            </Select>
                        </FormControl>
                        <Paper
                            component="form"
                            sx={{
                                p: "2px 4px",
                                display: "flex",
                                alignItems: "center",
                                width: isMobile ? "100%" : 300,
                                backgroundColor: colors.primary[400],
                            }}
                            onSubmit={handleSearch}
                        >
                            <InputBase
                                sx={{ ml: 1, flex: 1, color: colors.grey[100] }}
                                placeholder="Tìm kiếm theo bình luận"
                                value={searchText}
                                onChange={handleSearchTextChange}
                            />
                            <IconButton type="submit" sx={{ p: "10px", color: colors.grey[100] }} disabled={isSearching}>
                                {isSearching ? <CircularProgress size={24} /> : <SearchIcon />}
                            </IconButton>
                        </Paper>
                    </Box>
                </Box>
                <Box
                    sx={{
                        width: "100%",
                        overflowX: "auto",
                    }}
                >
                    <Box
                        height="70vh"
                        sx={{
                            "& .MuiDataGrid-root": {
                                border: "none",
                                width: "100%",
                                minWidth: isMobile ? "800px" : "100%",
                            },
                            "& .MuiDataGrid-main": {
                                width: "100%",
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
                                position: "sticky",
                                top: 0,
                                zIndex: 1,
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
                            "& .MuiCheckbox-root": {
                                color: `${colors.greenAccent[200]} !important`,
                            },
                        }}
                    >
                        {loading ? (
                            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                                <CircularProgress />
                            </Box>
                        ) : (reviewType === "hotel" ? hotels.length === 0 : tours.length === 0) ? (
                            <Box textAlign="center" mt={4}>
                                <Typography variant="h6">
                                    Không có {reviewType === "hotel" ? "khách sạn" : "tour"} nào để hiển thị
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => navigate("/loginadmin")}
                                    sx={{ mt: 2 }}
                                >
                                    Đăng nhập lại
                                </Button>
                            </Box>
                        ) : (reviewType === "hotel" ? !selectedHotel?._id : !selectedTour?._id) ? (
                            <Typography variant="h6" align="center" mt={4}>
                                Vui lòng chọn một {reviewType === "hotel" ? "khách sạn" : "tour"} để xem đánh giá
                            </Typography>
                        ) : reviews.length === 0 ? (
                            <Typography variant="h6" align="center" mt={4}>
                                Không có đánh giá nào để hiển thị
                            </Typography>
                        ) : (
                            <DataGrid
                                rows={reviews}
                                columns={columns}
                                getRowId={(row) => row._id}
                                pagination={false}
                                getRowHeight={() => 80}
                                sx={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                }}
                                hideFooter={true}
                                sortingMode="server"
                                sortModel={sortModel}
                                onSortModelChange={handleSortModelChange}
                            />
                        )}
                    </Box>
                </Box>
                {reviews.length > 0 && (
                    <Box display="flex" justifyContent="center" mt={2}>
                        <Pagination
                            count={totalPages}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="primary"
                        />
                    </Box>
                )}
            </Box>
            <Dialog open={openModal} onClose={handleCloseModal} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.5rem", textAlign: "center" }}>
                    Chi tiết đánh giá
                </DialogTitle>
                <DialogContent>
                    {selectedReview ? (
                        <Box sx={{ p: 2 }}>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Người dùng:</strong> {selectedReview.userData?.username || "N/A"}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Email:</strong> {selectedReview.userData?.email || "N/A"}
                            </Typography>
                            {(selectedReview.type === "hotel" || selectedReview.hotel_info) && (
                                <>
                                    <Typography variant="body1" sx={{ mb: 1 }}>
                                        <strong>Khách sạn:</strong> {selectedReview.hotel_info?.name || "N/A"}
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 1 }}>
                                        <strong>Phòng:</strong> {selectedReview.room_info?.name || "N/A"}
                                    </Typography>
                                </>
                            )}
                            {(selectedReview.type === "tour" || selectedReview.tour_info) && (
                                <>
                                    <Typography variant="body1" sx={{ mb: 1 }}>
                                        <strong>Tour:</strong> {selectedReview.tour_info?.title || "N/A"}
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 1 }}>
                                        <strong>Mã tour:</strong> {selectedReview.tour_info?.code || "N/A"}
                                    </Typography>
                                </>
                            )}
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Điểm đánh giá:</strong> {selectedReview.rating || 0}/5
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Bình luận:</strong> {selectedReview.comment || "Không có bình luận"}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Ngày tạo:</strong>{" "}
                                {new Date(selectedReview.createdAt).toLocaleDateString("vi-VN") || "N/A"}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Trạng thái:</strong> {selectedReview.viewed ? "Đã xem" : "Chưa xem"}
                            </Typography>
                        </Box>
                    ) : (
                        <Typography>Không có dữ liệu</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleCloseModal}
                        sx={{
                            backgroundColor: colors.redAccent[500],
                            color: "white",
                            "&:hover": {
                                backgroundColor: colors.redAccent[600],
                            },
                        }}
                    >
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openDeleteModal} onClose={handleCloseDeleteModal} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.25rem", textAlign: "center" }}>
                    Xác nhận xóa
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ fontSize: "1.1rem" }}>
                        Bạn có chắc chắn muốn xóa đánh giá này?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ gap: 2 }}>
                    <Button
                        onClick={handleCloseDeleteModal}
                        sx={{
                            backgroundColor: colors.grey[500],
                            color: "white",
                            "&:hover": {
                                backgroundColor: colors.grey[600],
                            },
                        }}
                    >
                        Đóng
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        sx={{
                            backgroundColor: colors.redAccent[500],
                            color: "white",
                            "&:hover": {
                                backgroundColor: colors.redAccent[600],
                            },
                        }}
                    >
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Reviews;