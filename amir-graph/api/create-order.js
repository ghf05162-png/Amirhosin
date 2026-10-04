const {sb}=require('./_supabase');
function clean(v){return String(v||'').trim();}
module.exports=async function(req,res){
 try{
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  const {customer_name,mobile,email,items}=req.body||{};
  if(!clean(customer_name)||!clean(mobile)||!Array.isArray(items)||!items.length)return res.status(400).json({error:'اطلاعات سفارش ناقص است.'});
  const ids=items.map(x=>clean(x.product_id)).filter(Boolean);
  if(!ids.length)return res.status(400).json({error:'محصولی انتخاب نشده است.'});
  const products=await sb('products?id=in.('+ids.join(',')+')&active=eq.true');
  const map=new Map(products.map(p=>[p.id,p]));
  const normalized=[];let total=0;
  for(const item of items){const p=map.get(clean(item.product_id));const q=Math.max(1,Math.min(99,Number(item.quantity)||1));if(!p)continue;normalized.push({product_id:p.id,title:p.title,price_toman:p.price_toman,quantity:q});total+=p.price_toman*q;}
  if(!normalized.length||total<=0)return res.status(400).json({error:'محصولات معتبر نیستند.'});
  const order=(await sb('orders',{method:'POST',body:JSON.stringify({customer_name:clean(customer_name),mobile:clean(mobile),email:clean(email)||null,amount_toman:total,status:'pending'})}))[0];
  await sb('order_items',{method:'POST',body:JSON.stringify(normalized.map(x=>({...x,order_id:order.id})))});
  return res.status(200).json({order_id:order.id,amount_toman:total,message:'سفارش ایجاد شد.'});
 }catch(e){return res.status(500).json({error:e.message});}
};
