const base=process.env.SUPABASE_URL;
const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
function required(){if(!base||!key) throw new Error('Supabase is not configured');}
async function sb(path,options={}){required();const res=await fetch(base+'/rest/v1/'+path,{...options,headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',Prefer:'return=representation',...(options.headers||{})}});const text=await res.text();let data;try{data=JSON.parse(text)}catch{data={raw:text}}if(!res.ok)throw new Error(data.message||data.error||'Supabase request failed');return data;}
module.exports={sb};
