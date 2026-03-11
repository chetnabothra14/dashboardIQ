export function generateSampleData() {
  const products = ['Laptop','Phone','Tablet','Monitor','Headphones','Keyboard','Mouse','Webcam'];
  const regions  = ['North','South','East','West','Central'];
  const months   = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const monthlyData = months.map((m, i) => {
    const base = 3200000 + Math.sin(i*0.6)*1200000 + Math.random()*800000;
    const revenue = Math.round(base);
    const cost    = Math.round(revenue*(0.55+Math.random()*0.1));
    return { month:m, revenue, cost, profit:revenue-cost, orders:Math.round(revenue/14000) };
  });

  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const heatData = [];
  for (let d=0;d<7;d++) for (let h=0;h<24;h++) {
    let val=8;
    if(h>=9&&h<=12) val+=55+Math.random()*40;
    if(h>=12&&h<=14) val+=75+Math.random()*30;
    if(h>=17&&h<=20) val+=85+Math.random()*50;
    if(d>=5) val*=0.65;
    heatData.push({day:days[d],hour:h,value:Math.round(val)});
  }

  const productData = products.map(p=>({
    name:p, revenue:Math.round(1600000+Math.random()*6400000),
    units:Math.round(100+Math.random()*900), margin:Math.round(20+Math.random()*40)
  })).sort((a,b)=>b.revenue-a.revenue);

  const regionData = regions.map(r=>({
    region:r, sales:Math.round(2400000+Math.random()*5600000),
    target:Math.round(4000000+Math.random()*2400000), growth:Math.round(-5+Math.random()*30)
  }));

  const scatterData = Array.from({length:60},(_,i)=>({
    ads:Math.round(40000+Math.random()*360000), revenue:Math.round(400000+Math.random()*3600000+i*24000)
  }));

  const radarData = products.slice(0,6).map(p=>({product:p, Q1:Math.round(40+Math.random()*60), Q3:Math.round(40+Math.random()*60)}));

  const forecastData = [...monthlyData.slice(6)];
  const lastProfit = monthlyData[11].profit;
  ['Jan*','Feb*','Mar*'].forEach((m,i)=>forecastData.push({month:m,profit:Math.round(lastProfit*(1.05+i*0.03)+Math.random()*240000),forecast:true}));

  const totalRevenue=monthlyData.reduce((a,b)=>a+b.revenue,0);
  const totalProfit=monthlyData.reduce((a,b)=>a+b.profit,0);
  const totalOrders=monthlyData.reduce((a,b)=>a+b.orders,0);
  const avgMargin=Math.round((totalProfit/totalRevenue)*100);

  return {monthlyData,heatData,productData,regionData,scatterData,radarData,forecastData,totalRevenue,totalProfit,totalOrders,avgMargin};
}
