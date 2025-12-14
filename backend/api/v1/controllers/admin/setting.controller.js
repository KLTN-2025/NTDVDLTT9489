const SettingGeneral = require("../../models/settings-general.model");

//[GET] / admin/settings/general
module.exports.general = async (req, res) => {
    const settingGeneral = await SettingGeneral.findOne({});

    res.json(settingGeneral);
}

//[PATCH] /api/v1/admin/settings/general
module.exports.generalPatch = async (req, res) => {
    const permissions = req.roles.permissions;
    if (!permissions.includes("general")) {
        return res.json({
            code: 400,
            message: "Bạn không có quyền setting cài đặt chung"
        });
    } else {
        try {
            const settingGeneral = await SettingGeneral.findOne({});

            if (settingGeneral) {
                await SettingGeneral.updateOne({
                    _id: settingGeneral._id
                }, req.body)
            } else {
                const record = new SettingGeneral(req.body);
                await record.save();
            }
            res.json({
                code: 200,
                message: "Cập nhật thành công!",
            });
        } catch (error) {
            res.json({
                code: 500,
                message: "Lỗi" + error
            });
        }
    }
}

//[PATCH] /api/v1/admin/settings/slider
module.exports.slider = async (req, res) => {
    const permissions = req.roles.permissions;
    if (!permissions.includes("general")) {
        return res.json({
            code: 400,
            message: "Bạn không có quyền setting cài đặt chung"
        });
    } else {
        try {
            const settingGeneral = await SettingGeneral.findOne({});

            if (settingGeneral) {
                await SettingGeneral.updateOne({
                    _id: settingGeneral._id
                }, {
                    imageSliders: req.body.imageSliders
                })
            } else {
                const record = new SettingGeneral(req.body);
                await record.save();
            }
            res.json({
                code: 200,
                message: "Cập nhật thành công!",
            });
        } catch (error) {
            res.json({
                code: 500,
                message: "Lỗi" + error
            });
        }
    }
}