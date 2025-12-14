const SettingGeneral = require("../../models/settings-general.model");

//[GET] / api/v1/setting
module.exports.general = async (req, res) => {
    const settingGeneral = await SettingGeneral.findOne({});

    res.json(settingGeneral);
}