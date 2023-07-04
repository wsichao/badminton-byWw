/**
 *
 * 生成用户小程序二维码
 *
 */

'user strict';

const weapp_service = Backend.service('mc_weapp','mc_weapp');

module.exports = {
    __rule: function (valid) {
        return valid.object({
          user_id: valid.string().required(),
        });
      },
    async postAction() {
        let qrcode = await weapp_service.get_weapp_qr_code(this.post.user_id);
        return this.success({
            code : '200',
            msg : '',
            data : qrcode
        });
        
    }
}
