const express =require('express');
const path=require('path');
const app =express();
const axios=require('axios');
const cron =require('node-cron')
const connectmongo=require('./util/database');
const { default: mongoose } = require('mongoose');
app.set('view engine','ejs');
app.set('views','views');
app.use(express.static(path.join(__dirname,'public')));
app.use(express.json());
connectmongo();
////////////////////////////////////////////////////////SCHEMA///////////////////////////////////////////////////////////////////


const userschema=mongoose.Schema({
    name:String,
    last:Number,
    buy:Number,
    sell:Number,
    volume:Number,
    base_unit:String,
})
const User=mongoose.model('User',userschema);

///////////////////////////////////////////////////////DATA FETCH////////////////////////////////////////////////////////////////////////////////////
const fetch = async () => {
    try {
      const api = await axios.get('https://api.wazirx.com/api/v2/tickers');
      const data_all = api.data;
      const arr = Object.keys(data_all).slice(0, 10);
      await User.deleteMany({});
      const newUser = arr.map(pair => {
        const crpto = data_all[pair];
     return {
         name: crpto.name,
          last: parseFloat(crpto.last),
         buy: parseFloat(crpto.buy),
         sell:parseFloat(crpto.sell),
         volume: parseFloat(crpto.volume),
          base_unit: crpto.base_unit,
        };
      });
      await User.insertMany(newUser);
    console.log('Data updated in the database');

}

catch (error) {
      console.error('Error updating data:', error.message);
    }
  };
  cron.schedule('*/1 * * * *', () => {
    fetch();
  });
  fetch();


//////////////////////////////////////////////////////////////////////routes///////////////////////////////////////////////////////////////////////////


app.get('/',async(req,res)=>{
    const users= await User.find();
    res.render('index',{users})
})


app.listen(3000,function(req,res){
    console.log("contect to 3000 ");
})