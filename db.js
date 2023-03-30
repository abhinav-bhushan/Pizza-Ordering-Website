const Pool=require('pg').Pool;

const pool=new Pool({
    user:"postgres",
    password:"abhinav99",
    database:"pizza_order",
    host:"localhost",
    port:5432


});

module.exports=pool
