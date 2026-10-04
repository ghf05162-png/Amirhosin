const {sb}=require('./_supabase');
module.exports=async function(req,res){
 try{
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  if(!process.env.ZARINPAL_MERCHANT_ID)return res.status(503).json({error:'درگاه پرداخت هنوز پیکربندی نشده است.'});
  const {order_id}=req.body||{};if(!order_id)return res.status(400).json({error:'شناسه سفارش الزامی است.'});
  const rows=await sb('orders?id=eq.'+encodeURIComponent(order_id));const order=rows[0];if(!order)return res.status(404).json({error:'سفارش پیدا نشد.'});
  const payload={merchant_id:process.env.ZARINPAL_MERCHANT_ID,amount:Number(order.amount_toman)*10,callback_url:(process.env.SITE_URL||'').replace(/\/$/,'')+'/api/payment-callback?order_id='+encodeURIComponent(order.id),description:'خرید از امیر گراف - سفارش '+order.id};
  const r=await fetch('https://api.zarinpal.com/pg/v4/payment/request.json',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const data=await r.json();
  if(data?.data?.code!==100)return res.status(502).json({error:data?.errors?.message||'خطا در ایجاد پرداخت'});
  await sb('orders?id=eq.'+encodeURIComponent(order.id),{method:'PATCH',body:JSON.stringify({payment_authority:data.data.authority})});
  return res.status(200).json({url:'https://www.zarinpal.com/pg/StartPay/'+data.data.authority});
 }catch(e){return res.status(500).json({error:e.message});}
};
