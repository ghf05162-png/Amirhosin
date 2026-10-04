const {sb}=require('./_supabase');
module.exports=async function(req,res){try{if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});const data=await sb('products?active=eq.true&order=created_at.desc');return res.status(200).json(data);}catch(e){return res.status(500).json({error:e.message});}};
