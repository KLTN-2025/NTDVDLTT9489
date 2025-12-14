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
import { getHotelReviews, getHotels, deleteReview } from "./reviewApi";
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
    const [hotels, setHotels] = useState([]);
    const [selectedHotel, setSelectedHotel] = useState(null);
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
        async (hotelId, page = 1, search = "", sortKey = "", sortValue = "") => {
            if (!hotelId) return;
            setLoading(true);
            try {
                const params = { page, limit: limitItems };
                if (search) params.search = search;
                if (sortKey && sortValue) {
                    params.sortKey = sortKey;
                    params.sortValue = sortValue;
                }
                const response = await getHotelReviews(hotelId, params, adminToken);
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
            await fetchReviews(selectedHotel?._id, page, searchQuery, sortKey, sortValue);
        },
        [fetchReviews, selectedHotel]
    );

    useEffect(() => {
        const token = adminToken || localStorage.getItem("adminToken");
        if (token) {
            fetchHotels();
        } else {
            toast.error("Vui lòng đăng nhập để tiếp tục!", { position: "top-right" });
            setTimeout(() => {
                navigate("/loginadmin");
            }, 2000);
        }
    }, [adminToken, navigate]);

    useEffect(() => {
        if (selectedHotel?._id) {
            setReviews([]); // Reset reviews before fetching new ones
            refreshReviews(currentPage, searchText);
        }
    }, [selectedHotel, currentPage, refreshReviews, searchText]);

    const handleHotelChange = (event) => {
        const hotelId = event.target.value;
        const hotel = hotels.find((h) => h._id === hotelId) || null;
        setSelectedHotel(hotel);
        setReviews([]); // Reset reviews when changing hotel
        setCurrentPage(1);
        setSearchText("");
        refreshReviews(1, "");
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

    const handleDelete = async (reviewId) => {
        try {
            const response = await deleteReview(reviewId, adminToken);
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
            handleDelete(reviewToDelete);
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
                        <FormControl sx={{ minWidth: isMobile ? "100%" : 200 }}>
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
                        ) : hotels.length === 0 ? (
                            <Box textAlign="center" mt={4}>
                                <Typography variant="h6">Không có khách sạn nào để hiển thị</Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => navigate("/loginadmin")}
                                    sx={{ mt: 2 }}
                                >
                                    Đăng nhập lại
                                </Button>
                            </Box>
                        ) : !selectedHotel?._id ? (
                            <Typography variant="h6" align="center" mt={4}>
                                Vui lòng chọn một khách sạn để xem đánh giá
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