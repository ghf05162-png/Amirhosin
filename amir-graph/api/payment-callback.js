const {sb}=require('./_supabase');
module.exports=async function(req,res){
 try{
  const {Authority,Status,order_id}=req.query||{};if(!order_id)return res.status(400).send('شناسه سفارش وجود ندارد.');
  const rows=await sb('orders?id=eq.'+encodeURIComponent(order_id));const order=rows[0];if(!order)return res.status(404).send('سفارش پیدا نشد.');
  if(Status!=='OK') {await sb('orders?id=eq.'+encodeURIComponent(order_id),{method:'PATCH',body:JSON.stringify({status:'failed'})});return res.redirect('/?payment=failed');}
  const payload={merchant_id:process.env.ZARINPAL_MERCHANT_ID,amount:Number(order.amount_toman)*10,authority:Authority};
  const r=await fetch('https://api.zarinpal.com/pg/v4/payment/verify.json',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const data=await r.json();
  if(data?.data?.code===100||data?.data?.code===101){await sb('orders?id=eq.'+encodeURIComponent(order_id),{method:'PATCH',body:JSON.stringify({status:'paid',payment_ref_id:String(data.data.ref_id||''),paid_at:new Date().toISOString()})});return res.redirect('/?payment=success&order_id='+encodeURIComponent(order_id));}
  await sb('orders?id=eq.'+encodeURIComponent(order_id),{method:'PATCH',body:JSON.stringify({status:'failed'})});return res.redirect('/?payment=failed');
 }catch(e){return res.status(500).send('خطا در تأیید پرداخت.');}
};
