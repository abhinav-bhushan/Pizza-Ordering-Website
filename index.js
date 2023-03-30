const express=require('express')
const app=express()
const pool=require('./db')
const bcrypt=require('bcrypt')
const flash=require('connect-flash')
const session=require('express-session')
const hashed_password=async pwd=>{
    const result=await bcrypt.hash(pwd,10)
    return result
}

const password_validator=async (pwd,hashed)=>{
    const result=await bcrypt.compare(pwd,hashed)
    return result
}

app.set('view engine','ejs')
app.use(express.urlencoded({extended:true}))
app.use(session({
    secret:'thisisnotagoodsecret',
    resave:false,
    saveUninitialized:false

}))
app.use(flash())


app.get('/',(req,res)=>{
    res.render('welcome')
})


app.get('/login',(req,res)=>{
    res.render('login',{messages:req.flash('error')})
})

app.get('/register',(req,res)=>{
    res.render('register')
})

app.get('/logout',(req,res)=>{
    req.session.user=null;
    res.redirect('/login')
})

app.get('/home',async(req,res)=>{
    if(req.session.user)
    {
        const result=await pool.query("select * from pizza");
        array_pizza=[]
        array_topping=[]
        array_size=[]
        for(let row of result.rows)
        {
            array_pizza.push(row.pizza_id)
            if (!array_topping.includes(row.topping))
                array_topping.push(row.topping)
            if(!array_size.includes(row.size))
                array_size.push(row.size)
        }

        res.render("home",{username:req.session.user.toUpperCase(),array_pizza,array_topping,array_size})

    }

    else
    {
        req.flash('error','Please Login First')
        res.redirect('/login')
    }
})

app.get('/redirected-home',(req,res)=>{
        let username=req.session.username
        let array_pizza=[]
        let pizza=[]
        let array_topping=[]
        let array_size=[]
        console.log("We started here")

        for(let i of req.session.array_pizza)
            array_pizza.push(i)
        for(let i of req.session.array_topping)
            array_topping.push(i)
        for(let i of req.session.pizza)
            pizza.push(i)
        for(let i of req.session.array_size)
            array_size.push(i)
        
        req.session.username=null
        req.session.pizza=null
        req.session.array_pizza=null
        req.session.array_topping=null
        req.session.array_size=null 

        console.log(username)
        console.log(array_pizza)
        console.log(array_topping)
        console.log(array_size)
        console.log("We ended here")

        

        res.render('redirected_home',{username,pizza,array_pizza,array_topping,array_size})

})

app.post('/payment',async (req,res)=>{
    let username=req.session.user
    console.log(username)
    try{

        const result=await pool.query('select u.username,sum(p.price)+sum(t.topping_price) as total_price from user_login u inner join orders_table o on u.username=o.username inner join topping_id t on o.topping_id=t.topping_id inner join pizza p on p.pizza_id=o.pizza_id where u.username=$1 group by u.username',[username])
        console.log(result)
        let cost=result.rows[0].total_price;
        res.render('payment',{total:cost,username:username.toUpperCase()})
    }
    catch(err)
    {
        console.log(err)
    }


})

app.post('/register',async (req,res)=>{
    const {username,email,password1,password2,mobile}=req.body
    const errors=[]
    if(!username)
    {
        
        errors.push("Enter valid Username")
    }

    if(!password1 || !password2)
        errors.push("Enter valid Password")

    if(password1!==password2)
        errors.push("Passwords do not match")

    if(!mobile || mobile.toString().length<10)
        errors.push("Enter valid Mobile number")

    if (errors.length)
    {
        res.render('register',{errors})
    }
    
    // Form validation succesds
    else
    {
        try
        {
            const result=await pool.query("select count(*) from user_login where username=$1",[username])
            if(result.rows.count>0)
            {

                if(parseInt(result.rows[0].count,10)>0)
                {
                    errors.push("username already exists")
                    res.render('register',{errors})
                }
            }

            let  password=await hashed_password(password1)
            const result_2=await pool.query('INSERT INTO user_login(username,password,mobile,email) VALUES($1,$2,$3,$4)',[username,password,mobile,email])
            success=["Successfuly Registered"]
            res.render('register',{success})
        }
        
        catch(err)
        {
            errors.push(err)
            res.render('register',{errors})
        }
    }
})

app.post('/login',async (req,res)=>
{
    let {username,password}=req.body
    //Get data from database
    try
    {
        let database=await pool.query('select password from user_login where username=$1',[username])
        user=await pool.query('select count(*) from user_login where username=$1',[username])
        let result=await password_validator(password,database.rows[0].password)
        if(result && parseInt(user.rows[0].count,10)>0)
        {
            req.session.user=username;
            res.redirect('/home')
        }
        else
        {
            req.flash('error','Username or Password incorrect')
            res.redirect('/login')
        }
    }
    catch(err)
    {
        req.flash('error',err)
        res.redirect('/login')

    }
})

app.post('/show',async (req,res)=>{
    console.log('We started here show')
    if(req.session.user)
    {
        let username=req.session.user
        console.log(username)
        let type=req.body.type
        let pizza=[]
        console.log(type)
        if(type==="veg")
        {
            const result=await pool.query('select * from pizza where type=$1',[type])
            for (let row of result.rows)
                pizza.push({id:row.pizza_id,name:row.pizza,price:row.price,type:row.type,topping:row.topping,size:row.size})
        
        }

        if(type==="non-veg")
        {
            const result=await pool.query('select * from pizza where type=$1',[type])
            for (let row of result.rows)
                pizza.push({id:row.pizza_id,name:row.pizza,price:row.price,type:row.type,topping:row.topping,size:row.size})
        
        }

        if(type==="all")
        {
            const result=await pool.query('select * from pizza')
            for (let row of result.rows)
                pizza.push({id:row.pizza_id,name:row.pizza,price:row.price,type:row.type,topping:row.topping,size:row.size})
        
        }

        const result=await pool.query("select * from pizza");
        array_pizza=[]
        array_topping=[]
        array_size=[]
        for(let row of result.rows)
        {
            array_pizza.push(row.pizza_id)
            if (!array_topping.includes(row.topping))
                array_topping.push(row.topping)
            if(!array_size.includes(row.size))
                array_size.push(row.size)
        }
        
        req.session.username=username.toUpperCase();
        req.session.pizza=pizza
        req.session.array_pizza=array_pizza
        req.session.array_topping=array_topping
        req.session.array_size=array_size

        console.log("We ended here show")


        res.redirect('/redirected-home')//,{username:username.toUpperCase(),pizza,array_pizza,array_topping,array_size})
    }

    else
    {
        req.flash('error','Please Login First')
        res.redirect('/login')
    }
})

app.post('/home',async(req,res)=>{
    try{
        console.log('Started post home')
        let{pizza_id,topping,size}=req.body
        let username=req.session.user

        console.log(pizza_id)
        console.log(topping)
        console.log(size)
       
        //get topping_id
        const result=await pool.query('select t.topping_id from topping_id t where topping=$1',[topping])
        console.log(result)

        let topping_id=result.rows[0].topping_id
        console.log(topping_id)
        console.log(size)
        console.log(pizza_id)
        console.log(username)
        
        //Insert into Orders table
        const result_2=await pool.query('INSERT INTO ORDERS_TABLE VALUES($1,$2,$3,$4)',[username,pizza_id,topping_id,size])
        res.redirect('/home')
    }
    catch(err)
    {
        console.log(err)
        res.redirect('/home')
    }

})

app.post('/redirected-home',async(req,res)=>{
    try{
        let{pizza_id,topping,size}=req.body
        let username=req.session.user
       
        //get topping_id
        const result=await pool.query('select topping_id from topping_id where topping=$1',[topping])
        console.log(result.rows)

        let topping_id=result.rows[0].topping_id
        console.log(topping_id)
        console.log(size)
        console.log(pizza_id)
        console.log(username)
        
        //Insert into Orders table
        const result_2=await pool.query('INSERT INTO ORDERS_TABLE VALUES($1,$2,$3,$4)',[username,pizza_id,topping_id,size])
        res.render('/redirected-home')
    }
    catch(err)
    {
        console.log("It was an error")
        res.redirect('/home')
    }
})

app.listen(3000,()=>{
    console.log("Listening to port 3000");
})





