const mongoose = require('mongoose');
require('dotenv').config();
const controller = require('./controllers/pincodeController');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  const res = {
    json: (data) => {
      console.log('json', JSON.stringify(data, null, 2));
    },
    status(code) {
      this._status = code;
      return this;
    }
  };

  console.log('Testing getPincodes: state=MAHARASHTRA & district=Mumbai');
  await controller.getPincodes({ query: { state: 'MAHARASHTRA', district: 'Mumbai' } }, res);
  await mongoose.disconnect();
})();
