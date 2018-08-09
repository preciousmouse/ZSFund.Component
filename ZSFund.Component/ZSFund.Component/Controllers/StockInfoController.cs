using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ZSFund.Component.Entity.ResponseEntity;

namespace ZSFund.Component.Controllers
{
    [Produces("application/json")]
    [Route("api/StockInfo")]
    public class StockInfoController : Controller
    {
        // GET: api/StockInfo
        [HttpGet("GetStockInfo")]
        public List<StockInfo> GetStockInfo(string queryStr)
        {
            queryStr = queryStr.ToUpper();
            List<StockInfo> stocks = Cache.GetStockInfo();
            var filterStock= stocks.Where(f => f.StockCode.Contains(queryStr) || f.StockName.Contains(queryStr) || f.ChiNameAbbr.Contains(queryStr) || f.StockPinyin.Contains(queryStr)).ToList();
            return filterStock;
        }               
    }
}
