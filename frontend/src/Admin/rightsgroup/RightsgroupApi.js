import api from "../../utils/api";

const BASE_URL = "http://localhost:3000/api/v1/admin/roles";

// Lấy danh sách nhóm quyền
export const getRightsGroups = async (params = {}) => {
    const response = await api.get(BASE_URL, { params });
    // console.log("getRightsGroups response:", response.data);
    return response.data;
};

// Tạo nhóm quyền mới
export const createRightsGroup = async (rightsGroupData) => {
    const response = await api.post(`${BASE_URL}/create`, rightsGroupData);
    // console.log("createRightsGroup response:", response.data);
    return response.data;
};

// Cập nhật nhóm quyền
export const updateRightsGroup = async (id, rightsGroupData) => {
    const response = await api.patch(`${BASE_URL}/edit/${id}`, rightsGroupData);
    // console.log("updateRightsGroup response:", response.data);
    return response.data;
};

// Xóa nhóm quyền
export const deleteRightsGroup = async (id) => {
    const response = await api.delete(`${BASE_URL}/delete/${id}`);
    // console.log("deleteRightsGroup response:", response.data);
    return response.data;
};

// Lấy chi tiết nhóm quyền
export const getRightsGroupDetail = async (id) => {
    const response = await api.get(`${BASE_URL}/detail/${id}`);
    // console.log("getRightsGroupDetail response:", response.data);
    return response.data;
};

// Cập nhật phân quyền
export const updatePermissions = async (permissionsData) => {
    const response = await api.patch(`${BASE_URL}/permissions`, permissionsData);
    // console.log("updatePermissions response:", response.data);
    return response.data;
};