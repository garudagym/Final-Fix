const https=require('https');
const http=require('http');
function postJson(url,headers,body){return new Promise((resolve,reject)=>{const u=new URL(url);const lib=u.protocol==='https:'?https:http;const req=lib.request({method:'POST',hostname:u.hostname,port:u.port||undefined,path:u.pathname+u.search,headers:Object.assign({'Content-Type':'application/json'},headers||{})},res=>{let data='';res.on('data',c=>data+=c);res.on('end',()=>{if(res.statusCode>=200&&res.statusCode<300)resolve(data);else reject(new Error('SMS provider returned '+res.statusCode+': '+data.slice(0,300)))})});req.on('error',reject);req.write(JSON.stringify(body));req.end()})}
async function sendSms({to,message,templateName,templateVariables=[]}){
 if(!to)return {sent:false,reason:'No phone number'};
 const provider=(process.env.SMS_PROVIDER||'none').toLowerCase();
 if(provider==='none')return {sent:false,reason:'SMS provider not configured'};
 if(provider==='msg91'){
   const authkey=process.env.SMS_API_KEY||process.env.MSG91_AUTHKEY;
   const templateId=process.env.MSG91_TEMPLATE_ID;
   const sender=process.env.SMS_FROM||process.env.MSG91_SENDER_ID;
   const url=process.env.SMS_API_URL||'https://control.msg91.com/api/v5/flow/';
   if(!authkey||!templateId||!sender)throw new Error('MSG91 configuration incomplete: SMS_API_KEY, MSG91_TEMPLATE_ID and SMS_FROM are required');
   const phone=String(to).replace(/[^\d]/g,'');
   const mobile=phone.length===10?'91'+phone:phone;
   const body={template_id:templateId,short_url:'0',recipients:[{mobiles:mobile,var1:message}]};
   await postJson(url,{authkey},body);
   return {sent:true,provider:'msg91'};
 }
 if(provider==='meta-whatsapp'){
   const token=process.env.META_ACCESS_TOKEN||process.env.SMS_API_KEY;
   const phoneNumberId=process.env.META_PHONE_NUMBER_ID;
   const version=process.env.META_API_VERSION||'v23.0';
   if(!token||!phoneNumberId)throw new Error('Meta WhatsApp configuration incomplete: META_ACCESS_TOKEN and META_PHONE_NUMBER_ID are required');
   const phone=String(to).replace(/[^\d]/g,'');
   const mobile=phone.length===10?'91'+phone:phone;
   const url=`https://graph.facebook.com/${version}/${phoneNumberId}/messages`;
   let body={messaging_product:'whatsapp',to:mobile,type:'text',text:{preview_url:false,body:message}};
   // Outside Meta's 24-hour customer-service window, WhatsApp requires an approved template.
   // Configure META_TEMPLATE_* in Render for proactive payment/renewal messages.
   if(templateName){
     body={messaging_product:'whatsapp',to:mobile,type:'template',template:{name:templateName,language:{code:process.env.META_TEMPLATE_LANGUAGE||process.env.META_DEFAULT_LANGUAGE||'en_US'},components:templateVariables.length?[{type:'body',parameters:templateVariables.map(v=>({type:'text',text:String(v)}))}]:[]}};
   }
   await postJson(url,{Authorization:'Bearer '+token},body);
   return {sent:true,provider:'meta-whatsapp',template:templateName||null};
 }
 if(provider==='generic'){
   if(!process.env.SMS_API_URL)return {sent:false,reason:'SMS_API_URL missing'};
   const headers={};if(process.env.SMS_API_KEY)headers.Authorization='Bearer '+process.env.SMS_API_KEY;
   await postJson(process.env.SMS_API_URL,headers,{to,message,from:process.env.SMS_FROM||'Garuda Fitness Zone'});return {sent:true};
 }
 if(provider==='twilio'){
   const sid=process.env.TWILIO_ACCOUNT_SID,token=process.env.TWILIO_AUTH_TOKEN,from=process.env.TWILIO_FROM;
   if(!sid||!token||!from)throw new Error('Twilio SMS configuration incomplete');
   const auth=Buffer.from(sid+':'+token).toString('base64');
   const params=new URLSearchParams({To:to,From:from,Body:message});
   return new Promise((resolve,reject)=>{const req=https.request({method:'POST',hostname:'api.twilio.com',path:'/2010-04-01/Accounts/'+sid+'/Messages.json',headers:{Authorization:'Basic '+auth,'Content-Type':'application/x-www-form-urlencoded','Content-Length':Buffer.byteLength(params.toString())}},res=>{let data='';res.on('data',c=>data+=c);res.on('end',()=>res.statusCode>=200&&res.statusCode<300?resolve({sent:true}):reject(new Error('Twilio returned '+res.statusCode+': '+data.slice(0,300))))});req.on('error',reject);req.write(params.toString());req.end()});
 }
 throw new Error('Unsupported SMS_PROVIDER: '+provider);
}
module.exports={sendSms};
