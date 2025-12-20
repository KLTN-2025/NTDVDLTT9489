// Hook để kiểm tra quyền truy cập
import { useAdminAuth } from '../context/AdminContext';

export const usePermission = () => {
    const { admin } = useAdminAuth();

    /**
     * Kiểm tra xem user có permission cụ thể không
     * @param {string|string[]} requiredPermission - Một hoặc nhiều permission cần kiểm tra
     * @param {boolean} requireAll - Nếu true, cần có tất cả permissions. Nếu false, chỉ cần 1
     * @returns {boolean}
     */
    const hasPermission = (requiredPermission, requireAll = false) => {
        if (!admin || !admin.permissions) {
            return false;
        }

        // Nếu là string, convert thành array
        const permissionsToCheck = Array.isArray(requiredPermission) 
            ? requiredPermission 
            : [requiredPermission];

        if (requireAll) {
            // Cần có tất cả permissions
            return permissionsToCheck.every(perm => 
                admin.permissions.includes(perm)
            );
        } else {
            // Chỉ cần có ít nhất 1 permission
            return permissionsToCheck.some(perm => 
                admin.permissions.includes(perm)
            );
        }
    };

    /**
     * Kiểm tra quyền và trả về callback nếu có quyền, ngược lại hiển thị thông báo lỗi
     * @param {string|string[]} requiredPermission
     * @param {Function} callback - Function sẽ thực thi nếu có quyền
     * @param {string} errorMessage - Thông báo lỗi tùy chỉnh
     */
    const checkPermissionAndExecute = (requiredPermission, callback, errorMessage = "Bạn không có quyền truy cập") => {
        if (hasPermission(requiredPermission)) {
            callback();
        } else {
            // Import toast dynamically để tránh circular dependency
            import('react-toastify').then(({ toast }) => {
                toast.error(errorMessage, { position: "top-right" });
            });
        }
    };

    return {
        hasPermission,
        checkPermissionAndExecute,
        permissions: admin?.permissions || []
    };
};
