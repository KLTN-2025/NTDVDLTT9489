import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    Checkbox,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getRightsGroups, updatePermissions } from "../rightsgroup/RightsgroupApi";
import { useAdminAuth } from "../../context/AdminContext";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import { useNavigate } from "react-router-dom";

// Danh sách tính năng và quyền
const FEATURES = [
    { name: "Tour", permissions: ["tour_view", "tour_create", "tour_edit", "tour_delete"] },
    { name: "Danh mục", permissions: ["category_view", "category_create", "category_edit", "category_delete"] },
    { name: "Đơn hàng", permissions: ["invoice_view", "invoice_create", "invoice_edit", "invoice_delete"] },
    { name: "Voucher", permissions: ["voucher_view", "voucher_create", "voucher_edit", "voucher_delete"] },
    { name: "Nhóm quyền", permissions: ["role_view", "role_create", "role_edit", "role_delete", "role_permissions"] },
    { name: "Tài khoản khách hàng", permissions: ["user_view", "user_create", "user_edit", "user_delete"] },
    { name: "Khách sạn", permissions: ["hotel_view", "hotel_create", "hotel_edit", "hotel_delete"] },
    { name: "Tài khoản nội bộ", permissions: ["account_view", "account_create", "account_edit", "account_delete"] },
    { name: "Hoá đơn", permissions: ["order_view", "order_edit", "order_delete"] },
    { name: "Review", permissions: ["review_view", "review_delete"] },
    { name: "Setting", permissions: ["general"] },
];

// Định nghĩa hành động và tên hiển thị
const ACTIONS = {
    view: "Xem",
    create: "Thêm mới",
    edit: "Chỉnh sửa",
    delete: "Xóa",
    permissions: "Phân quyền",
};

const DelegationControl = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { adminToken } = useAdminAuth();
    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [previousPermissions, setPreviousPermissions] = useState({});

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const response = await getRightsGroups({
                page: 1,
                limit: 100, // Lấy tất cả nhóm quyền
                sortKey: "createdAt",
                sortValue: "desc",
            });
            // console.log("fetchRoles response:", response);
            if (response && Array.isArray(response.roles)) {
                const formattedRoles = response.roles.map((role) => ({
                    id: role._id,
                    title: role.title,
                    permissions: role.permissions || [],
                }));
                setRoles(formattedRoles);
                const newPermissions = {};
                const newPreviousPermissions = {};
                FEATURES.forEach((feature) => {
                    newPermissions[feature.name] = {
                        feature: feature.name,
                        roles: formattedRoles.reduce((acc, role) => {
                            acc[role.title] = feature.permissions.reduce((permAcc, perm) => {
                                const action = perm.split("_")[1];
                                permAcc[action] = role.permissions.includes(perm);
                                return permAcc;
                            }, {});
                            return acc;
                        }, {}),
                    };
                    newPreviousPermissions[feature.name] = {
                        roles: formattedRoles.reduce((acc, role) => {
                            acc[role.title] = feature.permissions.reduce((permAcc, perm) => {
                                const action = perm.split("_")[1];
                                permAcc[action] = role.permissions.includes(perm);
                                return permAcc;
                            }, {});
                            return acc;
                        }, {}),
                    };
                });
                setPermissions(newPermissions);
                setPreviousPermissions(newPreviousPermissions);
                // console.log("Roles loaded:", formattedRoles);
                // console.log("Permissions structured:", newPermissions);
                if (formattedRoles.length === 0) {
                    toast.info("Không có nhóm quyền nào để hiển thị!", { position: "top-right" });
                }
            } else {
                setError("Dữ liệu nhóm quyền không hợp lệ!");
                toast.error("Dữ liệu nhóm quyền không hợp lệ!", { position: "top-right" });
                setRoles([]);
                setPermissions({});
                setPreviousPermissions({});
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Không thể tải danh sách nhóm quyền!";
            setError(errorMessage);
            toast.error(errorMessage, { position: "top-right" });
            console.error("Fetch roles error:", err.response?.data);
            if (err.response?.status === 401) {
                toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
                localStorage.removeItem("adminToken");
                navigate("/loginadmin");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = adminToken || localStorage.getItem("adminToken");
        if (token) {
            fetchRoles();
        } else {
            toast.error("Vui lòng đăng nhập để tiếp tục!", { position: "top-right" });
            setTimeout(() => {
                navigate("/loginadmin");
            }, 2000);
        }
    }, [adminToken, navigate]);

    const handlePermissionChange = (featureName, roleTitle, action) => {
        setPermissions((prevPermissions) => {
            const newPermissions = JSON.parse(JSON.stringify(prevPermissions));
            if (newPermissions[featureName]?.roles[roleTitle]) {
                newPermissions[featureName].roles[roleTitle][action] =
                    !newPermissions[featureName].roles[roleTitle][action];
            }
            return newPermissions;
        });
    };

    const handleSelectAllRole = (roleTitle) => {
        setPermissions((prevPermissions) => {
            const newPermissions = JSON.parse(JSON.stringify(prevPermissions));
            const allSelected = FEATURES.every((feature) =>
                Object.values(newPermissions[feature.name]?.roles[roleTitle] || {}).every((isChecked) => isChecked)
            );

            if (!allSelected) {
                setPreviousPermissions((prev) => {
                    const newPrevious = JSON.parse(JSON.stringify(prev));
                    FEATURES.forEach((feature) => {
                        if (!newPrevious[feature.name]) {
                            newPrevious[feature.name] = { roles: {} };
                        }
                        newPrevious[feature.name].roles[roleTitle] = JSON.parse(
                            JSON.stringify(newPermissions[feature.name]?.roles[roleTitle] || {})
                        );
                    });
                    return newPrevious;
                });
                FEATURES.forEach((feature) => {
                    if (newPermissions[feature.name]?.roles[roleTitle]) {
                        Object.keys(newPermissions[feature.name].roles[roleTitle]).forEach((action) => {
                            newPermissions[feature.name].roles[roleTitle][action] = true;
                        });
                    }
                });
            } else {
                FEATURES.forEach((feature) => {
                    if (
                        newPermissions[feature.name]?.roles[roleTitle] &&
                        previousPermissions[feature.name]?.roles[roleTitle]
                    ) {
                        Object.keys(newPermissions[feature.name].roles[roleTitle]).forEach((action) => {
                            newPermissions[feature.name].roles[roleTitle][action] =
                                previousPermissions[feature.name].roles[roleTitle][action] || false;
                        });
                    } else if (newPermissions[feature.name]?.roles[roleTitle]) {
                        Object.keys(newPermissions[feature.name].roles[roleTitle]).forEach((action) => {
                            newPermissions[feature.name].roles[roleTitle][action] = false;
                        });
                    }
                });
            }
            return newPermissions;
        });
    };

    const isAllRoleSelected = (roleTitle) => {
        return FEATURES.every((feature) =>
            Object.values(permissions[feature.name]?.roles[roleTitle] || {}).every((isChecked) => isChecked)
        );
    };

    const handleUpdatePermissions = async () => {
        setLoading(true);
        try {
            const permissionsData = {
                permissions: roles.map((role) => {
                    const rolePermissions = [];
                    FEATURES.forEach((feature) => {
                        feature.permissions.forEach((perm) => {
                            const action = perm.split("_")[1];
                            if (permissions[feature.name]?.roles[role.title]?.[action]) {
                                rolePermissions.push(perm);
                            }
                        });
                    });
                    return {
                        id: role.id,
                        permissions: rolePermissions,
                    };
                }),
            };
            // console.log("Permissions data to send:", permissionsData);
            const response = await updatePermissions(permissionsData);
            if (response.code === 200) {
                toast.success("Cập nhật phân quyền thành công!", { position: "top-right" });
                await fetchRoles();
            } else {
                const errorMessage = response.message || "Cập nhật phân quyền thất bại!";
                toast.error(errorMessage, { position: "top-right" });
                console.error("Update permissions failed:", response);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Cập nhật phân quyền thất bại!";
            toast.error(errorMessage, { position: "top-right" });
            console.error("Update permissions error:", err.response?.data);
            if (err.response?.status === 401) {
                toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
                localStorage.removeItem("adminToken");
                navigate("/loginadmin");
            }
        } finally {
            setLoading(false);
        }
    };

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
            <Typography variant="h2" color={colors.grey[100]} fontWeight="bold" mb={2}>
                Phân quyền
            </Typography>
            {error && (
                <Typography color="error" mb={2}>
                    {error}
                </Typography>
            )}
            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
                    <CircularProgress />
                </Box>
            ) : roles.length === 0 ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
                    <Typography variant="h4" color={colors.grey[100]}>
                        Không có nhóm quyền nào để hiển thị
                    </Typography>
                </Box>
            ) : (
                <>
                    <TableContainer component={Paper} sx={{ backgroundColor: colors.primary[400], border: "none" }}>
                        <Table sx={{ width: "100%", border: "none" }}>
                            <TableHead>
                                <TableRow sx={{
                                    backgroundColor: colors.blueAccent[700],
                                }}>
                                    <TableCell sx={{
                                        backgroundColor: colors.blueAccent[700],
                                        color: colors.grey[100],
                                        fontSize: "14px",
                                        fontWeight: "bold",
                                        borderBottom: "none",
                                    }}>
                                        Tính năng
                                    </TableCell>
                                    {roles.map((role) => (
                                        <TableCell
                                            align="center"
                                            key={role.id}
                                            sx={{
                                                backgroundColor: colors.blueAccent[700],
                                                color: colors.grey[100],
                                                fontSize: "14px",
                                                fontWeight: "bold",
                                                borderBottom: "none",
                                            }}
                                        >
                                            <Box display="flex" alignItems="center" gap={1} justifyContent="center">
                                                {role.title}
                                                <Checkbox
                                                    checked={isAllRoleSelected(role.title)}
                                                    onChange={() => handleSelectAllRole(role.title)}
                                                    disabled={loading}
                                                    sx={{
                                                        color: `${colors.greenAccent[200]} !important`,
                                                        "&.Mui-checked": {
                                                            color: `${colors.greenAccent[200]} !important`,
                                                        },
                                                    }}
                                                />
                                            </Box>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody sx={{ backgroundColor: colors.primary[400] }}>
                                {Object.values(permissions).map((permission) => (
                                    <React.Fragment key={permission.feature}>
                                        <TableRow>
                                            <TableCell
                                                colSpan={roles.length + 1}
                                                sx={{ fontWeight: "bold", color: colors.grey[100], borderBottom: "none" }}
                                            >
                                                {permission.feature}
                                            </TableCell>
                                        </TableRow>
                                        {FEATURES.find((f) => f.name === permission.feature).permissions.map(
                                            (perm) => {
                                                const action = perm.split("_")[1];
                                                return (
                                                    <TableRow key={`${permission.feature}-${action}`}>
                                                        <TableCell sx={{ color: colors.grey[100], borderBottom: "none", paddingLeft: "40px" }}>
                                                            {ACTIONS[action]}
                                                        </TableCell>
                                                        {roles.map((role) => (
                                                            <TableCell align="center" key={role.id} sx={{ borderBottom: "none" }}>
                                                                <Checkbox
                                                                    checked={
                                                                        permission.roles[role.title]?.[action] || false
                                                                    }
                                                                    onChange={() =>
                                                                        handlePermissionChange(
                                                                            permission.feature,
                                                                            role.title,
                                                                            action
                                                                        )
                                                                    }
                                                                    disabled={loading}
                                                                    sx={{
                                                                        color: `${colors.greenAccent[200]} !important`,
                                                                        "&.Mui-checked": {
                                                                            color: `${colors.greenAccent[200]} !important`,
                                                                        },
                                                                    }}
                                                                />
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                );
                                            }
                                        )}
                                    </React.Fragment>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Box mt={2} display="flex" justifyContent="flex-end">
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleUpdatePermissions}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : "Cập nhật"}
                        </Button>
                    </Box>
                </>
            )}
        </Box>
    );
};

export default DelegationControl;