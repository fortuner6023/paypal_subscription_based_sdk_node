const express = require('express');
const ejs = require('ejs');
const paypal = require('paypal-rest-sdk');
const port = 3000

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AVu2VagBZvVqrvrJFRChYilbygYSYD_5i_UhOKgf12K3hwtmjSsNNJKWmd99sp_gqDnaN8zwJlrLmPv8',
  'client_secret': 'EMxgeuRPmIp-XRlITFkfWrYiNNi9eM8dW2sw72e4QtxPCNnYFSPMIMTsc915Jfk_2XKrqPJxryf1wvqO'
}); 

const app = express();

app.set('view engine', 'ejs');

app.get('/', (req, res) =>{console.log('hello from home page') 
res.render('index')});

app.post('/pay', (req, res) => {
  const create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "http://3.12.198.193:3000/success",
        "cancel_url": "http://3.12.198.193:3000/cancel"
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": "Subscribe for personal plan",
                "sku": "001",
                "price": "20.00",
                "currency": "USD",
                "quantity": 1
            }]
        },
        "amount": {
            "currency": "USD",
            "total": "20.00"
        },
        "description": "Personal Plan"
    }]
};

paypal.payment.create(create_payment_json, function (error, payment) {
  if (error) { 
      throw error;
  } else {
    console.log('payment',payment)
      for(let i = 0;i < payment.links.length;i++){
        if(payment.links[i].rel === 'approval_url'){
          res.redirect(payment.links[i].href);
        }
      }
  }
});

});
 
app.get('/success', (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
        "amount": {
            "currency": "USD",
            "total": "20.00"
        }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
        console.log(error.response);
        throw error;
    } else {
        console.log(JSON.stringify(payment));
        res.send('Success');
    }
});
});

app.get('/cancel', (req, res) => res.send('Cancelled'));

app.listen(port || 3000, () => console.log('Server Started on port 3000'));