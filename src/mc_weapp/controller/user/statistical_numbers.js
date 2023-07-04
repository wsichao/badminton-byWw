let rp = require('request-promise');

module.exports = {
  async getResult(words) {
    let options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      qs: {
        diseasename: words
      },
      url: 'http://cms.juliye.com/document/diseasedata',
      json: true
    };
    return await rp(options);
  },
  async getAction() {
    const words = this.query.words;
    const res = await this.getResult(words);
    const data = res.data;
    const patients_number = data.number1;
    const experts_number = data.number2;
    const remaining_member_number = data.number3;
    const name = data.diseaseName;
    return this.success({
      code: "200",
      msg: "",
      data: {
        patients_number,
        experts_number,
        remaining_member_number,
        name
      }
    })
  }
}