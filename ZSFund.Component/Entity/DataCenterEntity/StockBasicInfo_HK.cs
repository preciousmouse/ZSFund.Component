using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace ZSFund.Component.Entity.DataCenterEntity
{
    public partial class StockBasicInfo_HK
    {
        [Key]
        [StringLength(10)]
        public string StockCode { get; set; }

        [StringLength(100)]
        public string ChiNameAbbr { get; set; }

        [StringLength(20)]
        public string StockName { get; set; }

        [StringLength(10)]
        public string StockPinyin { get; set; }

        [StringLength(2)]
        public string Market { get; set; }

        public DateTime? InMarketDate { get; set; }

        public int? ListedState { get; set; }
    }
}
