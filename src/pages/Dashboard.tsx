import { useEffect, useState } from 'react'
import { dashboardAPI } from '../services/api'
import { Package, Layers, BadgePercent, MessageSquare, Users, Eye } from 'lucide-react'
export default function Dashboard(){
  const [stats,setStats]=useState<any>(null)
  useEffect(()=>{ dashboardAPI.stats().then(r=>setStats(r.data)).catch(()=>{}) },[])
  const cards = [
    { label:'Total Products', value: stats?.cards?.totalProducts ?? '—', icon:<Package/>, color:'bg-amber-50 text-amber-700' },
    { label:'Categories', value: stats?.cards?.totalCategories ?? '—', icon:<Layers/>, color:'bg-pink-50 text-pink-700' },
    { label:'Offers', value: stats?.cards?.totalOffers ?? '—', icon:<BadgePercent/>, color:'bg-emerald-50 text-emerald-700' },
    { label:'Inquiries', value: stats?.cards?.totalInquiries ?? '—', icon:<MessageSquare/>, color:'bg-blue-50 text-blue-700' },
    { label:'Users', value: stats?.cards?.totalUsers ?? '—', icon:<Users/>, color:'bg-purple-50 text-purple-700' },
    { label:'Visitors', value: stats?.cards?.visitors ?? '12,483', icon:<Eye/>, color:'bg-rose-50 text-rose-700' },
  ]
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold mb-1" style={{fontFamily:'Playfair Display'}}>Dashboard</h1>
      <p className="text-gray-500 mb-6">Roop Rang – Luxury Cosmetics Overview</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map(c=>(
          <div key={c.label} className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-5 shadow-sm border border-[#f0e6d2] dark:border-[#333]">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${c.color}`}>{c.icon}</div>
            <div className="text-3xl font-semibold">{c.value}</div>
            <div className="text-sm text-gray-500 mt-1">{c.label}</div>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-5 mt-6">
        <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-5 border"><h3 className="font-semibold mb-3">Recent Inquiries</h3>
          <div className="space-y-3 text-sm">
            {(stats?.recentInquiries || [{name:'Priya S.', email:'priya@test.in', product:'Velvet Lipstick'}, {name:'Anjali M.', email:'anjali@test.in', product:'HD Foundation'}]).map((inq:any,i:number)=>(
              <div key={i} className="flex justify-between border-b pb-2 last:border-0"><div><div className="font-medium">{inq.name}</div><div className="text-gray-500 text-xs">{inq.email}</div></div><div className="text-xs text-right">{inq.product||'General'}</div></div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-5 border"><h3 className="font-semibold mb-3">Recent Products</h3>
          <div className="space-y-3 text-sm">
            {(stats?.recentProducts || [{name:'Velvet Matte Lipstick - Ruby Red', sellingPrice:599}, {name:'HD Flawless Foundation', sellingPrice:899}]).map((p:any,i:number)=>(
              <div key={i} className="flex justify-between"><span>{p.name}</span><span className="font-medium">₹{p.sellingPrice}</span></div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-6 bg-white dark:bg-[#1e1e1e] rounded-2xl p-5 border">
        <h3 className="font-semibold mb-2">Quick API Links</h3>
        <div className="text-xs text-gray-600 grid sm:grid-cols-2 gap-1">
          <div>POST /api/admin/login</div><div>GET /api/products</div><div>GET /api/products/featured</div><div>POST /api/inquiry</div><div>GET /api/categories</div><div>GET /api/dashboard</div>
        </div>
      </div>
    </div>
  )
}
