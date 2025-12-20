// Component wrapper để bảo vệ các elements theo permission
import React from 'react';
import { usePermission } from '../../hooks/usePermission';
import { Tooltip } from '@mui/material';

/**
 * Component bảo vệ các elements dựa trên permission
 * @param {string|string[]} permission - Permission(s) cần thiết để hiển thị/kích hoạt component
 * @param {boolean} requireAll - Nếu true, cần tất cả permissions. Default: false
 * @param {boolean} hideIfNoPermission - Nếu true, ẩn hoàn toàn. Nếu false, disable. Default: false
 * @param {React.ReactNode} children - Component con cần bảo vệ
 * @param {React.ReactNode} fallback - Component thay thế khi không có quyền
 * @param {string} tooltipMessage - Thông báo tooltip khi hover vào element bị disable
 */
const PermissionGuard = ({ 
    permission, 
    requireAll = false,
    hideIfNoPermission = false,
    children,
    fallback = null,
    tooltipMessage = "Bạn không có quyền truy cập chức năng này"
}) => {
    const { hasPermission } = usePermission();

    // Kiểm tra permission
    const hasAccess = hasPermission(permission, requireAll);

    // Nếu không có quyền
    if (!hasAccess) {
        // Ẩn hoàn toàn
        if (hideIfNoPermission) {
            return fallback;
        }

        // Disable element và hiển thị tooltip
        return (
            <Tooltip title={tooltipMessage} arrow>
                <span>
                    {React.cloneElement(children, {
                        disabled: true,
                        style: {
                            ...children.props.style,
                            cursor: 'not-allowed',
                            opacity: 0.5
                        }
                    })}
                </span>
            </Tooltip>
        );
    }

    // Có quyền - hiển thị bình thường
    return children;
};

export default PermissionGuard;
