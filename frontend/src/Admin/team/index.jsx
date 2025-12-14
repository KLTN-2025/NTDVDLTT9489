import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  InputBase,
  Paper,
  CircularProgress,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  getAccountDetail,
  changeAccountStatus,
  getRoleDetail,
} from "./TeamApi";
import { getRightsGroups } from "../rightsgroup/RightsgroupApi";
import { useAdminAuth } from "../../context/AdminContext";
import { useNavigate } from "react-router-dom";

const Team = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { adminToken } = useAdminAuth();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [allAccounts, setAllAccounts] = useState([]);
  const [roles, setRoles] = useState({});
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [deleteAccountId, setDeleteAccountId] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [newAccount, setNewAccount] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role_id: "",
    status: "active",
    avatar: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [roleOptions, setRoleOptions] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limitItems = 10;
  const [sortOption, setSortOption] = useState("stt_asc");
  const [sortModel, setSortModel] = useState([]);

  const fileInputRef = React.useRef(null);

  const fetchAccounts = async (page = 1, search = "", status = "all", sortKey = "", sortValue = "") => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: limitItems,
      };
      if (search) {
        params.search = search;
      }
      if (status !== "all") {
        params.status = status;
      }
      if (sortKey && sortValue) {
        params.sortKey = sortKey;
        params.sortValue = sortValue;
      }
      const response = await getAccounts(params);
      console.log("fetchAccounts response:", response);
      if (response && Array.isArray(response.accounts)) {
        const formattedData = response.accounts.map((item, index) => {
          let stt;
          if (sortKey === "createdAt") {
            if (sortValue === "asc") {
              stt = index + 1 + (page - 1) * limitItems;
            } else {
              stt = response.accounts.length - index + (page - 1) * limitItems;
            }
          } else {
            stt = index + 1 + (page - 1) * limitItems;
          }
          return {
            ...item,
            id: item._id,
            stt: stt
          };
        });
        setAllAccounts(formattedData);
        setAccounts(formattedData);
        setTotalPages(response.totalPage || 1);

        const rolePromises = formattedData.map(async (account) => {
          if (account.role_id) {
            const roleData = await getRoleDetail(account.role_id);
            return { id: account.role_id, title: roleData.title || "N/A" };
          }
          return { id: account.role_id, title: "N/A" };
        });
        const roleResults = await Promise.all(rolePromises);
        const roleMap = roleResults.reduce((acc, role) => {
          acc[role.id] = role.title;
          return acc;
        }, {});
        setRoles(roleMap);

        if (formattedData.length === 0) {
          toast.info(
            search
              ? `Không tìm thấy nhân viên nào với từ khóa "${search}"!`
              : "Không có nhân viên nào để hiển thị!",
            { position: "top-right" }
          );
        }
      } else {
        setError("Dữ liệu tài khoản không hợp lệ!");
        toast.error("Dữ liệu tài khoản không hợp lệ!", { position: "top-right" });
        setAccounts([]);
        setAllAccounts([]);
        setTotalPages(1);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Không thể tải danh sách tài khoản!";
      setError(errorMessage);
      toast.error(errorMessage, { position: "top-right" });
      console.error("Fetch accounts error:", err.response?.data);
      if (err.response?.status === 401) {
        toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
        localStorage.removeItem("adminToken");
        navigate("/loginadmin");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRoleOptions = async () => {
    try {
      const response = await getRightsGroups({
        page: 1,
        limit: 100,
        sortKey: "createdAt",
        sortValue: "desc",
      });
      if (response && Array.isArray(response.roles)) {
        const roles = response.roles.map((role) => ({
          id: role._id,
          title: role.title,
        }));
        setRoleOptions(roles);
      } else {
        toast.error("Dữ liệu nhóm quyền không hợp lệ!", { position: "top-right" });
        setRoleOptions([]);
      }
    } catch (err) {
      toast.error("Không thể tải danh sách nhóm quyền!", { position: "top-right" });
      console.error("Fetch role options error:", err.response?.data);
    }
  };

  useEffect(() => {
    const token = adminToken || localStorage.getItem("adminToken");
    if (token) {
      fetchAccounts(currentPage, searchText, statusFilter);
      fetchRoleOptions();
    } else {
      toast.error("Vui lòng đăng nhập để tiếp tục!", { position: "top-right" });
      setTimeout(() => {
        navigate("/loginadmin");
      }, 2000);
    }
  }, [adminToken, navigate, currentPage, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchAccounts(1, searchText, statusFilter);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setCurrentPage(1);
    fetchAccounts(1, searchText, event.target.value);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    fetchAccounts(value, searchText, statusFilter);
  };

  const handleOpen = () => {
    setIsEdit(false);
    setNewAccount({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      role_id: "",
      status: "active",
      avatar: null,
    });
    setPreviewImage(null);
    setError("");
    setOpen(true);
  };

  const handleEdit = (account) => {
    setIsEdit(true);
    setCurrentId(account._id);
    setNewAccount({
      fullName: account.fullName || "",
      email: account.email || "",
      password: "",
      confirmPassword: "",
      phone: account.phone || "",
      role_id: account.role_id || "",
      status: account.status || "active",
      avatar: null,
    });
    setPreviewImage(account.avatar || null);
    setError("");
    setOpen(true);
  };

  const handleOpenDetail = async (account) => {
    setLoading(true);
    try {
      const data = await getAccountDetail(account._id);
      setCurrentAccount(data);
      setOpenDetail(true);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Không thể tải chi tiết tài khoản!";
      toast.error(errorMessage, { position: "top-right" });
      console.error("Get account detail error:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setError("");
    setPreviewImage(null);
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
    setCurrentAccount(null);
  };

  const handleOpenDeleteConfirm = (id) => {
    setDeleteAccountId(id);
    setOpenDeleteConfirm(true);
  };

  const handleCloseDeleteConfirm = () => {
    setOpenDeleteConfirm(false);
    setDeleteAccountId(null);
  };

  const handleAdd = async () => {
    if (!newAccount.fullName) {
      setError("Vui lòng nhập họ tên!");
      return;
    }
    if (!newAccount.email || !/^\S+@\S+\.\S+$/.test(newAccount.email)) {
      setError("Vui lòng nhập email hợp lệ!");
      return;
    }
    if (!newAccount.password) {
      setError("Vui lòng nhập mật khẩu!");
      return;
    }
    if (!newAccount.confirmPassword) {
      setError("Vui lòng xác nhận mật khẩu!");
      return;
    }
    if (newAccount.password !== newAccount.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }
    if (!newAccount.phone) {
      setError("Vui lòng nhập số điện thoại!");
      return;
    }
    if (!/^\d{10,11}$/.test(newAccount.phone)) {
      setError("Số điện thoại không hợp lệ!");
      return;
    }
    if (!newAccount.role_id) {
      setError("Vui lòng chọn nhóm quyền!");
      return;
    }
    if (newAccount.avatar && !(newAccount.avatar instanceof File)) {
      setError("Ảnh đại diện không hợp lệ!");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("fullName", newAccount.fullName);
      formData.append("email", newAccount.email);
      formData.append("password", newAccount.password);
      formData.append("confirmPassword", newAccount.confirmPassword);
      formData.append("phone", newAccount.phone);
      formData.append("role_id", newAccount.role_id);
      formData.append("status", newAccount.status || "active");
      if (newAccount.avatar) {
        formData.append("avatar", newAccount.avatar);
      }

      const response = await createAccount(formData, adminToken);
      if (response.code === 200) {
        fetchAccounts(currentPage, searchText, statusFilter);
        handleClose();
        toast.success("Thêm tài khoản thành công!", { position: "top-right" });
      } else {
        setError(response.message || "Thêm tài khoản thất bại!");
        toast.error(response.message || "Thêm tài khoản thất bại!", { position: "top-right" });
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.errors?.join(", ") ||
        err.response?.data?.message ||
        "Thêm tài khoản thất bại!";
      setError(errorMessage);
      toast.error(errorMessage, { position: "top-right" });
      console.error("Add account error:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!newAccount.fullName) {
      setError("Vui lòng nhập họ tên!");
      return;
    }
    if (!newAccount.email || !/^\S+@\S+\.\S+$/.test(newAccount.email)) {
      setError("Vui lòng nhập email hợp lệ!");
      return;
    }
    if (!newAccount.phone) {
      setError("Vui lòng nhập số điện thoại!");
      return;
    }
    if (!/^\d{10,11}$/.test(newAccount.phone)) {
      setError("Số điện thoại không hợp lệ!");
      return;
    }
    if (!newAccount.role_id) {
      setError("Vui lòng chọn nhóm quyền!");
      return;
    }
    if (newAccount.password && newAccount.password !== newAccount.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }
    if (newAccount.avatar && !(newAccount.avatar instanceof File)) {
      setError("Ảnh đại diện không hợp lệ!");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("fullName", newAccount.fullName);
      formData.append("email", newAccount.email);
      if (newAccount.password) {
        formData.append("password", newAccount.password);
        formData.append("confirmPassword", newAccount.confirmPassword);
      }
      formData.append("phone", newAccount.phone);
      formData.append("role_id", newAccount.role_id);
      formData.append("status", newAccount.status);
      if (newAccount.avatar) {
        formData.append("avatar", newAccount.avatar);
      }

      const response = await updateAccount(currentId, formData);
      if (response.code === 200) {
        fetchAccounts(currentPage, searchText, statusFilter);
        handleClose();
        toast.success("Cập nhật tài khoản thành công!", { position: "top-right" });
      } else {
        setError(response.message || "Cập nhật tài khoản thất bại!");
        toast.error(response.message || "Cập nhật tài khoản thất bại!", { position: "top-right" });
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.errors?.join(", ") ||
        err.response?.data?.message ||
        "Cập nhật tài khoản thất bại!";
      setError(errorMessage);
      toast.error(errorMessage, { position: "top-right" });
      console.error("Update account error:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteAccountId) return;
    setLoading(true);
    try {
      const response = await deleteAccount(deleteAccountId);
      if (response.code === 200) {
        fetchAccounts(currentPage, searchText, statusFilter);
        toast.success("Xóa tài khoản thành công!", { position: "top-right" });
      } else {
        toast.error(response.message || "Xóa tài khoản thất bại!", { position: "top-right" });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Xóa tài khoản thất bại!";
      toast.error(errorMessage, { position: "top-right" });
      console.error("Delete account error:", err.response?.data);
    } finally {
      setLoading(false);
      handleCloseDeleteConfirm();
    }
  };

  const handleChangeStatus = async (id, status) => {
    setLoading(true);
    try {
      const response = await changeAccountStatus(id, status);
      if (response.code === 200) {
        fetchAccounts(currentPage, searchText, statusFilter);
        toast.success("Cập nhật trạng thái tài khoản thành công!", { position: "top-right" });
      } else {
        toast.error(response.message || "Cập nhật trạng thái thất bại!", { position: "top-right" });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Cập nhật trạng thái thất bại!";
      toast.error(errorMessage, { position: "top-right" });
      console.error("Change status error:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (event) => {
    const value = event.target.value;
    setSortOption(value);
    setCurrentPage(1);
    let sortKey = "";
    let sortValue = "";
    let sortField = "";
    switch (value) {
      case "stt_asc":
        sortKey = "createdAt";
        sortValue = "asc";
        sortField = "stt";
        break;
      case "stt_desc":
        sortKey = "createdAt";
        sortValue = "desc";
        sortField = "stt";
        break;
      case "name_asc":
        sortKey = "fullName";
        sortValue = "asc";
        sortField = "fullName";
        break;
      case "name_desc":
        sortKey = "fullName";
        sortValue = "desc";
        sortField = "fullName";
        break;
      case "email_asc":
        sortKey = "email";
        sortValue = "asc";
        sortField = "email";
        break;
      case "email_desc":
        sortKey = "email";
        sortValue = "desc";
        sortField = "email";
        break;
      case "phone_asc":
        sortKey = "phone";
        sortValue = "asc";
        sortField = "phone";
        break;
      case "phone_desc":
        sortKey = "phone";
        sortValue = "desc";
        sortField = "phone";
        break;
      default:
        sortKey = "createdAt";
        sortValue = "desc";
        break;
    }
    fetchAccounts(1, searchText, statusFilter, sortKey, sortValue);
    if (sortKey) {
      setSortModel([{ field: sortField, sort: sortValue }]);
    } else {
      setSortModel([]);
    }
  };

  const handleSortModelChange = (newSortModel) => {
    setSortModel(newSortModel);
    setCurrentPage(1);
    if (newSortModel.length > 0) {
      const { field, sort } = newSortModel[0];
      let sortKey = "";
      let sortOptionValue = "";
      let sortValue = sort;
      switch (field) {
        case "stt":
          sortKey = "createdAt";
          sortOptionValue = sort === "asc" ? "stt_asc" : "stt_desc";
          break;
        case "fullName":
          sortKey = "fullName";
          sortOptionValue = sort === "asc" ? "name_asc" : "name_desc";
          break;
        case "email":
          sortKey = "email";
          sortOptionValue = sort === "asc" ? "email_asc" : "email_desc";
          break;
        case "phone":
          sortKey = "phone";
          sortOptionValue = sort === "asc" ? "phone_asc" : "phone_desc";
          break;
        default:
          sortKey = "createdAt";
          sortValue = "desc";
          break;
      }
      if (sortKey) {
        setSortOption(sortOptionValue);
        fetchAccounts(1, searchText, statusFilter, sortKey, sortValue);
      }
    } else {
      setSortOption("none");
      fetchAccounts(1, searchText, statusFilter);
    }
  };

  const columns = [
    { field: "stt", headerName: "STT", flex: 0.4 },
    {
      field: "fullName",
      headerName: "Tên",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
    },
    {
      field: "phone",
      headerName: "Số điện thoại",
      flex: 1,
    },
    {
      field: "role_id",
      headerName: "Chức vụ",
      flex: 1,
      renderCell: ({ row }) => (
        <Box
          width="60%"
          p="5px"
          display="flex"
          justifyContent="center"
          backgroundColor={colors.greenAccent[600]}
          borderRadius="4px"
          mt="12px"
        >
          <Typography color={colors.grey[100]} sx={{ ml: "5px" }}>
            {roles[row.role_id] || "N/A"}
          </Typography>
        </Box>
      ),
    },
    {
      field: "status",
      headerName: "Trạng thái",
      flex: 1,
      renderCell: ({ row }) => (
        <Button
          variant="contained"
          color={row.status === "active" ? "success" : "warning"}
          onClick={() =>
            handleChangeStatus(row._id, row.status === "active" ? "inactive" : "active")
          }
        >
          {row.status === "active" ? "Hoạt động" : "Tạm ngưng"}
        </Button>
      ),
    },
    {
      field: "actions",
      headerName: "Hành động",
      flex: 1.5,
      renderCell: (params) => (
        <Box display="flex" mt="12px" gap={1}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<VisibilityIcon />}
            onClick={() => handleOpenDetail(params.row)}
          >
            Chi tiết
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
            onClick={() => handleEdit(params.row)}
          >
            Sửa
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            startIcon={<DeleteIcon />}
            onClick={() => handleOpenDeleteConfirm(params.row._id)}
          >
            Xóa
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box m="20px">
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
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 2 }}>
        <Box sx={{ gridColumn: "span 12" }}>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography variant="h2" color={colors.grey[100]} fontWeight="bold">
              Quản lý nhân viên
            </Typography>
            <Box display="flex" gap={2}>
              <FormControl sx={{ width: 150 }}>
                <InputLabel>Sắp xếp</InputLabel>
                <Select
                  value={sortOption}
                  onChange={handleSortChange}
                  label="Sắp xếp"
                  sx={{
                    backgroundColor: colors.primary[400],
                  }}
                >
                  <MenuItem value="stt_asc">STT: Tăng dần</MenuItem>
                  <MenuItem value="stt_desc">STT: Giảm dần</MenuItem>
                  <MenuItem value="name_asc">Tên: Tăng dần</MenuItem>
                  <MenuItem value="name_desc">Tên: Giảm dần</MenuItem>
                  <MenuItem value="email_asc">Email: Tăng dần</MenuItem>
                  <MenuItem value="email_desc">Email: Giảm dần</MenuItem>
                  <MenuItem value="phone_asc">Số điện thoại: Tăng dần</MenuItem>
                  <MenuItem value="phone_desc">Số điện thoại: Giảm dần</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ width: 150 }}>
                <InputLabel>Lọc trạng thái</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  label="Trạng thái"
                  sx={{
                    backgroundColor: colors.primary[400],
                  }}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="active">Hoạt động</MenuItem>
                  <MenuItem value="inactive">Không hoạt động</MenuItem>
                </Select>
              </FormControl>
              <Paper
                component="form"
                sx={{
                  p: "2px 4px",
                  display: "flex",
                  alignItems: "center",
                  width: 300,
                  backgroundColor: colors.primary[400],
                }}
                onSubmit={handleSearch}
              >
                <InputBase
                  sx={{ ml: 1, flex: 1 }}
                  placeholder="Tìm kiếm nhân viên (theo tên hoặc email)"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <IconButton type="submit" sx={{ p: "10px" }}>
                  <SearchIcon />
                </IconButton>
              </Paper>
              <Button
                variant="contained"
                color="success"
                startIcon={<AddIcon />}
                onClick={handleOpen}
              >
                Thêm mới nhân viên
              </Button>
            </Box>
          </Box>
        </Box>
        <Box sx={{ gridColumn: "span 12" }}>
          <Box
            height="75vh"
            sx={{
              "& .MuiDataGrid-root": {
                border: "none",
                width: "100%",
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
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px",
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
            ) : accounts.length === 0 ? (
              <Typography variant="h6" align="center" mt={4}>
                Không có tài khoản nào để hiển thị
              </Typography>
            ) : (
              <>
                <DataGrid
                  rows={accounts}
                  columns={columns}
                  getRowId={(row) => row._id}
                  pagination={false}
                  getRowHeight={() => 60}
                  sx={{
                    width: "100%",
                  }}
                  hideFooter={true}
                  sortingMode="server"
                  sortModel={sortModel}
                  onSortModelChange={handleSortModelChange}
                />
                <Box display="flex" justifyContent="center" mt={2}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                  />
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Box>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            fontWeight: "bold",
            fontSize: "1.3rem",
            textAlign: "center",
          }}
        >
          {isEdit ? "Chỉnh sửa tài khoản" : "Thêm mới tài khoản"}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Typography color="error" mb={2}>
              {error}
            </Typography>
          )}
          <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
            <img
              src={
                previewImage ||
                "/assets/default-avatar.png"
              }
              alt="Avatar"
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                objectFit: "cover",
                border: `2px solid ${colors.grey[100]}`,
              }}
            />
            <Box mt={1}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => fileInputRef.current.click()}
                sx={{ fontWeight: "bold" }}
              >
                Chọn ảnh
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setNewAccount({ ...newAccount, avatar: file });
                  setPreviewImage(file ? URL.createObjectURL(file) : null);
                }}
              />
            </Box>
          </Box>
          <TextField
            fullWidth
            margin="normal"
            label="Họ và tên"
            value={newAccount.fullName}
            onChange={(e) =>
              setNewAccount({ ...newAccount, fullName: e.target.value })
            }
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            type="email"
            value={newAccount.email}
            onChange={(e) =>
              setNewAccount({ ...newAccount, email: e.target.value })
            }
            required
          />
          {!isEdit && (
            <>
              <TextField
                fullWidth
                margin="normal"
                label="Mật khẩu"
                type="password"
                value={newAccount.password}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, password: e.target.value })
                }
                required
              />
              <TextField
                fullWidth
                margin="normal"
                label="Xác nhận mật khẩu"
                type="password"
                value={newAccount.confirmPassword}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, confirmPassword: e.target.value })
                }
                required
              />
            </>
          )}
          {isEdit && (
            <>
              <TextField
                fullWidth
                margin="normal"
                label="Mật khẩu mới (nếu muốn thay đổi)"
                type="password"
                value={newAccount.password}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, password: e.target.value })
                }
              />
              <TextField
                fullWidth
                margin="normal"
                label="Xác nhận mật khẩu mới"
                type="password"
                value={newAccount.confirmPassword}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, confirmPassword: e.target.value })
                }
              />
            </>
          )}
          <TextField
            fullWidth
            margin="normal"
            label="Số điện thoại"
            value={newAccount.phone}
            onChange={(e) =>
              setNewAccount({ ...newAccount, phone: e.target.value })
            }
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Nhóm quyền</InputLabel>
            <Select
              value={newAccount.role_id}
              onChange={(e) =>
                setNewAccount({ ...newAccount, role_id: e.target.value })
              }
              label="Nhóm quyền"
              required
            >
              {roleOptions.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  {role.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={newAccount.status}
              onChange={(e) =>
                setNewAccount({ ...newAccount, status: e.target.value })
              }
              label="Trạng thái"
            >
              <MenuItem value="active">Hoạt động</MenuItem>
              <MenuItem value="inactive">Không hoạt động</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            color="error"
            variant="contained"
            sx={{ fontWeight: "bold" }}
          >
            Hủy
          </Button>
          <Button
            onClick={isEdit ? handleUpdate : handleAdd}
            color="success"
            variant="contained"
            sx={{ fontWeight: "bold" }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : isEdit ? (
              "Cập nhật"
            ) : (
              "Thêm mới"
            )}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openDetail} onClose={handleCloseDetail} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            fontWeight: "bold",
            fontSize: "1.3rem",
            textAlign: "center",
          }}
        >
          Chi tiết tài khoản
        </DialogTitle>
        <DialogContent>
          {currentAccount ? (
            <Box>
              <Box display="flex" justifyContent="center" mb={2}>
                <img
                  src={
                    currentAccount.avatar ||
                    "/assets/default-avatar.png"
                  }
                  alt="Avatar"
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: `2px solid ${colors.grey[100]}`,
                  }}
                />
              </Box>
              <Box>
                <Typography variant="h5">
                  <strong>Họ và tên:</strong> {currentAccount.fullName || "N/A"}
                </Typography>
                <Typography variant="h5">
                  <strong>Email:</strong> {currentAccount.email || "N/A"}
                </Typography>
                <Typography variant="h5">
                  <strong>Số điện thoại:</strong> {currentAccount.phone || "N/A"}
                </Typography>
                <Typography variant="h5">
                  <strong>Chức vụ:</strong> {roles[currentAccount.role_id] || "N/A"}
                </Typography>
                <Typography variant="h5">
                  <strong>Trạng thái:</strong> {currentAccount.status === "active" ? "Hoạt động" : "Không hoạt động"}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Typography>Không có dữ liệu</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDetail}
            color="error"
            variant="contained"
            sx={{ fontWeight: "bold" }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openDeleteConfirm} onClose={handleCloseDeleteConfirm} maxWidth="xs" fullWidth>
        <DialogTitle
          sx={{
            fontWeight: "bold",
            fontSize: "1.3rem",
            textAlign: "center",
          }}
        >
          Xác nhận xóa tài khoản
        </DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc chắn muốn xóa tài khoản này không?</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDeleteConfirm}
            color="primary"
            variant="contained"
            sx={{ fontWeight: "bold" }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            sx={{ fontWeight: "bold" }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Xóa"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Team;