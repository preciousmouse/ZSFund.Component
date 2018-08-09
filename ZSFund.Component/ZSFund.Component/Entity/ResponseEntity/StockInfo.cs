using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ZSFund.Component.Entity.ResponseEntity
{
    public class StockInfo
    {
        public string StockCode { get; set; }

        public string StockName { get; set; }

        public string ChiNameAbbr { get; set; }

        public string Market { get; set; }
        public string StockPinyin { get; set; }
    }
}
