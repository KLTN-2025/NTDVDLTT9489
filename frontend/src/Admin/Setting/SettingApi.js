import api from "../../utils/api";

const BASE_URL = "http://localhost:3000/api/v1/admin/settings";

// Lấy thông tin web 
export const getAdminInfo = async (id) => {
    try {
        const response = await api.get(`${BASE_URL}`);
        // console.log("getAdminInfo response:", JSON.stringify(response.data, null, 2));
        const account = response.data.find(acc => acc._id === id);
        if (!account) {
            throw new Error("Không tìm thấy website với ID: " + id);
        }
        return {
            code: 200,
            message: "Lấy thông tin website thành công",
            data: account
        };
    } catch (error) {
        console.error("getAdminInfo error:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
        });
        throw error;
    }
};

// Cập nhật thông tin website
export const updateAdminInfo = async (id, formData) => {
    try {
        const response = await api.patch(`${BASE_URL}/edit/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        // console.log("updateAdminInfo response:", JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error("updateAdminInfo error:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
        });
        throw error;
    }
};

// Lấy thông tin cài đặt chung
export const getGeneralSettings = async () => {
    try {
        const response = await api.get(`${BASE_URL}/general`);
        // console.log("getGeneralSettings response:", response.data);
        return response.data;
    } catch (error) {
        console.error("getGeneralSettings error:", error);
        throw error;
    }
};

// Cập nhật thông tin cài đặt chung (không bao gồm imageSliders)
export const updateGeneralSettings = async (data) => {
    try {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (key === 'logo' && data[key] instanceof File) {
                formData.append('logo', data[key]);
            } else if (key !== 'imageSliders') {
                formData.append(key, data[key]);
            }
        });

        const response = await api.patch(`${BASE_URL}/general`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        // console.log("updateGeneralSettings response:", response.data);
        return response.data;
    } catch (error) {
        console.error("updateGeneralSettings error:", error);
        throw error;
    }
};

// Cập nhật banner (imageSliders)
export const updateSliderSettings = async (imageSliders) => {
    try {
        // Fetch current settings to get existing imageSliders
        const currentSettings = await getGeneralSettings();
        const currentImageSliders = Array.isArray(currentSettings.imageSliders) ? currentSettings.imageSliders : [];

        const formData = new FormData();
        const newFiles = [];

        // Collect new files
        imageSliders.forEach(item => {
            if (item instanceof File) {
                newFiles.push(item);
            }
        });

        // Append new files for upload
        newFiles.forEach(file => {
            formData.append('imageSliders', file);
        });

        // If there are no new files, send the updated imageSliders list
        if (newFiles.length === 0) {
            imageSliders.forEach(item => {
                formData.append('imageSliders', item);
            });
        }

        // Log FormData for debugging
        // console.log("updateSliderSettings FormData:", [...formData.entries()]);

        const response = await api.patch(`${BASE_URL}/slider`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        // console.log("updateSliderSettings response:", response.data);

        // Fetch updated settings to get the new imageSliders list
        const updatedSettings = await getGeneralSettings();
        const updatedImageSliders = Array.isArray(updatedSettings.imageSliders) ? updatedSettings.imageSliders : [];

        // If there were new files, merge the existing URLs with the updated list
        if (newFiles.length > 0) {
            const existingUrls = imageSliders.filter(item => typeof item === 'string');
            const newImageSliders = [...existingUrls, ...updatedImageSliders];

            // Send a second update with the merged list
            const finalFormData = new FormData();
            newImageSliders.forEach(url => {
                finalFormData.append('imageSliders', url);
            });

            // console.log("Final updateSliderSettings FormData:", [...finalFormData.entries()]);
            const finalResponse = await api.patch(`${BASE_URL}/slider`, finalFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            // console.log("Final updateSliderSettings response:", finalResponse.data);
            return finalResponse;
        }

        return response;
    } catch (error) {
        console.error("updateSliderSettings error:", error);
        throw error;
    }
};