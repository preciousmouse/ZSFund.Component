using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ZSFund.Component.Entity.DataCenterEntity;
using ZSFund.Component.Entity.ResponseEntity;

namespace ZSFund.Component
{
    public class Cache
    {
        public static List<StockInfo> stockInfos = new List<StockInfo>();
        public static DateTime stockInfoLastUpdateDate = DateTime.Now;
        public static List<StockInfo> GetStockInfo()
        {
            DateTime now = DateTime.Now;
            TimeSpan ts = now - stockInfoLastUpdateDate;
            if ((stockInfos.Count == 0) || (ts.TotalHours >= 24))
            {
                using (MyDbContext db = new MyDbContext())
                {
                    var stockInfoList = db.StockBasicInfo.AsNoTracking().Select(f => new StockInfo() { StockCode = f.StockCode, StockName = f.StockName, Market = f.Market, ChiNameAbbr = f.ChiNameAbbr, StockPinyin = f.StockPinyin }).ToList();
                    var stockInfoListHK = db.StockBasicInfo_HK.AsNoTracking().Select(f => new StockInfo() { StockCode = f.StockCode, StockName = f.StockName, Market = f.Market, ChiNameAbbr = string.IsNullOrEmpty(f.ChiNameAbbr) ? "" : f.ChiNameAbbr, StockPinyin = f.StockPinyin }).ToList();
                    stockInfoList.AddRange(stockInfoListHK);
                    stockInfos = stockInfoList;
                    stockInfoLastUpdateDate = DateTime.Now;
                }
            }

            return stockInfos;
        }
    }
}
