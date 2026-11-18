const products = [
  ['banana','Banana prata','Frutas',8.99,'BN'], ['lemon','Limão tahiti','Frutas',6.49,'LM'],
  ['eggs','Ovos caipiras','Mercado',15,'OV'], ['milk','Leite integral','Mercado',6.9,'LT'],
  ['cheese','Queijo minas','Laticínios',24.9,'QM'], ['herbs','Ervas frescas','Ervas',5,'ER'],
  ['oil','Óleo de coco ozonizado','Bem-estar',39.9,'OC'], ['vital','Vitalix gotas','Bem-estar',49.9,'VG']
].map(([id,name,cat,price,visual]) => ({id,name,cat,price,visual}));
let active = 'Todos';
let cart = JSON.parse(localStorage.getItem('natyCart') || '{}');
const br = value => value.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});

function layout(){
  document.body.insertAdjacentHTML('beforeend','<aside class="drawer" id="drawer"><div class="drawer-head"><h2>Seu carrinho</h2><button class="close" onclick="toggleCart()">×</button></div><div class="items" id="items"></div><div class="total"><span>Total</span><span id="total"></span></div><a class="primary wide" href="pedido.html">Fazer solicitação</a></aside><div class="toast" id="toast"></div>');
  document.querySelectorAll('.cart').forEach(button => button.onclick = toggleCart);
  save();
}
function toggleCart(){document.querySelector('#drawer').classList.toggle('open')}
function save(){
  localStorage.setItem('natyCart',JSON.stringify(cart));
  document.querySelectorAll('.count').forEach(item => item.textContent=Object.values(cart).reduce((a,b)=>a+b,0));
  renderCart();
}
function add(id){cart[id]=(cart[id]||0)+1;save();toast('Produto adicionado ao carrinho.')}
function change(id,amount){cart[id]=(cart[id]||0)+amount;if(cart[id]<=0)delete cart[id];save()}
function renderCart(){
  const entries=Object.entries(cart), total=entries.reduce((sum,[id,qty])=>sum+products.find(p=>p.id===id).price*qty,0);
  document.querySelector('#items').innerHTML=entries.length?entries.map(([id,qty])=>{const p=products.find(item=>item.id===id);return `<div class="item"><span><b>${p.name}</b><br><small>${br(p.price)}</small></span><span class="qty"><button onclick="change('${id}',-1)">−</button>${qty}<button onclick="change('${id}',1)">+</button></span></div>`}).join(''):'<p>Seu carrinho está vazio.</p>';
  document.querySelector('#total').textContent=br(total);
}
function renderCatalog(target,allowed){
  const search=document.querySelector('#search'), filters=document.querySelector('#filters');
  const selected=products.filter(p=>!allowed||allowed.includes(p.cat));
  const categories=['Todos',...new Set(selected.map(p=>p.cat))];
  if(filters)filters.innerHTML=categories.map(category=>`<button class="filter ${active===category?'active':''}" onclick="active='${category}';renderCatalog('${target}',${JSON.stringify(allowed)})">${category}</button>`).join('');
  function draw(){
    const term=(search?.value||'').toLowerCase();
    const list=selected.filter(p=>(active==='Todos'||p.cat===active)&&p.name.toLowerCase().includes(term));
    document.querySelector('#'+target).innerHTML=list.map(p=>`<article class="product"><div class="visual" aria-label="Imagem ilustrativa de ${p.name}">${p.visual}</div><h3>${p.name}</h3><small>${p.cat}</small><div class="row"><b>${br(p.price)}</b><button class="add" onclick="add('${p.id}')" aria-label="Adicionar ${p.name}">+</button></div></article>`).join('')||'<p>Nada encontrado. Tente outro termo.</p>';
  }
  if(search)search.oninput=draw;
  draw();
}
function toast(message){const element=document.querySelector('#toast');element.textContent=message;element.classList.add('show');setTimeout(()=>element.classList.remove('show'),2200)}
function sendOrder(event){
  event.preventDefault(); const entries=Object.entries(cart);
  if(!entries.length)return toast('Adicione produtos antes de enviar.');
  const name=document.querySelector('#name').value, delivery=document.querySelector('#delivery').value, address=document.querySelector('#address').value;
  const list=entries.map(([id,qty])=>{const p=products.find(item=>item.id===id);return `• ${qty}x ${p.name} — ${br(p.price*qty)}`}).join('\n');
  const total=entries.reduce((sum,[id,qty])=>sum+products.find(p=>p.id===id).price*qty,0);
  const message=`Olá, Naty Ervas! Quero fazer este pedido:%0A%0A${encodeURIComponent(list)}%0A%0ATotal dos produtos: ${encodeURIComponent(br(total))}%0ACliente: ${encodeURIComponent(name)}%0AOpção: ${encodeURIComponent(delivery)}%0AEndereço: ${encodeURIComponent(address||'a combinar')}%0A%0APor favor, confirme estoque e taxa de entrega. Pagamento a combinar.`;
  open(`https://wa.me/5561993699196?text=${message}`,'_blank');
}
document.addEventListener('DOMContentLoaded',layout);

