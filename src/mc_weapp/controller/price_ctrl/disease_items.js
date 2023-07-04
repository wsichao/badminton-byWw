let rp = require('request-promise');
module.exports = {

  async getList() {
    let options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      url: 'http://cms.juliye.com/document/diseaselist',
      json: true
    };
    const result = await rp(options);
    return result.data.map(item => {
      const items = item.diseases.map(c_item => {
        return {
          name: c_item
        }
      })
      return {
        "name": item.department_name,
        items
      }
    })
  },
  async getAction() {
    const items = await this.getList();
    return this.success({
      code: "200",
      msg: "",
      items
    })
  }
}