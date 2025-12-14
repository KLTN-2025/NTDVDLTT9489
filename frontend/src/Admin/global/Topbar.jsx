import { Box, IconButton, useTheme, Typography } from "@mui/material";
import { useContext, useState, useEffect } from "react";
import { ColorModeContext, tokens } from "../../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminContext";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";

const Topbar = ({ setIsSidebar }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const { logoutAdmin } = useAdminAuth();
  const [currentTime, setCurrentTime] = useState("");
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const navigate = useNavigate();

  const updateTime = () => {
    const today = new Date();
    const weekday = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
    const day = weekday[today.getDay()];
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    const h = String(today.getHours()).padStart(2, "0");
    const m = String(today.getMinutes()).padStart(2, "0");
    const s = String(today.getSeconds()).padStart(2, "0");
    const nowTime = `${h} giờ ${m} phút ${s} giây`;
    const todayDate = `${day}, ${dd}/${mm}/${yyyy}`;
    setCurrentTime(`${todayDate} - ${nowTime}`);
  };

  useEffect(() => {
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSettings = () => {
    navigate("/admin/form");
  };

  const handleOpenLogoutDialog = () => {
    setOpenLogoutDialog(true);
  };

  const handleCloseLogoutDialog = () => {
    setOpenLogoutDialog(false);
  };

  const handleConfirmLogout = () => {
    logoutAdmin();
    setOpenLogoutDialog(false);
  };

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      p={2}
      backgroundColor={colors.primary[400]} // Add this line to match Sidebar background
    >
      <Box display="flex" backgroundColor={colors.primary[400]} borderRadius="3px"></Box>
      <Box display="flex" justifyContent="flex-end" mt={1}>
        <Typography variant="h5" color={colors.grey[100]}>
          {currentTime}
        </Typography>
      </Box>
      <Box display="flex">
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
        </IconButton>
        <IconButton onClick={handleSettings}>
          <PersonOutlinedIcon />
        </IconButton>
        <IconButton onClick={handleOpenLogoutDialog}>
          <LogoutIcon />
        </IconButton>
      </Box>

      {/* Dialog xác nhận đăng xuất */}
      <Dialog
        open={openLogoutDialog}
        onClose={handleCloseLogoutDialog}
        aria-labelledby="logout-dialog-title"
      >
        <DialogTitle
          id="logout-dialog-title"
          sx={{ fontWeight: "bold", fontSize: "1.5rem" }}
        >
          Xác nhận đăng xuất
        </DialogTitle>
        <DialogContent>
          <Box display="flex" alignItems="center" gap={1}>
            <HelpOutlineIcon sx={{ color: "#1976d2" }} />
            <Typography>Bạn có chắc chắn muốn đăng xuất không?</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLogoutDialog} color="primary">
            Hủy
          </Button>
          <Button onClick={handleConfirmLogout} color="error" variant="contained">
            Đồng ý
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Topbar;