require('dotenv').config();
const express = require('express');
const path = require('path');
const {
  server, Keypair, Asset, Operation, TransactionBuilder, Networks,
  BASE_FEE, Memo, createFundedAccount, loadAccount, submit, asset
} = require('./services/stellar');
const { ensureTrustline, payment } = require('./services/assets');
const { insertTx, getTxLog } = require('./services/db');

const app = express();
app.set('view engine','ejs');
app.set('views', path.join(__dirname,'views'));
app.use(express.static(path.join(__dirname,'public')));

const ASSET_CODE='HEALTHCOIN';
const state={issuer:null,smes:[],providers:[],employees:[]};

async function loadBalance(pub, issuerPub){
  const acct=await server.loadAccount(pub);
  const bal=acct.balances.find(b=>b.asset_code===ASSET_CODE && b.asset_issuer===issuerPub);
  return bal?bal.balance:'0';
}

async function bootstrap(){
  state.issuer=await createFundedAccount();
  const smeNames=['Ubuntu Works','CapeTech Fabrication','OceanFix Engineering'];
  for(const name of smeNames){
    const sme={name,kp:await createFundedAccount(),employees:[]};
    for(let i=0;i<2;i++){
      const emp={name:`${name} Emp${i}`,kp:await createFundedAccount(),sme:name};
      sme.employees.push(emp); state.employees.push(emp);
      await ensureTrustline(emp.kp.publicKey(),emp.kp.secret(),ASSET_CODE,state.issuer.publicKey());
    }
    state.smes.push(sme);
  }
  const providerNames=['HealthLink Pharmacy','CityCare Clinic'];
  for(const name of providerNames){
    const prov={name,kp:await createFundedAccount()};
    state.providers.push(prov);
    await ensureTrustline(prov.kp.publicKey(),prov.kp.secret(),ASSET_CODE,state.issuer.publicKey());
  }
  console.log('Issuer:',state.issuer.publicKey());
  console.log('SMEs:',state.smes.map(s=>`${s.name}: ${s.kp.publicKey()}`));
  console.log('Providers:',state.providers.map(p=>`${p.name}: ${p.kp.publicKey()}`));
  console.log('HealthStash running at http://127.0.0.1:'+(process.env.PORT||3000));
  console.log('Unified Dashboard: /dashboard');
}

app.get('/',(_req,res)=>res.redirect('/dashboard'));

app.get('/dashboard',async(_req,res)=>{
  const employerView=await Promise.all(state.smes.map(async(sme)=>({
    name:sme.name,wallet:sme.kp.publicKey(),
    employees:await Promise.all(sme.employees.map(async(emp)=>({
      name:emp.name,wallet:emp.kp.publicKey(),
      balance:await loadBalance(emp.kp.publicKey(),state.issuer.publicKey())
    })))
  })));
  const providerView=await Promise.all(state.providers.map(async(p)=>({
    name:p.name,wallet:p.kp.publicKey(),
    balance:await loadBalance(p.kp.publicKey(),state.issuer.publicKey())
  })));
  const employeesView=await Promise.all(state.employees.map(async(emp)=>({
    name:emp.name,sme:emp.sme,wallet:emp.kp.publicKey(),
    balance:await loadBalance(emp.kp.publicKey(),state.issuer.publicKey())
  })));
  res.render('dashboard',{smes:employerView,providers:providerView,employees:employeesView,assetCode:ASSET_CODE,txlog:getTxLog()});
});

app.get('/fund-payroll/:index',async(req,res)=>{
  try{
    const i=parseInt(req.params.index); const sme=state.smes[i];
    const issuerAcct=await loadAccount(state.issuer.publicKey());
    const a=asset(ASSET_CODE,state.issuer.publicKey());
    const txBuilder=new TransactionBuilder(issuerAcct,{fee:BASE_FEE,networkPassphrase:Networks.TESTNET});
    for(const emp of sme.employees){
      txBuilder.addOperation(Operation.payment({destination:emp.kp.publicKey(),asset:a,amount:'100'}));
    }
    txBuilder.addMemo(Memo.text(`PAYROLL:${sme.name}`));
    const tx=txBuilder.setTimeout(30).build(); tx.sign(state.issuer);
    const result=await submit(tx);
    insertTx('payroll',sme.name,'employees','100 each',result.hash);
    res.render('success',{txHash:result.hash,explorerUrl:`https://stellar.expert/explorer/testnet/tx/${result.hash}`});
  }catch(err){res.render('error',{message:err.message});}
});

app.get('/pay-provider/:empIndex/:provIndex/:amount',async(req,res)=>{
  try{
    const emp=state.employees[parseInt(req.params.empIndex)];
    const prov=state.providers[parseInt(req.params.provIndex)];
    const amount=req.params.amount;
    const result=await payment(emp.kp.publicKey(),emp.kp.secret(),prov.kp.publicKey(),ASSET_CODE,state.issuer.publicKey(),amount,`SERVICE:${prov.name}`);
    insertTx('payment',emp.name,prov.name,amount,result.hash);
    res.render('success',{txHash:result.hash,explorerUrl:`https://stellar.expert/explorer/testnet/tx/${result.hash}`});
  }catch(err){res.render('error',{message:err.message});}
});

bootstrap();
app.listen(process.env.PORT||3000);
